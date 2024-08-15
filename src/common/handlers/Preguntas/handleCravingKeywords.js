const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendTextWithPreview = require('../../services/Wp-Envio-Msj/sendTextWithPreview'); // Importar sendTextWithPreview
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const handleUserByState = require('../../services/handleUserByState');

const getRandomCalmMessage = () => {
  const messages = [
    '¡Calma! No te preocupes. Estoy aquí para ayudarte a pasar este antojo.',
    '¡No entres en pánico! Estoy aquí para ayudarte a pasar este antojo.'
  ];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

const handleOptionKeywords = async (senderId, receivedMessage) => {
  try {
    // Obtener la información del usuario incluyendo el estado
    const { estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene estado: ${estado} y nombre: ${nombre}`);

    const keywords = ['antojo'];
    const messageLowerCase = receivedMessage.toLowerCase();

    // Verificar si el mensaje contiene la palabra clave "antojo"
    if (keywords.some(keyword => messageLowerCase.includes(keyword))) {
      const calmMessage = getRandomCalmMessage();
      await sendMessage(senderId, calmMessage); // Enviar el mensaje de calma
    
      const buttons = [
        { id: 'resp-9f7d2b8c', title: 'Respiración' },
        { id: 'med-a3c8d9e2', title: 'Meditación' },
        { id: 'aud-7f4e1c0d', title: 'Audio' }
      ];

      const optionsMessage = 'Ahora, enfoquemos tu atención en algo muy puntual. Elige una de las siguientes opciones:';
      
      await sendMessageTarget(senderId, optionsMessage, buttons);
      return true; // Indica que se manejó la palabra clave "antojo"
    }

    // Verificar si el mensaje es la selección de una opción
    switch (receivedMessage) {
      case 'resp-9f7d2b8c':
        await sendTextWithPreview(senderId, 'Buena elección. Da clic aquí:https://player.vimeo.com/video/998465018?h=197cd80e29&autoplay=1');
        break;
      case 'med-a3c8d9e2':
        await sendTextWithPreview(senderId, 'Buena elección. Da clic aquí: https://vimeo.com/998465098');
        break;
      case 'aud-7f4e1c0d':
        await sendTextWithPreview(senderId, 'Buena elección. Da clic aquí: https://player.vimeo.com/video/998465018?h=197cd80e29&autoplay=1');
        break;
      default:
        return false; // No se manejó ninguna selección válida
    }

    // Enviar mensaje de seguimiento después de enviar el URL con vista previa
    const followUpMessage = 'Espero con ese ejercicio te sientas mejor.';
    await sendMessage(senderId, followUpMessage);

    // // Llamar a la función correspondiente al estado actual del usuario
    // await handleUserByState(senderId, estado, receivedMessage);
    return true; // Indica que se manejó la selección de opción
  } catch (error) {
    // Imprimir todo el contexto del usuario en la consola
    console.log(`Contexto del usuario ${senderId} después de seleccionar nivel:`, userContext[senderId]);
    console.error('Error al manejar la selección de opción:', error);
    return false;
  }
};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleOptionKeywords;
