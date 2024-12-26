const axios = require('axios');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');


const scorehandle = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y idioma
    const { idioma, estado, nombre } = await getUserInfo(senderId);

    // Obtener el score más reciente desde la API
    const response = await axios.post('https://olya.club/api/test/testrespiracion/obtenerpruebas', { userId: senderId });
    const tests = response.data;
    if (tests.length === 0) {
      console.log('No se encontraron tests para el usuario');
      return;
    }

    const latestTest = tests.reduce((latest, current) => {
      return new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current;
    });
    const score = latestTest.score;

    const scoreMessage = idioma === 'ingles'
      ? `📊 Test Complete ! Your recorded score for this test is ${score}.`
      : `📊 Test Completado ! Tu score registrado para esta prueba es de ${score}. `;


    await sendMessage(senderId, scoreMessage);

  } catch (error) {
    console.error('Error al manejar score  :', error);
  }
};

module.exports = scorehandle;
