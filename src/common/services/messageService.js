
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
          case 'consentimientocuestionario':
          case 'pregunta_secundaria_cuestionario':
          await handleConsentResponse(senderId, receivedMessage);
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
      ? 'Hello! I am Olya, the smartest virtual assistant that will help you quit vaping'
      : '¡Hola! Soy Olya, el asistente virtual más inteligente que te ayudará a dejar de vapear';
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

  
  const { language, estado } = await getUserInfo(senderId);

  console.log(`Usuario ${senderId} tiene idioma: ${language}`);


  if (nameParts.length === 1) {
    await userService.updateUser(senderId, { nombre: userName, estado: 'plan' });

    await sendMessage(senderId, language === 'ingles'
      ? `We will start by creating a special plan for you.All Right?`
      : `Comenzaremos creando un plan especial para tí. Esta bien?`);

      
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

const handleConsentResponse = async (senderId, receivedMessage) => {
  const { language, estado } = await getUserInfo(senderId);
  console.log(`Usuario ${senderId} tiene idioma: ${language} y estado: ${estado}`);
  
  // Definimos algunas respuestas afirmativas que pueden indicar consentimiento
  const affirmativeResponses = ['yes','ok','okey', 'yeah', 'sure', 'of course', 'okay', 'si', 'claro', 'por supuesto'];

  if (affirmativeResponses.includes(receivedMessage.toLowerCase())) {
    await sendMessage(senderId, language === 'ingles'
      ? "Great! Let's proceed with the questions."
      : "¡Genial! Procedamos con las preguntas.");

    // Actualizar el estado después de obtener el consentimiento
    await userService.updateUser(senderId, { estado: 'consentimientoaceptado' });
  } else {
    // En caso de que la respuesta no sea afirmativa
    await sendMessage(senderId, language === 'ingles'
      ? "I'm sorry, I didn't catch that. Can we move on to the questions so I can assist you better?"
      : "Lo siento, no entendí eso. ¿Podemos pasar a las preguntas para que pueda ayudarte mejor?");

    // Actualizar el estado en caso de que el usuario no dé su consentimiento
    await userService.updateUser(senderId, { estado: 'pregunta_secundaria_cuestionario' });
  }
};

async function getUserInfo(senderId) {
  let user = userContext[senderId];

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

  return { language, estado };
}
