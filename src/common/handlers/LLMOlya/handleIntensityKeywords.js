const userService = require('../../services/userService');
const getUserInfo = require('../../services/getUserInfo');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');

const handleIntensityKeywords = async (senderId, receivedMessage) => {
  try {
    // Definir las palabras clave relacionadas con la intensidad
    const keywords = ['intensidad', 'intensity']; // Palabras clave para español e inglés
    const messageLowerCase = receivedMessage.toLowerCase();

    // Obtener información del usuario
    const { estado, nombre, idioma } = await getUserInfo(senderId);

    // 1. Verificar si el mensaje es exactamente alguna de las palabras clave
    const isKeywordMatch = keywords.some(keyword => messageLowerCase === keyword);

    if (isKeywordMatch) {
      // 2. Mostrar botones de selección de intensidad según el idioma
      const buttons = idioma === 'ingles'
        ? [
            { id: 'HIGH', title: 'High' },
            { id: 'MEDIUM', title: 'Medium' },
            { id: 'LOW', title: 'Low' }
          ]
        : [
            { id: 'ALTO', title: 'Alto' },
            { id: 'MEDIO', title: 'Medio' },
            { id: 'BAJO', title: 'Bajo' }
          ];

      const message = idioma === 'ingles'
        ? 'Please select the intensity level.'
        : 'Por favor selecciona el nivel de intensidad.';

      await sendMessageTarget(senderId, message, buttons);
      
      return true; // Indica que se manejó una palabra clave de intensidad
    }

    // 3. Verificar si el mensaje es la selección de un nivel de intensidad
    const intensityMap = {
      HIGH: 'high', MEDIUM: 'medium', LOW: 'low',   // Inglés
      ALTO: 'alto', MEDIO: 'medio', BAJO: 'bajo'    // Español
    };

    // Convertir el mensaje recibido a mayúsculas y obtener el nivel
    const nivel = intensityMap[receivedMessage.toUpperCase()];
    
    if (nivel) {
      // Actualizar el nivel del usuario en la base de datos
      await userService.updateUser(senderId, { nivel });

      // Confirmar la selección al usuario
      const confirmationMessage = idioma === 'ingles'
        ? `You have selected "${nivel}" intensity level.`
        : `Has seleccionado el nivel de intensidad "${nivel}".`;

      await sendMessage(senderId, confirmationMessage);
      
      return true; // Indica que se manejó la selección de intensidad
    }

    return false; // No se manejó ninguna palabra clave ni selección
  } catch (error) {
    console.error('Error al manejar la selección de intensidad:', error);
    return false;
  }
};

module.exports = handleIntensityKeywords;
