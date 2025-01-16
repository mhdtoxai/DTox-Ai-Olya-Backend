const Stripe = require('stripe'); 
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const shortenUrl = require('../../api/shortenUrl'); // Ruta a tu función de acortar URL con TinyURL
const axios = require('axios'); // Asegúrate de tener Axios instalado

// Función para verificar el estado de la membresía
const checkMembershipStatus = async (senderId) => {
  try {
    // Enviar el senderId como userId en el cuerpo de la solicitud
    const response = await axios.post('https://olya.club/api/user/get', {
      userId: senderId
    });
    return response.data.membresia; // Devuelve el estado de membresía (activa o inactiva)
  } catch (error) {
    console.error('Error al verificar el estado de la membresía:', error.response ? error.response.data : error.message);
    return null; // Si ocurre un error, devolvemos null
  }
};

const handlePaymentPendient = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre y el idioma
    const { idioma, nombre } = await getUserInfo(senderId);

    // Definir la moneda y el monto según el idioma
    const currency = idioma === 'ingles' ? 'usd' : 'mxn';
    const unitAmount = idioma === 'ingles' ? 1000 : 19900; // 1000 centavos = 10 USD, 19900 centavos = 199 MXN
    const productName = idioma === 'ingles'
      ? 'Plan to Quit Vaping' // Nombre del producto en inglés
      : 'Plan para dejar de vapear'; // Nombre del producto en español

    // Configurar el idioma del formulario de Stripe Checkout
    const locale = idioma === 'ingles' ? 'en' : 'es';

    // Generar el enlace de pago seguro utilizando Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency, // Asignar la moneda basada en el idioma
            product_data: {
              name: productName, // Nombre del producto dependiendo del idioma
              images: ['https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/logo.jpg?alt=media&token=558453f9-cab7-4d80-ba5d-2610059726e5'], // URL pública de la imagen del producto
            },
            unit_amount: unitAmount, // Asignar el precio basado en el idioma (10 USD o 199 MXN)
          },
          quantity: 1,
        },
      ],
      locale, // Asignar el idioma del formulario basado en el idioma del usuario
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
      ? `💳 🔐 Your secure STRIPE payment link (Expires in 5 minutes): ${shortenedUrl}`
      : `💳 🔐 Tu liga única segura STRIPE para pagos (Caduca en 5 minutos): ${shortenedUrl}`;

    // Enviar el mensaje con el enlace de pago acortado al usuario
    await sendMessage(senderId, paymentMessage);

    // Actualizar el estado del usuario y el estado de membresía
    await userService.updateUser(senderId, { membresia: 'inactiva' });

    setTimeout(async () => {
      const membresiaStatus = await checkMembershipStatus(senderId);

      // Si la membresía sigue inactiva, enviar recordatorio
      if (membresiaStatus === 'inactiva') {
        const reminderMessage = idioma === 'ingles'
          ? `⏳ Hey! I'm waiting for you. Complete your signup to begin your devaping program. Let's do this! ${shortenedUrl}`
          : `⏳ Hola! No te olvides de mi, completa tu registro para iniciar tu programa para dejar de vapear. ¡Te espero! ${shortenedUrl}`;

        await sendMessage(senderId, reminderMessage);
      }
    }, 3600000); // Esperar 1 hora antes de verificar y enviar recordatorio

  } catch (error) {
    console.error('Error al manejar plan enviado:', error);
  }
};

module.exports = handlePaymentPendient;
