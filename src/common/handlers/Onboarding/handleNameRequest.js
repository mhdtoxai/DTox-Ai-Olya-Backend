const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const handleSendQuestionnaire = require('./handleSendQuestionnaire');

const handleNameRequest = async (senderId, receivedMessage) => {
  console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

  // Función para eliminar tildes de una cadena
  const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Convierte el primer carácter de cada palabra a mayúscula y el resto a minúscula, eliminando tildes
  const userName = removeAccents(receivedMessage.trim())
    .split(' ')
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  const nameParts = userName.split(" ");

  // Obtener información del usuario desde la base de datos
  const userInfo = await getUserInfo(senderId);
  const { idioma, estado } = userInfo;

  if (nameParts.length === 1) {
    // Actualizar nombre elegido en la BD
    await userService.updateUser(senderId, { nombre: userName });

    const congratulationsMessage = idioma === 'ingles'
      ? `Congratulations ${userName} You’ve taken the first step toward a healthier life..`
      : `Felicidades ${userName}, has dado el primer paso hacia una vida más saludable.`;

    const helpMessage = idioma === 'ingles'
      ? `To create your personal plan, I need your help with a few questions (It will only take 2 minutes).`
      : `Necesito tu ayuda con unas pocas preguntas (Te tomará solo 2 minutos).`;

    await sendMessage(senderId, congratulationsMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, helpMessage);
    await delay(2000);  // Espera 2 segundos

    await handleSendQuestionnaire(senderId);

    // Actualizar el estado en la BD
    await userService.updateUser(senderId, { estado: 'cuestionariopendiente' });
    console.log(`Estado actualizado a: cuestionariopendiente`);

  } else {
    const nextState = estado === 'solicitudnombre' ? 'pregunta_secundaria' : 'pregunta_terciaria';
    await userService.updateUser(senderId, { estado: nextState });
    console.log(`Usuario ${senderId} actualizado con estado: ${nextState}`);

    const message = nextState === 'pregunta_secundaria'
      ? (idioma === 'ingles' ? "Okay... What would you like me to call you?" : "Ok… ¿Cómo prefieres que te diga?")
      : (idioma === 'ingles' ? "Oops! I didn't catch that. What do you want me to call you?" : "Opps! No entendí eso. ¿Cómo quieres que te llame?");

    await sendMessage(senderId, message);
    console.log(`Mensaje enviado a ${senderId}: ${message}`);
  }
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleNameRequest;
