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
      ? 'Hello! I am Olya, the smartest virtual assistant that will help you quit vaping'
      : '¡Hola! Soy Olya, el asistente virtual más inteligente que te ayudará a dejar de vapear';
    const congratulationsMessage = idioma === 'ingles'
      ? 'You have taken the first step towards a healthier life, so Congratulations!'
      : 'Has dado el primer paso hacia una vida más saludable, así que ¡Felicidades!';

    await sendMessage(senderId, welcomeMessage);
    await sendMessage(senderId, congratulationsMessage);

    // Actualizar el estado en la BD
    await userService.updateUser(senderId, { estado: 'solicitudnombre' });
    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'solicitudnombre';
    console.log(`Estado actualizado a 'solicitudnombre':`, userContext[senderId]);

    await sendMessage(senderId, idioma === 'ingles'
      ? "First of all, what is your name?"
      : "Primero que todo, ¿Cómo te llamas?");
  } else {
    await sendMessage(senderId, 'Por favor selecciona tu idioma. English/Español');
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto completo del usuario ${senderId}:`, userContext[senderId]);
};

module.exports = handleLanguageSelection;
