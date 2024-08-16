const userService = require('./userService');
const sendMessageTarget = require('./Wp-Envio-Msj/sendMessageTarget');

const handleLanguageSelection = require('../handlers/Onboarding/handleLanguageSelection');
const handleNameRequest = require('../handlers/Onboarding/handleNameRequest');
const handleSendQuestionnaire = require('../handlers/Onboarding/handleSendQuestionnaire');
const handleQuestCompleted = require('../handlers/Onboarding/handleQuestCompleted');
const handlePaymentPendient = require('../handlers/Onboarding/handlePaymentPendient');
const handlePaymentCompleted = require('../handlers/Onboarding/handlePaymentCompleted');
const handleTestVape = require('../handlers/Onboarding/handleTestVape');
const handleSelectModeLevel = require('../handlers/Onboarding/handleSelectModeLevel');
const handleUserSelectionMode = require('../handlers/Onboarding/handleUserSelectionMode');
const handleCompromise = require('../handlers/Onboarding/handleCompromise');
const handleCompromiseConfirmation = require('../handlers/Onboarding/handleCompromiseConfirmation');

const handleUserByState = async (senderId, receivedMessage) => {
  const userDoc = await userService.getUser(senderId);

  if (!userDoc.exists) {
    await userService.createUser(senderId);
    const buttons = [
      { id: 'espanol', title: 'Español' },
      // { id: 'ingles', title: 'Inglés' }
    ];
    await sendMessageTarget(senderId, 'Hola. Por favor selecciona tu idioma | Please select your language.', buttons);
  } else {
    const userData = userDoc.data();
    const estado = userData.estado;

    switch (estado) {
      case 'idiomaseleccionado':
        await handleLanguageSelection(senderId, receivedMessage);
        break;
      case 'solicitudnombre':
      case 'pregunta_secundaria':
      case 'pregunta_terciaria':
        await handleNameRequest(senderId, receivedMessage, estado);
        break;
      case 'cuestionariopendiente':
        await handleSendQuestionnaire(senderId);
        break;
      case 'cuestionariocompletado':
        await handleQuestCompleted(senderId);
        break;
      case 'pagopendiente':
        await handlePaymentPendient(senderId);
        break;
      case 'pagado':
        await handlePaymentCompleted(senderId);
        break;
      case 'primertest':
        await handleTestVape(senderId);
        break;
      case 'opcionesnivel':
        await handleSelectModeLevel(senderId);
        break;
      case 'seleccionnivel':
        await handleUserSelectionMode(senderId, receivedMessage);
        break;
      case 'confirmarcompromiso':
        await handleCompromise(senderId);
        break;
      case 'compromisopendiente':
        await handleCompromiseConfirmation(senderId, receivedMessage);
        break;
      default:
        console.log(`Estado no reconocido: ${estado}. No se realizará ninguna acción adicional.`);
        break;
    }
  }
};

module.exports = handleUserByState;
