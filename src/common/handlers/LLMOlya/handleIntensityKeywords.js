const userService = require('../../services/userService');
const getUserInfo = require('../../services/getUserInfo');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');

const handleIntensityKeywords = async (senderId, receivedMessage) => {
  try {
    // Palabras clave relacionadas con la intensidad
    const keywords = ['intensidad', 'intensity'];
    const messageLowerCase = receivedMessage.toLowerCase();

    // Obtener información del usuario
    const { idioma } = await getUserInfo(senderId); // Idioma del usuario (español o inglés)

    // 1. Verificar si el mensaje es exactamente alguna de las palabras clave
    const isKeywordMatch = keywords.some(keyword => messageLowerCase === keyword);

    if (isKeywordMatch) {
      // Botones adaptados al idioma
      const buttons = idioma === 'ingles'
        ? [
            { id: 'HIGH01', title: 'High' },
            { id: 'MEDIUM02', title: 'Medium' },
            { id: 'LOW03', title: 'Low' }
          ]
        : [
            { id: 'ALTO01', title: 'Alto' },
            { id: 'MEDIO02', title: 'Medio' },
            { id: 'BAJO03', title: 'Bajo' }
          ];

      const message = idioma === 'ingles'
        ? 'Please select the intensity level.'
        : 'Por favor selecciona el nivel de intensidad.';

      await sendMessageTarget(senderId, message, buttons);
      return true; // Indica que se manejó una palabra clave de intensidad
    }

    // 2. Verificar si el mensaje es la selección de un nivel de intensidad
    const intensityMap = {
      HIGH01: 'high', MEDIUM02: 'medium', LOW03: 'low',   // Inglés
      ALTO01: 'alto', MEDIO02: 'medio', BAJO03: 'bajo'    // Español
    };

    if (intensityMap[receivedMessage]) {
      const nivel = intensityMap[receivedMessage];

      // Actualizar el nivel de intensidad del usuario en la base de datos
      await userService.updateUser(senderId, { nivel });

      // Confirmar la selección al usuario
      const confirmationMessage = idioma === 'ingles'
        ? `Brilliant! you changed the intensity level to "${nivel}" `
        : `Genial! cambiaste el nivel de intensidad a "${nivel}".`;

      await sendMessage(senderId, confirmationMessage);
      return true; // Indica que se manejó la selección de intensidad
    }

    return false; // Indica que no se manejó ninguna palabra clave ni selección de intensidad
  } catch (error) {
    console.error('Error al manejar la selección de intensidad:', error);
    return false;
  }
};

module.exports = handleIntensityKeywords;
