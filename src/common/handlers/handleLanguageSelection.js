const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const languageAbbreviations = require('../utils/languageAbr');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext'); 

// Función para manejar la selección del idioma
const handleLanguageSelection = async (senderId, receivedMessage) => {
  console.log(`Mensaje recibido de ${senderId}: ${receivedMessage}`);
  
  const selectedLanguage = languageAbbreviations[receivedMessage];
  console.log(`Idioma seleccionado: ${selectedLanguage}`);

  if (selectedLanguage && ['español', 'ingles'].includes(selectedLanguage)) {
    const idioma = selectedLanguage === 'ingles' ? 'ingles' : 'español';

    // Actualizar la información en la base de datos
    await userService.updateUser(senderId, { idioma: idioma, estado: 'felicitaciones' });
    // Guardar la información en el contexto del usuario
    userContext[senderId] = { idioma: idioma, estado: 'felicitaciones' };
    console.log(`Contexto del usuario actualizado:`, userContext[senderId]);

    const welcomeMessage = idioma === 'ingles'
      ? 'I am Olya, your virtual assistant (by the way, the smartest one) who will help you stop vaping.'
      : 'Yo soy Olya, tu asistente virtual (por cierto, la mas inteligente) que te ayudará a dejar de vapear.';
    const congratulationsMessage = idioma === 'ingles'
      ? 'First of all, I congratulate you! You\'ve taken the most important step towards a healthier life, so pat yourself on the back, you deserve it. :)'
      : 'Primero que todo, te felicito! Has dado el paso más importante para una vida más saludable, así que date una palmada en la espalda que bien que te lo mereces. :)';

    const creatingProfileMessage = idioma === 'ingles'
      ? 'Give me a moment please… I am creating your personal monitoring file.'
      : 'Dame un momento por favor… estoy creando tu ficha personal de monitoreo.';

   
    await sendMessage(senderId, welcomeMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, congratulationsMessage);
    await delay(1000);  // Espera 2 segundos
    await sendMessage(senderId, creatingProfileMessage);
    await delay(3000);  // Espera 3 segundos

    // Actualizar el estado en la BD
    await userService.updateUser(senderId, { estado: 'solicitudnombre' });
    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'solicitudnombre';
    console.log(`Estado actualizado a 'solicitudnombre':`, userContext[senderId]);

    await sendMessage(senderId, idioma === 'ingles'
      ? "That's it... Let's start with, What's your name or what do you want me to call you?"
      : "Ya está… Iniciemos con, ¿Cómo te llamas o cómo quieres que te diga?");
  } else {
    // Si el idioma no es válido, pide al usuario que seleccione su idioma.
    await sendMessage(senderId, 'Por favor selecciona uno de los idiomas. English/Español');
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto completo del usuario ${senderId}:`, userContext[senderId]);
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleLanguageSelection;

