const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext');

const handlePlanSent = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Mensajes según el idioma del usuario
    const message1 = idioma === 'ingles'
      ? `This plan has been specially created for you. Most importantly, you can quit vaping in just 10 days!`
      : `Este plan ha sido creado especialmente para ti. ¡Lo más importante es que puedes dejar de vapear en sólo 10 días!`;
    const message2 = idioma === 'ingles'
      ? `The full plan costs only $199.00 MXN, less than what you spend on a vape!`
      : `El plan completo cuesta únicamente $199.00 MXN, ¡Menos de lo que te cuesta un vape!`;

    // Enviar los mensajes iniciales al usuario
    await sendMessage(senderId, message1);
    await sendMessage(senderId, message2);

    // Generar el enlace de pago seguro utilizando Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'Plan para dejar de vapear', // Nombre del producto
              images: ['https://jjhvjvui.top/img/logo.jpg'], // URL pública de la imagen del producto

            },
            unit_amount: 19900, // Monto en centavos (199.00 MXN)
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: senderId, // ID del usuario para referencia
      },
      mode: 'payment',
      success_url: 'https://wa.me/5214871956877', // URL para redirigir después de un pago exitoso
      cancel_url: 'https://wa.me/5214871956877', // URL para redirigir después de un pago cancelado
    });

    // Mensaje con el enlace de pago
    const message3 = idioma === 'ingles'
      ? `Here is the secure link to complete the payment and continue. For security, you have only 2 minutes to process the payment. Secure payment: ${session.url}`
      : `Te dejo la liga segura para que puedas completar el pago y continuemos. Por seguridad tienes únicamente 2 minutos para procesar el pago. Pago seguro: ${session.url}`;

    // Enviar el mensaje con el enlace de pago al usuario
    await sendMessage(senderId, message3);

    // Actualizar el estado del usuario y el estado de membresía
    await userService.updateUser(senderId, { estado: 'pagopendiente', membresia: 'inactiva' });

    // Actualizar el contexto del usuario
    userContext[senderId].estado = 'pagopendiente';
    userContext[senderId].membresia = 'inactiva';

    // Imprimir el contexto del usuario en la consola
    console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);

  } catch (error) {
    console.error('Error al manejar plan enviado:', error);
  }
};

module.exports = handlePlanSent;
