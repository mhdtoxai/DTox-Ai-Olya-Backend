const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext');
const sendStickerMessage = require('../services/Wp-Envio-Msj/sendStickerMessage');
const handleFirstDayChallenge = require('./Primerdia/handleFirstDayChallenge');

const handlePaymentCompleted = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y idioma
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Enviar mensaje de confirmación
    const message1 = idioma === 'ingles'
      ? `Congratulations, you're officially crack! Your future self is immensely grateful to you.!`
      : `Felicidades, eres oficialmente crack! Tu yo del futuro esta inmensamente agradecido contigo.`;

    // Enviar mensaje de confirmación
    const message2 = idioma === 'ingles'
      ? `As they say in my town, Let's give it, it's pot mole!`
      : `Como dicen en mi pueblo, ¡A darle que es mole de olla!`;

    await sendMessage(senderId, message1);
    await delay(5000);  // Espera 5 segundos
    await sendMessage(senderId, message2);



    // Enviar la imagen inicial
    await sendStickerMessage(senderId, '7911898695500174');
    await delay(5000);
    // Mensaje del primer reto
    const firstChallengeMessage = idioma === 'ingles'
      ? "Your first challenge begins tomorrow."
      : "Tu primer reto comienza mañana.";
    await sendMessage(senderId, firstChallengeMessage);
    await delay(5000);

    // Actualizar el estado del usuario
    await userService.updateUser(senderId, { estado: 'primerdia', membresia: 'activa' });
    userContext[senderId].estado = 'primerdia';
    userContext[senderId].membresia = 'activa';


    // Llamar a la función handleFirstDayChallenge
    await handleFirstDayChallenge(senderId);

  } catch (error) {
    console.error('Error al manejar pago completado:', error);
    throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
  }

  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);

};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handlePaymentCompleted;
