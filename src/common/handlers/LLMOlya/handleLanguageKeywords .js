const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const handleUserByState = require('../../services/handleUserByState');

const handleLanguageKeywords = async (senderId, receivedMessage) => {
  try {
    // Palabras clave relacionadas con el idioma (sin combinaciones)
    const keywords = ['idioma', 'language'];
    const messageLowerCase = receivedMessage.toLowerCase();

    // 1. Verificar si el mensaje es exactamente alguna de las palabras clave
    const isKeywordMatch = keywords.some(keyword => messageLowerCase === keyword);

    if (isKeywordMatch) {
      const buttons = [
        { id: 'espanol-001', title: 'Español' },
        { id: 'ingles-002', title: 'English' }
      ];

      const message = 'Por favor selecciona tu idioma | Please select your language.';
      await sendMessageTarget(senderId, message, buttons);
      return true; // Indica que se manejó una palabra clave de idioma
    }

    // 2. Verificar si el mensaje es la selección de un idioma
    if (receivedMessage === 'espanol-001' || receivedMessage === 'ingles-002') {
      const language = receivedMessage === 'espanol-001' ? 'español' : 'ingles';

      // Actualizar el idioma del usuario en la base de datos
      await userService.updateUser(senderId, { idioma: language });

      // Confirmar la selección de idioma al usuario
      const confirmationMessage = language === 'ingles'
        ? 'You have selected English as your preferred language.'
        : 'Has seleccionado Español como tu idioma preferido.';

      await sendMessage(senderId, confirmationMessage);
      // Llamar a handleUserByState sin pasarle parámetros
      await handleUserByState(senderId); // Llama a la función sin pasarle estado ni mensaje
      
      return true; // Indica que se manejó la selección de idioma
    }

    return false; // Indica que no se manejó ninguna palabra clave ni selección de idioma
  } catch (error) {
    console.error('Error al manejar la selección de idioma:', error);
    return false;
  }
};

module.exports = handleLanguageKeywords;
