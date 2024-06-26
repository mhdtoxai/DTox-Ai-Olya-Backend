const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const sendTextWithPreview = require('../../services/Wp-Envio-Msj/sendTextWithPreview');
const handleFirstNightChallenge = require('./handleFirstNightChallenge');

const handleFirstDayChallenge = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Enviar segundo mensaje
    const secondMessage = idioma === 'ingles' ?
      "You will not use your vape during the first hour of the morning. It's as simple as that!" :
      "No tomarás tu vapeador durante la primera hora de la mañana. ¡Tan sencillo como eso!";
    await sendMessage(senderId, secondMessage);
    await delay(2000);  
    // Enviar tercer mensaje
    const thirdMessage = idioma === 'ingles' ?
      "After the first hour, it's up to you." :
      "Después de la primera hora, tú decides.";
    await sendMessage(senderId, thirdMessage);
    await delay(5000); 
    // Enviar cuarto mensaje
    const fourthMessage = idioma === 'ingles' ?
      "Sounds silly? I assure you it is not. In fact, this first step is the most important. Thousands of users have proven why." :
      "¿Suena tonto? Te aseguro que no lo es. De hecho, este primer paso es el más importante. Miles de usuarios han demostrado el por qué.";
    await sendMessage(senderId, fourthMessage);
    await delay(2000);  
    // Enviar el video incrustado con texto de vista previa
    const videoUrl = 'https://www.youtube.com/watch?v=tgUULcNiBjE';
    const videoPreviewText = idioma === 'ingles' ?
      `Here is a 1-minute video explaining the science behind this step: ${videoUrl}` :
      `Aquí te dejo un video de 1 minuto con la ciencia que explica la importancia de este paso: ${videoUrl}`;
    await sendTextWithPreview(senderId, videoPreviewText);
    await delay(2000);  
    // Enviar el mensaje final
    const finalMessage = idioma === 'ingles' ?
      "Watch it when you have a chance. In the meantime, I won't interrupt you anymore. Remember, do your normal day today (vape, play, sing and jump). You start tomorrow. I'll write you soon." :
      "Míralo cuando tengas oportunidad. Mientras tanto, no te interrumpo más. Recuerda, hoy haz tu día normal (vapea, juega, canta y brinca). Comienzas mañana. Te escribo pronto.";
    await sendMessage(senderId, finalMessage);
    await delay(2000); 
    // Actualizar el estado después de enviar el mensaje del reto
    await userService.updateUser(senderId, { estado: 'primerdianoche' });
    userContext[senderId].estado = 'primerdianoche';
    console.log(`Estado en contexto actualizado a ${userContext[senderId].estado}`);


    // Programar el reto de la noche del primer día
    await handleFirstNightChallenge(senderId);

  } catch (error) {
    console.error('Error al manejar el nuevo reto:', error);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};


// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


module.exports = handleFirstDayChallenge;
