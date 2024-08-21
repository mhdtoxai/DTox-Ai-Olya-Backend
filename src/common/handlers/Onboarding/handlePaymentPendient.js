const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const shortenUrl = require('../../api/shortenUrl'); // Ruta a tu función de acortar URL con TinyURL

const handlePaymentPendient = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, nombre } = await getUserInfo(senderId);

    // Generar el enlace de pago seguro utilizando Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'Plan para dejar de vapear', // Nombre del producto
              images: ['https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/logo.jpg?alt=media&token=558453f9-cab7-4d80-ba5d-2610059726e5'], // URL pública de la imagen del producto
            },
            unit_amount: 19900, // Monto en centavos (199.00 MXN)
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: true, // Habilitar el ingreso de códigos promocionales

      metadata: {
        userId: senderId, // ID del usuario para referencia
      },
      mode: 'payment',
      success_url: 'https://wa.me/5214871956877', // URL para redirigir después de un pago exitoso
      cancel_url: 'https://wa.me/5214871956877', // URL para redirigir después de un pago cancelado
    });

    // Acortar la URL de sesión con TinyURL
    const shortenedUrl = await shortenUrl(session.url);

    // Mensaje con el enlace de pago acortado
    const paymentMessage = idioma === 'ingles'
      ? `💳 🔐 Your unique secure STRIPE link for payments (Expires in 5 minutes): ${shortenedUrl}`
      : `💳 🔐 Tu liga única segura STRIPE para pagos (Caduca en 5 minutos): ${shortenedUrl}`;

    // Enviar el mensaje con el enlace de pago acortado al usuario
    await sendMessage(senderId, paymentMessage);

    // Actualizar el estado del usuario y el estado de membresía
    await userService.updateUser(senderId, { membresia: 'inactiva' });

  } catch (error) {
    console.error('Error al manejar plan enviado:', error);
  }
};

module.exports = handlePaymentPendient;
