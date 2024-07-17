const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const scheduleNightMessage = require('./scheduleNightMessage');

const handleFirstNightChallenge = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);
    // Programar mensaje nocturno
    await scheduleNightMessage(senderId);


  } catch (error) {
    console.error('Error al manejar el reto de la noche:', error);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};


module.exports = handleFirstNightChallenge;
