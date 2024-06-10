const axios = require('axios');
const languageAbbreviations = require('../utils/languageAbr');
const userService = require('./userService');
const sendMessage = require('./sendMessage');

exports.processMessage = async (body) => {
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const senderId = message?.from;

  if (message?.type === "text") {
    const receivedMessage = message.text.body.toLowerCase();
    const userDoc = await userService.getUser(senderId);

    if (!userDoc.exists) {
      await userService.createUser(senderId);
      await sendMessage(senderId, 'Hello!/Hola!. Por favor selecciona tu idioma. English/Español');
    } else {
      const userData = userDoc.data();
      const estado = userData.estado;

      // Manejar el flujo de estados
      switch (estado) {
        case 'idiomaseleccionado':
          await handleLanguageSelection(senderId, receivedMessage);
          break;
        case 'solicitudnombre':
        case 'pregunta_secundaria':
        case 'pregunta_terciaria':
          await handleNameRequest(senderId, receivedMessage, estado);
          break;
      }
    }
  }
};

// Definición del contexto del usuario
let userContext = {};

// Función para manejar la selección del idioma
const handleLanguageSelection = async (senderId, receivedMessage) => {
  const selectedLanguage = languageAbbreviations[receivedMessage];

  if (selectedLanguage && ['español', 'ingles'].includes(selectedLanguage)) {
    const languageCode = selectedLanguage === 'ingles' ? 'ingles' : 'español';
    await userService.updateUser(senderId, { idioma: languageCode, estado: 'felicitaciones' });
    console.log(`Usuario ${senderId} actualizado con idioma: ${languageCode}`);

    // Guardar la información en el contexto del usuario
    userContext[senderId] = { idioma: languageCode, estado: 'felicitaciones' };

    const welcomeMessage = languageCode === 'ingles'
      ? 'Welcome to DTOX.Ai, the smartest virtual assistant that will help you quit vaping'
      : 'Bienvenidx a DTOX.Ai, el asistente virtual más inteligente que te ayudará a dejar de vapear';
    const congratulationsMessage = languageCode === 'ingles'
      ? 'You have taken the first step towards a healthier life, so Congratulations!'
      : 'Has dado el primer paso hacia una vida más saludable, así que ¡Felicidades!';

    await sendMessage(senderId, welcomeMessage);
    await sendMessage(senderId, congratulationsMessage);
    await userService.updateUser(senderId, { estado: 'solicitudnombre' });

    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'solicitudnombre';

    await sendMessage(senderId, languageCode === 'ingles'
      ? "First of all, what is your name?"
      : "Primero que todo, ¿Cómo te llamas?");
  } else {
    await sendMessage(senderId, 'Por favor selecciona tu idioma. English/Español');
  }
};

const handleNameRequest = async (senderId, receivedMessage) => {
  // Convierte el primer carácter de cada palabra a mayúscula y el resto a minúscula
  const userName = receivedMessage.trim().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  const nameParts = userName.split(" ");

  
  let user = userContext[senderId]; // Obtener la información del usuario desde el contexto

  // Si no hay información del usuario en el contexto, obtenerla desde la base de datos
  if (!user) {
    const userData = await userService.getUser(senderId);
    const userDataFields = userData._fieldsProto;
    userContext[senderId] = {
      idioma: userDataFields.idioma.stringValue,
      estado: userDataFields.estado.stringValue
    };
    user = userContext[senderId];
  }

  const language = user.idioma;
  const estado = user.estado;

  console.log(`Usuario ${senderId} tiene idioma: ${language}`);

  if (nameParts.length === 1) {
    await userService.updateUser(senderId, { nombre: userName, estado: 'presentacionbot' });
    console.log(`Usuario ${senderId} actualizado con nombre: ${userName} y estado: presentacionbot`);

    await sendMessage(senderId, language === 'ingles'
      ? `Nice to meet you ${userName}! My name is Xoee 010010100101010100101110100100101010101010010 and I will be your personal assistant on this journey.`
      : `¡Qué gusto ${userName}! Yo me llamo 010010100101010100101110100100101010101010010, y seré tu asistente personal en este viaje.`);
    await sendMessage(senderId, language === 'ingles'
      ? `Haha, I'm just kidding! My name is Eli, your quit vaping coach. We will start by creating a special plan for you.`
      : `Jajaj, sólo estoy bromeando! Me llamo Eli, tu coach para dejar de vapear. Comenzaremos creando un plan especial para tí.`);
    await userService.updateUser(senderId, { estado: 'consentimientocuestionario' });

    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = 'consentimientocuestionario';
  } else {
    const nextState = estado === 'solicitudnombre' ? 'pregunta_secundaria' : 'pregunta_terciaria';
    await userService.updateUser(senderId, { estado: nextState });
    console.log(`Usuario ${senderId} actualizado con estado: ${nextState}`);

    // Actualizar el estado en el contexto del usuario
    userContext[senderId].estado = nextState;

    const message = nextState === 'pregunta_secundaria'
      ? (language === 'ingles' ? "Okay... What would you like me to call you?" : "Ok… ¿Cómo prefieres que te diga?")
      : (language === 'ingles' ? "Oops! I didn't catch that. What do you want me to call you?" : "Opps! No entendí eso. ¿Cómo quieres que te llame?");
    await sendMessage(senderId, message);
  }
};
