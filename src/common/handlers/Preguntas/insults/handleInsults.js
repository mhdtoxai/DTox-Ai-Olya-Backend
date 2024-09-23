// handleInsults.js

const sendMessage = require('../../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../../services/getUserInfo');
const containsInsult = require('./containsInsult'); // Importar la función para detectar insultos

const handleInsults = async (senderId, messageText) => {
  try {
    // Primero, verificar si el mensaje contiene un insulto
    if (containsInsult(messageText)) {
      // Solo si se detecta un insulto, obtenemos la información del usuario para saber el idioma
      const { idioma } = await getUserInfo(senderId);

      const response = idioma === 'ingles'
        ? "Sorry, I'm here just to help you quit vaping. Glad to assist"
        : "Lo siento, estoy aquí únicamente para ayudarte a dejar de vapear.";
      await sendMessage(senderId, response);
      return true; // Terminar la función si se detecta un insulto
    }

    // Si no se detectan insultos, continuar con el procesamiento normal
    return false;
  } catch (error) {
    console.error('Error al manejar insultos:', error);
    return false;
  }
};

module.exports = handleInsults;

