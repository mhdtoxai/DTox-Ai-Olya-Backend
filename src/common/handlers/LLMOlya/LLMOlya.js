const axios = require('axios');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const userService = require('../../services/userService'); // Importa el servicio para consultar el usuario

const LLMOlya = async (senderId, receivedMessage) => {
  // Consultar el estado del usuario
  const userDoc = await userService.getUser(senderId);

  if (!userDoc.exists) {
    console.log(`Usuario no encontrado: ${senderId}`);
    return false;
  }

  const userData = userDoc.data();
  const estadoUsuario = userData.estado;

  // Lista de estados excluidos
  const estadosExcluidos = [
    'idiomaseleccionado',
    'solicitudnombre',
    'pregunta_secundaria',
    'pregunta_terciaria',
    'seleccionnivel',
    'compromisopendiente'
  ];

  // Si el estado está en la lista de estados excluidos, no ejecutamos la API
  if (estadosExcluidos.includes(estadoUsuario)) {
    console.log(`Estado ${estadoUsuario} excluido. No se ejecutará LLMOlya.`);
    return false;
  }

  const url = 'https://api-olya.saptiva.com/olya';
  const token = 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcyNzk5MTEwMSwiaWF0IjoxNzI3OTkxMTAxfQ.qtTiySvK_DB1xVfWrGztWPHrlzRoD2xVe9JRnDSTrqk'; 

  const body = {
    from: senderId,
    query: receivedMessage,
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const botResponse = response.data.response;

    console.log('Respuesta de la API Olya:', botResponse);

    // Enviar el mensaje de respuesta al usuario
    await sendMessage(senderId, botResponse);
    return true;
  } catch (error) {
    console.error('Error al llamar a la API:', error);
    return false; // Retornar false en caso de error
  }
};

module.exports = LLMOlya;

