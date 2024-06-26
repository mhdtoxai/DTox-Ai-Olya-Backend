const userService = require('./userService');
const sendMessage = require('./Wp-Envio-Msj/sendMessage');
const handleLanguageSelection = require('../handlers/handleLanguageSelection');
const handleNameRequest = require('../handlers/handleNameRequest');
const handleConsentResponse = require('../handlers/handleConsentResponse');
const handleConsentAccepted = require('../handlers/handleConsentAccepted');
const handleQuestionnaireCompleted = require('../handlers/handleQuestionnaireCompleted');
const handlePlanSent = require('../handlers/handlePlanSent');
const handlePaymentCompleted = require('../handlers/handlePaymentCompleted');
const handleFirstDayChallenge = require('../handlers/Primerdia/handleFirstDayChallenge');
const handleFirstNightChallenge = require('../handlers/Primerdia/handleFirstNightChallenge');

exports.processMessage = async (body) => {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderId = message?.from;

  if (message?.type === "text") {
    const receivedMessage = message.text.body.toLowerCase();
    const userDoc = await userService.getUser(senderId);

    if (!userDoc.exists) {
      await userService.createUser(senderId);
      await sendMessage(senderId, 'Hola/Hello!. Por favor indica tu idioma / please select your language  Español/Ingles ');
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
        case 'consentimientocuestionario':
        case 'pregunta_secundaria_cuestionario':
          await handleConsentResponse(senderId, receivedMessage);
          break;
        case 'consentimientoaceptado':
          await handleConsentAccepted(senderId);
          break;
        case 'cuestionariocompletado':
          await handleQuestionnaireCompleted(senderId);
          break;
        case 'planenviado':
          await handlePlanSent(senderId);
          break;
          case 'pagado':
          await handlePaymentCompleted(senderId);
          break;
        case 'primerdia':
          await handleFirstDayChallenge(senderId);
          break;
        case 'primerdianoche':
            await handleFirstNightChallenge(senderId);
            break;
        default:
  console.log(`Estado no reconocido: ${estado}. No se realizará ninguna acción adicional.`);
  break;

      }
    }
  }
};

