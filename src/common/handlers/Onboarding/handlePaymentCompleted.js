const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const handleTestVape = require('./handleTestVape');
const sendContactMessage = require('../../services/Wp-Envio-Msj/sendContactMessage');

const handlePaymentCompleted = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y idioma
    const { idioma, estado, nombre , codigo} = await getUserInfo(senderId);

    // Enviar mensaje de confirmación
    const message1 = idioma === 'ingles'
      ? `🥳 Congratulations. 🏆 You’re officially awesome 🏆 🏆`
      : `🥳 Felicidades. 🏆 Eres oficialmente crack 🏆`;


      const message2 = idioma === 'ingles'
      ? `${nombre}. 🗣️🗣️ Spread the word and earn 1USD for each referral. You just need to share your unique code. Forward the following message to those you can help improve their health:`
      : `${nombre}. 🗣️🗣️ Corre la voz y gana 1USD por cada referido. Únicamente deberás compartirle tu código único. Reenvía lo siguiente a quien puedes ayudar a mejorar su salud:`;
    

      const message3 = idioma === 'ingles'
      ? `Hi! I've already decided to quit vaping, what about you? What are you waiting for?\nThe complete program costs 10USD, and with my code, you get a 15% discount.\n\nDiscount code: ${codigo} \n\nWith Olya, it's possible to be free.`
      : `Hola! Yo ya tomé la decisión de dejar de vapear, ¿y tú? ¿Qué esperas?\nEl programa completo cuesta 10USD y con mi código recibes un descuento del 15%.\n\nCódigo de descuento: ${codigo}\n\nCon Olya, es posible ser libre.`;
    
      const message4 = idioma === 'ingles'
      ? `I’ll be measuring your lung capacity. It’s a breath-holding exercise that takes 1 minute.`
      : `¡Haremos una medición de tu capacidad pulmonar! Este es un ejercicio de retención de aire que dura 1 minuto.`;



    await sendMessage(senderId, message1);
    await delay(3000);  // Espera 3 segundos
    await sendMessage(senderId, message2);
    await delay(3000);  // Espera 3 segundos
    await sendMessage(senderId, message3);
    await delay(3000);  // Espera 3 segundos
    await sendContactMessage(senderId);
    await delay(3000);  // Espera 3 segundos
    await sendMessage(senderId, message4);



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
