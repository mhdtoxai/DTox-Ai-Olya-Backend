const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext'); 
const handleFirstDayChallenge = require('./Primerdia/handleFirstDayChallenge'); // Importar la función

const handlePaymentCompleted = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y idioma
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Enviar mensaje de confirmación
    const message = idioma === 'ingles'
      ? `Payment completed! You are officially wonderful!`
      : `¡Pago completado! ¡Eres oficialmente maravillosx! Como dicen en mi pueblo, ¡A darle que es mole de olla!`;

    await sendMessage(senderId, message);

    // Actualizar el estado del usuario
    await userService.updateUser(senderId, { estado: 'primerdia', membresia: 'activa' });
    userContext[senderId].estado = 'primerdia';
    userContext[senderId].membresia = 'activa';

    console.log(`Estado actualizado a primerdia para ${senderId}`);
    console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);

    // Llamar a la función handleFirstDayChallenge
    await handleFirstDayChallenge(senderId);

  } catch (error) {
    console.error('Error al manejar pago completado:', error);
    throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
  }
};

module.exports = handlePaymentCompleted;
