const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendStickerMessage = require('../../services/Wp-Envio-Msj/sendStickerMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');

const handleFirstNightChallenge = async (senderId) => {
  try {
   // Obtener la información del usuario incluyendo el nombre
   const { idioma, estado, nombre } = await getUserInfo(senderId);
   console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Enviar el GIF de YAWN
    await sendStickerMessage(senderId, '482161877680974');
    await delay(2000); 
    // Enviar primer mensaje
    const firstMessage = idioma === 'ingles' ?
      `${nombre}, It's almost time to sleep. Just stopped by to say good night :)`:
      `${nombre}, ya casi es hora de dormir. Sólo pasé por aquí para desearte las buenas noches : )`;

    await sendMessage(senderId, firstMessage);
    await delay(2000); 
    // Enviar segundo mensaje
    const secondMessage = idioma === 'ingles' ?
      "Good luck tomorrow with your first challenge. If you have any questions, let me know ;)" :
      "Mucha suerte mañana en tu primer reto. Si tienes alguna duda, avísame ;)";
    await sendMessage(senderId, secondMessage);
 
  } catch (error) {
    console.error('Error al manejar el reto de la noche:', error);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};


// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


module.exports = handleFirstNightChallenge;
