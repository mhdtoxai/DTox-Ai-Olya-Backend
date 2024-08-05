const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');
const handleTestVape = require('./handleTestVape');


const handlePaymentCompleted = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y idioma
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);
    // Enviar mensaje de confirmación
    const message1 = idioma === 'ingles'
      ? `🥳 Congratulations. 🏆 You are officially awesome 🏆`
      : `🥳 Felicidades. 🏆 Eres oficialmente crack 🏆`;


      const message2 = idioma === 'ingles'
      ? `Let's measure your lung capacity! This is a 1-minute breath-holding exercise.`
      : `¡Haremos una medición de tu capacidad pulmonar! Este es un ejercicio de retención de aire que dura 1 minuto.`;
    

    await sendMessage(senderId, message1);
    await delay(3000);  // Espera 5 segundos
    await sendMessage(senderId, message2);
    await delay(3000);  // Espera 5 segundos




    // Actualizar el estado del usuario
    await userService.updateUser(senderId, { estado: 'primertest', membresia: 'activa' });
    userContext[senderId].estado = 'primertest';
    userContext[senderId].membresia = 'activa';


    //  // Llamar a la función para manejar el estado 'pagopendiente'
    await handleTestVape(senderId);

  } catch (error) {
    console.error('Error al manejar pago completado:', error);
    throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
  }

  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);

};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handlePaymentCompleted;
