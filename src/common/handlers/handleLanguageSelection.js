const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const languageAbbreviations = require('../utils/languageAbr');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext');
const sendContactMessage = require('../services/Wp-Envio-Msj/sendContactMessage');


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
      ? 'I am Olya, your virtual assistant who will help you stop vaping.'
      : 'Yo soy Olya, tu asistente virtual que te ayudará a dejar de vapear.';

      const addcontact = idioma === 'ingles'
      ? 'We suggest you save my contact so you can contact me easily in the future.'
      : 'Te sugiero que guardes mi contacto para que puedas comunicarte conmigo fácilmente en el futuro.';

    const congratulationsMessage = idioma === 'ingles'
      ? 'First of all, congratulations! You have taken the first step towards a healthier life. '
      : 'Antes que todo ¡Felicidades!, Has dado el primer paso hacia una vida más saludable.';
    const creatingProfileMessage = idioma === 'ingles'
      ? 'Give me a moment please… I am creating your personal monitoring file.'
      : 'Dame un momento por favor… estoy creando tu ficha personal de monitoreo.';


    await sendMessage(senderId, welcomeMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, addcontact);
    await delay(2000);  
    await sendContactMessage(senderId);
    await delay(2000);  
    await sendMessage(senderId, congratulationsMessage);
    await delay(1000);  // Espera 2 segundos
    await sendMessage(senderId, creatingProfileMessage);
    await delay(3000);  // Espera 3 segundos

    // Actualizar el estado en la BD
    await userService.updateUser(senderId, { estado: 'solicitudnombre' });
    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'solicitudnombre';
    console.log(`Estado actualizado a 'solicitudnombre':`, userContext[senderId]);

 
    const QuestionName = idioma === 'ingles'
      ? 'Ready, let"s start... What is your name or what do you prefer me to call you?'
      : 'Listo, iniciemos... ¿Cómo te llamas o cómo prefieres que te llame?';
        await sendMessage(senderId, QuestionName);

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

