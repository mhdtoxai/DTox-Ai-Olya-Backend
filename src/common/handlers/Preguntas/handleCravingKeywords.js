const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendTextWithPreview = require('../../services/Wp-Envio-Msj/sendTextWithPreview');
const getUserInfo = require('../../services/getUserInfo');
const sendAudioMessage = require('../../services/Wp-Envio-Msj/sendAudioMessage');
const keywords = require('./keywords');  // Asegúrate de ajustar la ruta
const admin = require('firebase-admin'); // Necesario para FieldValue

const resources = {
  ingles: {
    respiracion: [
      'https://player.vimeo.com/video/1006450075',
      'https://player.vimeo.com/video/1006454218',
      'https://player.vimeo.com/video/1006454899'
    ],
    meditacion: [
      'https://player.vimeo.com/video/1009496316',
      'https://player.vimeo.com/video/1009496222'
    ],
    audio: [
      'https://drive.google.com/uc?export=download&id=1KWBpzaPJafsYnZAOk6MSVI204eDSWleX',
      'https://drive.google.com/uc?export=download&id=1f4CKlGCAQWf86eyyrUn_uDNHoEpVNmMN',
      'https://drive.google.com/uc?export=download&id=1TCcufwVJi62v4ofap6iJuIegNFdjEGRJ',
      'https://drive.google.com/uc?export=download&id=16ZPhUKfPAMs4sVpo6wLLZT2afYFTQb3a'
    ]
  },
  español: {
    respiracion: [
      'https://player.vimeo.com/video/1006450075',
      'https://player.vimeo.com/video/1006454218',
      'https://player.vimeo.com/video/1006454899'
    ],
    meditacion: [
      'https://player.vimeo.com/video/998465018',
      'https://player.vimeo.com/video/998465098'
    ],
    audio: [
      'https://drive.google.com/uc?export=download&id=1WKzHSKqydoy1uAva6jnNGZU51mxjNgq2',
      'https://drive.google.com/uc?export=download&id=17B5WK1IR3mba09kmTJQxk9bWfXB6Eies',
      'https://drive.google.com/uc?export=download&id=1_US1i0LYReCTBddNddjimSkyjZms2Vvq',
      'https://drive.google.com/uc?export=download&id=1tF0C0yPYOQEB8m0kySppaBSX4BlXUpSB'
    ]
  }
};



// Función para obtener un recurso aleatorio que no haya sido enviado
const getRandomResource = async (category, language, senderId) => {
  try {
    const userDoc = await userService.getUser(senderId);
    const userData = userDoc.exists ? userDoc.data() : {};

    let sentResources = (userData.recursos && userData.recursos[category]) || [];

    // Filtrar recursos no enviados
    let availableResources = resources[language][category].filter(resource => !sentResources.includes(resource));

    if (availableResources.length === 0) {
      // Si no hay recursos disponibles, reiniciar la lista de enviados
      await userService.updateUser(senderId, {
        [`recursos.${category}`]: []
      });

      // Volver a obtener todos los recursos disponibles
      availableResources = [...resources[language][category]];
    }

    // Seleccionar un recurso aleatorio de los disponibles
    const randomIndex = Math.floor(Math.random() * availableResources.length);
    const selectedResource = availableResources[randomIndex];

    // Registrar el recurso como enviado
    await userService.updateUser(senderId, {
      [`recursos.${category}`]: admin.firestore.FieldValue.arrayUnion(selectedResource)
    });

    return selectedResource;
  } catch (error) {
    console.error('Error al obtener recurso aleatorio:', error);
    throw error;
  }
};


// Función para verificar membresía
const checkMembership = async (senderId) => {
  try {
    const userDoc = await userService.getUser(senderId);
    if (userDoc.exists) {
      const userData = userDoc.data();
      if (userData.membresia === 'activa') {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error al verificar membresía:', error);
    return false;
  }
};

// Función para obtener un mensaje calmante aleatorio
const getRandomCalmMessage = (language) => {
  const messages = language === 'ingles'
    ? [
      'Stay calm! Don’t worry. I’m here to help you get through this craving.',
      'Don’t panic! I’m here to help you get through this craving.'
    ]
    : [
      '¡Calma! No te preocupes. Estoy aquí para ayudarte a pasar este antojo.',
      '¡No entres en pánico! Estoy aquí para ayudarte a pasar este antojo.'
    ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
};

// Función para enviar mensaje de error
const sendMembershipErrorMessage = async (senderId, idioma) => {
  const message = idioma === 'ingles'
    ? 'Sorry, but you cannot access this feature. You need an active membership.'
    : 'Lo siento, pero no puedes acceder a esta función. Es necesario que tengas una membresía activa.';

  await sendMessage(senderId, message);
};


const handleOptionKeywords = async (senderId, receivedMessage) => {
  try {
    // Convertir el mensaje a minúsculas
    const messageLowerCase = receivedMessage.toLowerCase();

    // Verificar si el mensaje contiene alguna palabra clave en inglés o español
    const keywordListIngles = keywords['ingles'];
    const keywordListEspanol = keywords['español'];

    const containsKeyword = (keywordListIngles.some(keyword => messageLowerCase.includes(keyword)) ||
                             keywordListEspanol.some(keyword => messageLowerCase.includes(keyword)));

    // Si no contiene ninguna palabra clave, retornar false
    if (!containsKeyword) {
      return false;
    }

    // Obtener información del usuario solo si se encontró una palabra clave
    const { estado, nombre, idioma } = await getUserInfo(senderId);

    // Verificar si el idioma tiene palabras clave definidas
    const keywordList = keywords[idioma];
    if (!keywordList || keywordList.length === 0) {
      console.error(`No se encontraron palabras clave para el idioma: ${idioma}`);
      return false;  // Si no se encuentran palabras clave para el idioma, detener la función
    }

    // Verificar si el mensaje contiene alguna de las palabras clave
    if (keywordList.some(keyword => messageLowerCase.includes(keyword))) {
      
      // Verificar membresía antes de proceder
      const isMembershipActive = await checkMembership(senderId);
      if (!isMembershipActive) {
        await sendMembershipErrorMessage(senderId, idioma);
        return false;
      }

      // Si la membresía está activa, enviar el mensaje calmante
      const calmMessage = getRandomCalmMessage(idioma);
      await sendMessage(senderId, calmMessage);


      // Enviar las tarjetas de opciones
      const buttons = [
        { id: 'resp-9f7d2b8c', title: idioma === 'ingles' ? 'Breathing' : 'Respiración' },
        { id: 'med-a3c8d9e2', title: idioma === 'ingles' ? 'Meditation' : 'Meditación' },
        { id: 'aud-7f4e1c0d', title: idioma === 'ingles' ? 'Audio' : 'Audio' }
      ];

      const optionsMessage = idioma === 'ingles'
        ? 'Now, let’s focus your attention on something very specific. Choose one of the following options:'
        : 'Ahora, enfoquemos tu atención en algo muy puntual. Elige una de las siguientes opciones:';

      await sendMessageTarget(senderId, optionsMessage, buttons);
      return true;
    }

    // Manejar la selección de recursos si se han recibido mensajes válidos
    let resourceUrl;

    switch (receivedMessage) {
      case 'resp-9f7d2b8c':
        resourceUrl = await getRandomResource('respiracion', idioma, senderId);
        break;
      case 'med-a3c8d9e2':
        resourceUrl = await getRandomResource('meditacion', idioma, senderId);
        break;
      case 'aud-7f4e1c0d':
        resourceUrl = await getRandomResource('audio', idioma, senderId);
        break;
      default:
        return false;
    }

    if (resourceUrl) {
      if (receivedMessage === 'aud-7f4e1c0d') {
        await sendAudioMessage(senderId, resourceUrl);
      } else {
        await sendTextWithPreview(senderId, idioma === 'ingles'
          ? `Good choice. Click here: ${resourceUrl}`
          : `Buena elección. Da clic aquí: ${resourceUrl}`);
      }

      const followUpMessage = idioma === 'ingles'
        ? 'I hope this exercise helps you feel better.'
        : 'Espero con este ejercicio te sientas mejor.';

      await sendMessage(senderId, followUpMessage);
    }

    return true;
  } catch (error) {
    console.error('Error al manejar la selección de opción:', error);
    return false;
  }
};

module.exports = handleOptionKeywords;

