const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const handleTestVape = require('./handleTestVape');

const handlePaymentCompleted = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y idioma
    const { idioma, estado, nombre } = await getUserInfo(senderId);

    // Enviar mensaje de confirmación
    const message1 = idioma === 'ingles'
      ? `🥳 Congratulations. 🏆 You are officially awesome 🏆`
      : `🥳 Felicidades. 🏆 Eres oficialmente crack 🏆`;

    const message2 = idioma === 'ingles'
      ? `Let's measure your lung capacity! This is a 1-minute breath-holding exercise.`
      : `¡Haremos una medición de tu capacidad pulmonar! Este es un ejercicio de retención de aire que dura 1 minuto.`;

    await sendMessage(senderId, message1);
    await delay(3000);  // Espera 3 segundos
    await sendMessage(senderId, message2);
    await delay(3000);  // Espera 3 segundos

    // Actualizar el estado del usuario
    await userService.updateUser(senderId, { estado: 'primertest', membresia: 'activa' });

    // Llamar a la función para manejar el estado 'primertest'
    await handleTestVape(senderId);

  } catch (error) {
    console.error('Error al manejar pago completado:', error);
    throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
  }
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handlePaymentCompleted;
