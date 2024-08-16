const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendAudioMessage = require('../../services/Wp-Envio-Msj/sendAudioMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const handlePaymentPendient = require('./handlePaymentPendient');

const handleQuestCompleted = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    const QuestComplete = idioma === 'ingles'
      ? '✅ Well done! You have completed the questionnaire. '
      : '✅ ¡Bien hecho! Has completado el cuestionario.';


    // Mensajes según el idioma del usuario
    const plancomplete = idioma === 'ingles'
      ? `Stopping Vaping with me costs you less than a vape! The cost is 199 MXN (or the equivalent in your local currency).`
      : `¡El plan completo cuesta menos que un vape! Sólo 199 MXN (o el equivalente en tu moneda local).`;

    const questions = idioma === 'ingles'
      ? `If you have any questions, let me know.`
      : `Si tienes alguna duda, déjamelo saber.`;

  const audioUrl = 'https://drive.google.com/uc?export=download&id=1mDnn80GHE2fSISIG1-DuSr34VajeSvZs';


    await sendMessage(senderId, QuestComplete);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, plancomplete);
    await delay(3000);  // Espera 2 segundos
    await sendMessage(senderId, questions);
    await delay(2000);  // Espera 2 segundos
    sendAudioMessage(senderId, audioUrl);
    await delay(5000);

    // Actualizar el estado del usuario
    await userService.updateUser(senderId, { estado: 'pagopendiente' });
    userContext[senderId].estado = 'pagopendiente';

    console.log(`Estado actualizado a pagopendiente para ${senderId}`);

    //  // Llamar a la función para manejar el estado 'pagopendiente'
    await handlePaymentPendient(senderId);

  } catch (error) {
    console.error('Error al manejar cuestionario completado:', error);
    throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
  }
  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleQuestCompleted;
