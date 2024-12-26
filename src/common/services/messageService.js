const handleLanguageKeywords = require('../handlers/LLMOlya/handleLanguageKeywords ');
const handleUserByState = require('./handleUserByState');
const handleCravingKeywords = require('../handlers/LLMOlya/handleCravingKeywords'); // Nuevo módulo para manejar "antojo"
const handleIntensityKeywords = require('../handlers/LLMOlya/handleIntensityKeywords');
const LLMOlya = require('../handlers/LLMOlya/LLMOlya'); // Asegúrate de importar tu nueva función

exports.processMessage = async (body) => {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderId = message?.from;


  if (message?.type === "text" || message?.type === "interactive" || message?.type === "button") {
    const receivedMessage = message.text?.body.toLowerCase() || message.interactive?.button_reply?.id || message.button?.payload || message.button?.text.toLowerCase();

    // Manejar palabras clave relacionadas con el idioma
    const languageHandled = await handleLanguageKeywords(senderId, receivedMessage);
    if (languageHandled) return;

    // Manejar palabras clave relacionadas con antojos
    const cravingHandled = await handleCravingKeywords(senderId, receivedMessage);
    if (cravingHandled) return;

    // Manejar palabras clave relacionadas con antojos
    const intensityHandled = await handleIntensityKeywords(senderId, receivedMessage);
    if (intensityHandled) return;


    // Manejar consultas generales que no están relacionadas
    await LLMOlya(senderId, receivedMessage); // Usar la nueva función LLMOlya

    // Manejar al usuario según su estado
    await handleUserByState(senderId, receivedMessage);



  }
};


