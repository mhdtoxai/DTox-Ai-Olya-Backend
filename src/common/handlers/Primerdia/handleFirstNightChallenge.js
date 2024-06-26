const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendImageMessage = require('../../services/Wp-Envio-Msj/sendImageMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');

const handleFirstNightChallenge = async (senderId) => {
  try {
   // Obtener la información del usuario incluyendo el nombre
   const { idioma, estado, nombre } = await getUserInfo(senderId);
   console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Enviar el GIF de YAWN
    await sendImageMessage(senderId, 'https://t2.ea.ltmcdn.com/es/posts/8/3/7/por_que_a_los_gatos_les_gusta_dormir_en_lugares_altos_23738_orig.jpg');
    await delay(2000); 
    // Enviar primer mensaje
    const firstMessage = idioma === 'ingles' ?
      "It's almost time to sleep. Just stopped by to say good night :)" :
      "Ya casi es hora de dormir. Sólo pasé por aquí para decirte buenas noches :)";
    await sendMessage(senderId, firstMessage);
    await delay(2000); 
    // Enviar segundo mensaje
    const secondMessage = idioma === 'ingles' ?
      "Good luck tomorrow with your first challenge. If you have any questions, let me know ;)" :
      "Mucha suerte mañana en tu primer reto. Si tienes alguna duda, avísame ;)";
    await sendMessage(senderId, secondMessage);
    await delay(2000); 
    // Enviar tercer mensaje
    const thirdMessage = idioma === 'ingles' ?
      "Bye!" :
      "¡Bye!";
    await sendMessage(senderId, thirdMessage);

  } catch (error) {
    console.error('Error al manejar el reto de la noche:', error);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};


// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


module.exports = handleFirstNightChallenge;
