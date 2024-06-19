const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const sendImageMessage = require('../services/Wp-Envio-Msj/sendImageMessage');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext');
const sendTextWithPreview = require('../services/Wp-Envio-Msj/sendTextWithPreview');

const handleFirstDayChallenge = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Enviar el imagen
    await sendImageMessage(senderId, 'https://img.freepik.com/vector-premium/copa-ganador-felicidades-premio-triunfo-icono-victoria-ilustracion_100456-1422.jpg');

    // Enviar primer mensaje
    const firstMessage = idioma === 'ingles' ?
      "Your first challenge begins tomorrow." :
      "Tu primer reto comienza mañana.";
    await sendMessage(senderId, firstMessage);

    // Enviar segundo mensaje
    const secondMessage = idioma === 'ingles' ?
      "You will not use your vape during the first hour of the morning. It's as simple as that!" :
      "No tomarás tu vapeador durante la primera hora de la mañana. ¡Tan sencillo como eso!";
    await sendMessage(senderId, secondMessage);

    // Enviar tercer mensaje
    const thirdMessage = idioma === 'ingles' ?
      "After the first hour, it's up to you." :
      "Después de la primera hora, tú decides.";
    await sendMessage(senderId, thirdMessage);

    // Enviar cuarto mensaje
    const fourthMessage = idioma === 'ingles' ?
      "Sounds silly? I assure you it is not. In fact, this first step is the most important. Thousands of users have proven why." :
      "¿Suena tonto? Te aseguro que no lo es. De hecho, este primer paso es el más importante. Miles de usuarios han demostrado el por qué.";
    await sendMessage(senderId, fourthMessage);

    // Enviar el video incrustado con texto de vista previa
    const videoUrl = 'https://www.youtube.com/watch?v=tgUULcNiBjE';
    const videoPreviewText = idioma === 'ingles' ?
      `Here is a 1-minute video explaining the science behind this step: ${videoUrl}` :
      `Aquí te dejo un video de 1 minuto con la ciencia que explica la importancia de este paso: ${videoUrl}`;
    await sendTextWithPreview(senderId, videoPreviewText);

    // Enviar el mensaje final
    const finalMessage = idioma === 'ingles' ?
      "Watch it when you have a chance. In the meantime, I won't interrupt you anymore. Remember, do your normal day today (vape, play, sing and jump). You start tomorrow. I'll write you soon." :
      "Míralo cuando tengas oportunidad. Mientras tanto, no te interrumpo más. Recuerda, hoy haz tu día normal (vapea, juega, canta y brinca). Comienzas mañana. Te escribo pronto.";
    await sendMessage(senderId, finalMessage);

    // Actualizar el estado después de enviar el mensaje del reto
    await userService.updateUser(senderId, { estado: 'primerdia' });
    userContext[senderId].estado = 'primerdia';
    console.log(`Estado en contexto actualizado a ${userContext[senderId].estado}`);

  } catch (error) {
    console.error('Error al manejar el nuevo reto:', error);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

module.exports = handleFirstDayChallenge;
