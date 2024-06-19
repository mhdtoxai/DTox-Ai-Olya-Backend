const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../services/getUserInfo');
const handleConsentAccepted = require('./handleConsentAccepted');
const userContext = require('../services/userContext'); 

const handleConsentResponse = async (senderId, receivedMessage) => {
  const { idioma, estado } = await getUserInfo(senderId);
  console.log(`Usuario ${senderId} tiene idioma: ${idioma} y estado: ${estado}`);

  // Definimos algunas respuestas afirmativas que pueden indicar consentimiento
  const affirmativeResponses = ['yes', 'ok', 'okey', 'yeah', 'sure', 'of course', 'okay', 'si', 'claro', 'por supuesto', 'si esta bien'];

  if (affirmativeResponses.includes(receivedMessage.toLowerCase())) {

    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'consentimientoaceptado';
    // Actualizar el estado después de obtener el consentimiento
    await userService.updateUser(senderId, { estado: 'consentimientoaceptado' });
    console.log(`Estado  actualizado  a ${userContext[senderId].estado}`);


    // Llamar a la función para manejar el estado 'consentimientoaceptado'
    await handleConsentAccepted(senderId);

  } else {
    // En caso de que la respuesta no sea afirmativa
    await sendMessage(senderId, idioma === 'ingles'
      ? "I'm sorry, I didn't catch that. Can we move on to the questions so I can assist you better?"
      : "Lo siento, no entendí eso. ¿Podemos pasar a las preguntas para que pueda ayudarte mejor?");

    // Actualizar el estado en caso de que el usuario no dé su consentimiento
    await userService.updateUser(senderId, { estado: 'pregunta_secundaria_cuestionario' });
  }
  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};




module.exports = handleConsentResponse;
