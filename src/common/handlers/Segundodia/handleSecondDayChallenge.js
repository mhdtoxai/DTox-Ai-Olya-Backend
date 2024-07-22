const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const schenduleSecondDay = require('./schenduleSecondDay');

const handleSecondDayChallenge = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre ,timezone } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} nombre: ${nombre}  timezone: ${timezone}`);
    // Programar mensaje para el segundo dia
    await schenduleSecondDay(senderId);


  } catch (error) {
    console.error('Error al manejar el reto de segundo dia:', error);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};


module.exports = handleSecondDayChallenge;
