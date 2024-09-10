const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const languageAbbreviations = require('../../utils/languageAbr');
const sendContactMessage = require('../../services/Wp-Envio-Msj/sendContactMessage');

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
      ? '👋 👋 Hi! I’m Olya AI, your personal assistant to help you quit vaping.\n\n😎 Save my contact for anything you need..'
      : '👋 ¡Hola! Soy Olya Ai, tu asistente personal para dejar de vapear.\n\n😎 Guarda mi contacto por cualquier cosa.';

    const instructionMessage = idioma === 'ingles'
      ? `❓ How it works. It’s very simple. The program lasts 20 days, during which:\n
  \n1️⃣ I will learn your habits.
  \n2️⃣ I measure the progress of your lung capacity.
  \n3️⃣ I’ll support you to not vape during your most vulnerable hours.
  \n4️⃣ I’ll help you get through cravings/anxiety whenever you ask me.`
      : `❓ Cómo funciona. Es muy sencillo. El programa dura 20 días en los que:\n
  \n1️⃣ Aprendo tus hábitos.
  \n2️⃣ Mido el progreso de tu capacidad pulmonar.
  \n3️⃣ Te apoyaré a no vapear en tus horas más vulnerables.
  \n4️⃣ Te ayudaré a pasar los antojos/ansiedad cada que me lo pidas.`;

    const consentMessage = idioma === 'ingles'
      ? '✅ By replying to this message, you agree to our Terms and Conditions and our Privacy Policy https://olya.ai/terms.'
      : '✅ Al responder este mensaje estás aceptando nuestros Términos y Condiciones y nuestra Política de Privacidad: https://olya.ai/terms.';

    const reminderMessage = idioma === 'ingles'
      ? '🙌 Remember to share my WhatsApp contact with anyone who needs it!'
      : '🙌 ¡Recuerda compartir mi contacto de WhatsApp con quien lo necesite!';

    await sendMessage(senderId, welcomeMessage);
    await delay(2000);  // Espera 2 segundos
    await sendContactMessage(senderId);
    await delay(3000);  // Espera 3 segundos
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
      ? 'What´s your name?'
      : '¿Cómo te llamas?';
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
