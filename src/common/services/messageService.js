const handleFaq = require('../handlers/Preguntas/faqHandler');
const handleLanguageKeywords = require('../handlers/Preguntas/handleLanguageKeywords ');
const handleUserByState = require('./handleUserByState');
const handleCravingKeywords = require('../handlers/Preguntas/handleCravingKeywords'); // Nuevo módulo para manejar "antojo"
const handleInsults = require('../handlers/Preguntas/insults/handleInsults'); // Nuevo módulo para manejar "antojo"

exports.processMessage = async (body) => {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderId = message?.from;


  if (message?.type === "text" || message?.type === "interactive" || message?.type === "button") {
    const receivedMessage = message.text?.body.toLowerCase() || message.interactive?.button_reply?.id || message.button?.payload || message.button?.text.toLowerCase();


    // Manejar al usuario según su estado
    await handleUserByState(senderId, receivedMessage);

    // Manejar palabras clave relacionadas con el idioma
    const languageHandled = await handleLanguageKeywords(senderId, receivedMessage);
    if (languageHandled) return;

    // Manejar insultos
    const insultHandled = await handleInsults(senderId, receivedMessage);
    if (insultHandled) return; // Terminar la función si se detecta un insulto

    const faqHandled = await handleFaq(senderId, receivedMessage);
    if (faqHandled) return;

    // Manejar palabras clave relacionadas con antojos
    const cravingHandled = await handleCravingKeywords(senderId, receivedMessage);
    if (cravingHandled) return;

  }
};


