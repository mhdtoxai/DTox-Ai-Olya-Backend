const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendTextWithPreview = require('../../services/Wp-Envio-Msj/sendTextWithPreview');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const handleUserByState = require('../../services/handleUserByState');
const sendAudioMessage = require('../../services/Wp-Envio-Msj/sendAudioMessage');

const getRandomCalmMessage = (language) => {
  const messages = language === 'ingles' 
    ? [
        'Stay calm! Don’t worry. I’m here to help you get through this craving.',
        'Don’t panic! I’m here to help you get through this craving.'
      ]
    : [
        '¡Calma! No te preocupes. Estoy aquí para ayudarte a pasar este antojo.',
        '¡No entres en pánico! Estoy aquí para ayudarte a pasar este antojo.'
      ];
  
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

const handleOptionKeywords = async (senderId, receivedMessage) => {
  try {
    // Obtener la información del usuario incluyendo el estado y el idioma
    const { estado, nombre, idioma } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene estado: ${estado}, nombre: ${nombre} e idioma: ${idioma}`);

    const keywords = idioma === 'ingles' ? ['craving'] : ['antojo'];
    const messageLowerCase = receivedMessage.toLowerCase();

    // Verificar si el mensaje contiene la palabra clave "antojo" o "craving"
    if (keywords.some(keyword => messageLowerCase.includes(keyword))) {
      const calmMessage = getRandomCalmMessage(idioma);
      await sendMessage(senderId, calmMessage); // Enviar el mensaje de calma
    
      const buttons = [
        { id: 'resp-9f7d2b8c', title: idioma === 'ingles' ? 'Breathing' : 'Respiración' },
        { id: 'med-a3c8d9e2', title: idioma === 'ingles' ? 'Meditation' : 'Meditación' },
        { id: 'aud-7f4e1c0d', title: idioma === 'ingles' ? 'Audio' : 'Audio' }
      ];

      const optionsMessage = idioma === 'ingles' 
        ? 'Now, let’s focus your attention on something very specific. Choose one of the following options:'
        : 'Ahora, enfoquemos tu atención en algo muy puntual. Elige una de las siguientes opciones:';
      
      await sendMessageTarget(senderId, optionsMessage, buttons);
      return true; // Indica que se manejó la palabra clave "antojo" o "craving"
    }

    // Verificar si el mensaje es la selección de una opción
    switch (receivedMessage) {
      case 'resp-9f7d2b8c':
        await sendTextWithPreview(senderId, idioma === 'ingles' 
          ? 'Good choice. Click here: https://player.vimeo.com/video/998465018?h=197cd80e29&autoplay=1' 
          : 'Buena elección. Da clic aquí:https://player.vimeo.com/video/998465018?h=197cd80e29&autoplay=1');
        break;
      case 'med-a3c8d9e2':
        await sendTextWithPreview(senderId, idioma === 'ingles' 
          ? 'Good choice. Click here: https://player.vimeo.com/video/998465098?h=eaff2a2d1d&autoplay=1' 
          : 'Buena elección. Da clic aquí: https://player.vimeo.com/video/998465098?h=eaff2a2d1d&autoplay=1');
        break;
      case 'aud-7f4e1c0d':
        const audioUrl = 'https://drive.google.com/uc?export=download&id=1WKzHSKqydoy1uAva6jnNGZU51mxjNgq2';
        await sendAudioMessage(senderId, audioUrl);
        break;
      default:
        return false; // No se manejó ninguna selección válida
    }

    // Enviar mensaje de seguimiento después de enviar el URL con vista previa
    const followUpMessage = idioma === 'ingles' 
      ? 'I hope this exercise helps you feel better.'
      : 'Espero con ese ejercicio te sientas mejor.';
      
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
