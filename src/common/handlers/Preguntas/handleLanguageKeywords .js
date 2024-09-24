const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const getUserInfo = require('../../services/getUserInfo');

const handleLanguageKeywords = async (senderId, receivedMessage) => {
  try {
    // Palabras clave relacionadas con el idioma
    const keywords = ['idioma', 'lengua', 'lenguaje', 'dialecto', 'language', 'idiom', 'dialect'];
    const messageLowerCase = receivedMessage.toLowerCase();

    // Verificar si el mensaje contiene alguna palabra clave relacionada con el idioma
    if (keywords.some(keyword => messageLowerCase.includes(keyword))) {
      const buttons = [
        { id: 'espanol-001', title: 'Español' },
        { id: 'ingles-002', title: 'English' }
      ];

      const message = 'Hola. Por favor selecciona tu idioma | Please select your language.';
      await sendMessageTarget(senderId, message, buttons);
      return true; // Indica que se manejó una palabra clave de idioma
    }

    // Verificar si el mensaje es la selección de un idioma
    if (receivedMessage === 'espanol-001' || receivedMessage === 'ingles-002') {
      const language = receivedMessage === 'espanol-001' ? 'español' : 'ingles';

      // Actualizar el idioma del usuario en la base de datos
      await userService.updateUser(senderId, { idioma: language });

      // Confirmar la selección de idioma al usuario
      const confirmationMessage = language === 'ingles'
        ? 'You have selected English as your preferred language.'
        : 'Has seleccionado Español como tu idioma preferido.';

      await sendMessage(senderId, confirmationMessage);

      // No se necesita obtener información del usuario aquí a menos que sea necesario por otra acción
      // Por ejemplo, si deseas manejar un estado específico en función del idioma seleccionado, puedes hacerlo aquí
      // await handleUserByState(senderId, estado, receivedMessage);

      return true; // Indica que se manejó la selección de idioma
    }

    return false; // Indica que no se manejó ninguna palabra clave ni selección de idioma
  } catch (error) {
    console.error('Error al manejar la selección de idioma:', error);
    return false;
  }
};

module.exports = handleLanguageKeywords;
