const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext');


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


    const PlanSent = idioma === 'ingles'
      ? `${userName}, I will be working on a personal plan for you, first we need your help with a few questions (It will only take 2 Minutes).`
      : `${userName}, Estaré trabajando en un plan personal para ti, primero necesitamos tu ayuda con unas pocas preguntas (Te tomará solo 2 minutos).)`;

    await sendMessage(senderId, PlanSent);

    const Confirmation = idioma === 'ingles'
      ? 'Okey?'
      : 'Esta bien?';
    await sendMessage(senderId, Confirmation);


    // Actualizar el estado en la BD
    await userService.updateUser(senderId, { estado: 'consentimientocuestionario' });
    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'consentimientocuestionario';
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


module.exports = handleNameRequest;
