const axios = require('axios');
const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const handleSelectModeLevel = require('./handleSelectModeLevel');

const handleReportVape = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y idioma
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

   
    // Obtener el score más reciente desde la API
    const response = await axios.post('https://jjhvjvui.top/api/test/testrespiracion/obtenerpruebas', { userId: senderId });
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
      ? `📊 Your recorded score for this test is ${score}. In the coming days, we will be conducting additional tests.`
      : `📊 Tu score registrado para esta prueba es de ${score}. En los próximos días estaremos haciendo algunas pruebas adicionales.`;

    const supportCriteriaMessage = idioma === 'ingles'
      ? `Now we will define the criteria with which I will be supporting you throughout the day:\n\n**High**: Many messages to remind you of your mission.\n**Medium**: Alerts at key moments of the day to help you stay strong.\n**Low**: I will remind you 3 or 4 times a day to keep you free from vaping.`
      : `Ahora definiremos los criterios con que te estaré apoyando a través del día:\n\n**Alto**: Muchos mensajes para recordarte de tu misión.\n**Medio**: Alertas en momentos clave del día que te ayuden a mantenerte firme.\n**Bajo**: Te estaré recordando 3 o 4 veces durante el día sobre librarte del vaping.`;

    await sendMessage(senderId, scoreMessage);
    await delay(2000);  // Espera 2 segundos
    await sendMessage(senderId, supportCriteriaMessage);

    await handleSelectModeLevel(senderId);


    // Actualizar el estado después de enviar mensajes
    await userService.updateUser(senderId, { estado: 'opcionesnivel' });
    userContext[senderId].estado = 'opcionesnivel';
  } catch (error) {
    console.error('Error al manejar opcionesnivel :', error);
  }
  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleReportVape;
