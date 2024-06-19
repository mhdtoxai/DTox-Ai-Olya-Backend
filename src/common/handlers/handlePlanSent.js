const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext'); 

const handlePlanSent = async (senderId) => {
  try {
 // Obtener la información del usuario incluyendo el nombre
 const { idioma, estado, nombre } = await getUserInfo(senderId);
 console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    
    const message1 = idioma === 'ingles'
      ? `This plan has been specially created for you. Most importantly, you can quit vaping in just 10 days!`
      : `Este plan ha sido creado especialmente para ti. ¡Lo más importante es que puedes dejar de vapear en sólo 10 días!`;
    const message2 = idioma === 'ingles'
      ? `The full plan costs only $199.00 MXN, less than what you spend on a vape!`
      : `El plan completo cuesta únicamente $199.00 MXN, ¡Menos de lo que te cuesta un vape!`;
    const message3 = idioma === 'ingles'
      ? `Here is the secure link to complete the payment and continue. For security, you have only 2 minutes to process the payment.
Secure payment: https://buy.stripe.com/test_fZecMT6q69vM72E9AA`
      : `Te dejo la liga segura para que puedas completar el pago y continuemos. Por seguridad tienes únicamente 2 minutos para procesar el pago.
Pago seguro: https://buy.stripe.com/test_fZecMT6q69vM72E9AA`;

    await sendMessage(senderId, message1);
    await sendMessage(senderId, message2);
    await sendMessage(senderId, message3);

    await userService.updateUser(senderId, { estado: 'pagopendiente' });
    
    // Actualizar el estado del usuario
    await userService.updateUser(senderId, { estado: 'pagopendiente' });
    userContext[senderId].estado = 'pagopendiente';

  } catch (error) {
    console.error('Error al manejar plan enviado:', error);
  }
 // Imprimir todo el contexto del usuario en la consola
 console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

module.exports = handlePlanSent;
