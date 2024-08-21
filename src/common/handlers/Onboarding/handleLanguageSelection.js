const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const languageAbbreviations = require('../../utils/languageAbr');

// Función para manejar la selección del idioma
const handleLanguageSelection = async (senderId, receivedMessage) => {
  console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);

  const selectedLanguage = languageAbbreviations[receivedMessage];
  console.log(`Idioma seleccionado: ${selectedLanguage}`);

  if (selectedLanguage && ['español', 'ingles'].includes(selectedLanguage)) {
    const idioma = selectedLanguage === 'ingles' ? 'ingles' : 'español';

    // Actualizar la información en la base de datos
    await userService.updateUser(senderId, { idioma: idioma, estado: 'felicitaciones' });
    console.log(`Información del usuario actualizada: idioma=${idioma}, estado=felicitaciones`);

    const welcomeMessage = idioma === 'ingles'
      ? '👋 Hello! I am Olya Ai, your personal assistant to help you stop vaping.\n\n😎 Save my contact for any assistance.'
      : '👋 ¡Hola! Soy Olya Ai, tu asistente personal para dejar de vapear.\n\n😎 Guarda mi contacto por cualquier cosa.';

    const instructionMessage = idioma === 'ingles'
      ? `❓ How it works. It’s very simple. The program lasts 20 days during which:\n
  \n1️⃣ I will learn your habits.
  \n2️⃣ I will measure the progress of your lung capacity.
  \n3️⃣ I will support you in not vaping during your most vulnerable times.
  \n4️⃣ I will help you manage cravings/anxiety whenever you ask.`
      : `❓ Cómo funciona. Es muy sencillo. El programa dura 20 días en los que:\n
  \n1️⃣ Aprendo tus hábitos.
  \n2️⃣ Mido el progreso de tu capacidad pulmonar.
  \n3️⃣ Te apoyaré a no vapear en tus horas más vulnerables.
  \n4️⃣ Te ayudaré a pasar los antojos/ansiedad cada que me lo pidas.`;

    const consentMessage = idioma === 'ingles'
      ? '✅ By replying to this message, you are accepting our Terms and Conditions and Privacy Policy: https://olya.ai/terms.'
      : '✅ Al responder este mensaje estás aceptando nuestros Términos y Condiciones y nuestra Política de Privacidad: https://olya.ai/terms.';

    const reminderMessage = idioma === 'ingles'
      ? '🙌 Remember to share my WhatsApp contact with anyone who might need it!'
      : '🙌 ¡Recuerda compartir mi contacto de WhatsApp con quien lo necesite!';

    await sendMessage(senderId, welcomeMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, instructionMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, consentMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, reminderMessage);
    await delay(2000);  // Espera 2 segundos

    // Actualizar el estado en la BD
    await userService.updateUser(senderId, { estado: 'solicitudnombre' });
    console.log(`Estado actualizado a 'solicitudnombre'`);

    const questionName = idioma === 'ingles'
      ? 'What is your name or what do you prefer me to call you?'
      : '¿Cómo te llamas o cómo prefieres que te llame?';
    await sendMessage(senderId, questionName);

  } else {
    // Si el idioma no es válido, pide al usuario que seleccione su idioma.
    const buttons = [
      { id: 'espanol', title: 'Español' },
      { id: 'ingles', title: 'Inglés' }
    ];
    await sendMessageTarget(senderId, 'Hola. Por favor selecciona tu idioma | Please select your language.', buttons);
  }


};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleLanguageSelection;
