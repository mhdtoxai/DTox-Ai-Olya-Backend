const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const userService = require('../../services/userService'); // Importar el servicio de usuario
const handlePaymentCompleted = require('../../handlers/handlePaymentCompleted'); // Importar la función


exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verificar la firma del webhook de Stripe
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (error) {
    console.error('⚠️  Fallo en la verificación de la firma del webhook.', error.message);
    return res.status(400).json({ error: `Error de Webhook: ${error.message}` });
  }

  // Manejar el evento
  switch (event.type) {
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      const userId = checkoutSessionCompleted.metadata.userId; // Obtener userId desde la metadata
      const productId = checkoutSessionCompleted.metadata.productId; // Obtener productId desde la metadata

      try {
        // Verificar el pago y actualizar estado en Firebase Firestore
        await verifyAndUpdatePayment(userId, checkoutSessionCompleted.id);


        // Llamar a la función handlePaymentCompleted
        await handlePaymentCompleted(userId);

        // Mostrar en consola detalles del evento
        console.log('Compra completada para el producto con ID:', userId);
        console.log({ checkoutSessionCompleted });


        res.status(200).end();
      } catch (error) {
        console.error('Error al verificar y actualizar el pago:', error);
        res.status(500).json({ error: 'Error interno al procesar el pago.' });
      }
      break;
    default:
      console.log(`Evento no manejado: ${event.type}`);
      res.status(200).end();
  }
};

// Función para verificar y actualizar el estado de pago en Firebase Firestore
async function verifyAndUpdatePayment(userId, sessionId) {
  try {
    const userDoc = await userService.getUser(userId);

    if (!userDoc.exists) {
      throw new Error(`Usuario con ID ${userId} no encontrado.`);
    }

    // Actualizar el estado del usuario y el estado de membresía
    await userService.updateUser(userId, {
      estado: 'pagado', // Actualiza el estado de pago del usuario a 'pagado'
      membresia: 'activa',  // Actualiza el estado de membresía a 'activa'
      ultimoPago: {
        sessionId: sessionId,
        fecha: new Date() // Utilizar la fecha actual
      }
    });

    console.log(`Estado de pago y membresía actualizados para el usuario ${userId}.`);
  } catch (error) {
    console.error('Error al actualizar el estado de pago:', error);
    throw error; // Re-lanzar el error para que sea manejado en el manejador del webhook
  }
}
