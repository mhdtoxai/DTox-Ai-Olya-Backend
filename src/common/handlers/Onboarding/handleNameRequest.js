const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const handleSendQuestionnaire = require('./handleSendQuestionnaire');


const handleNameRequest = async (senderId, receivedMessage) => {
  console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

  // Convierte el primer carácter de cada palabra a mayúscula y el resto a minúscula
  const userName = receivedMessage.trim().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
  const nameParts = userName.split(" ");

  const { idioma, estado } = await getUserInfo(senderId);
  console.log(`Usuario ${senderId} tiene idioma: ${idioma} y estado: ${estado}`);

  if (nameParts.length === 1) {
    // Actualizar nombre elegido en la BD
    await userService.updateUser(senderId, { nombre: userName });
    // Actualizar nombre en el contexto de usuario (userContext)
    userContext[senderId].nombre = userName;


    const congratulationsMessage = idioma === 'ingles'
    ? `Congratulations ${userName}, you have taken the first step towards a healthier life.`
    : `Felicidades ${userName}, has dado el primer paso hacia una vida más saludable.`;
    
      const helpMessage = idioma === 'ingles'
      ? `I need your help with a few questions (It will only take 2 minutes).`
      : `Necesito tu ayuda con unas pocas preguntas (Te tomará solo 2 minutos).`;

    await sendMessage(senderId, congratulationsMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, helpMessage);
    await delay(2000);  // Espera 2 segundos

    await handleSendQuestionnaire(senderId);


    // Actualizar el estado en la BD
    await userService.updateUser(senderId, { estado: 'cuestionariopendiente' });
    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'cuestionariopendiente';
    console.log(`Estado actualizado a: ${userContext[senderId].estado}`);

  } else {
    const nextState = estado === 'solicitudnombre' ? 'pregunta_secundaria' : 'pregunta_terciaria';
    await userService.updateUser(senderId, { estado: nextState });
    console.log(`Usuario ${senderId} actualizado con estado: ${nextState}`);
    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = nextState;

    const message = nextState === 'pregunta_secundaria'
      ? (idioma === 'ingles' ? "Okay... What would you like me to call you?" : "Ok… ¿Cómo prefieres que te diga?")
      : (idioma === 'ingles' ? "Oops! I didn't catch that. What do you want me to call you?" : "Opps! No entendí eso. ¿Cómo quieres que te llame?");

    await sendMessage(senderId, message);
    console.log(`Mensaje enviado a ${senderId}: ${message}`);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleNameRequest;
