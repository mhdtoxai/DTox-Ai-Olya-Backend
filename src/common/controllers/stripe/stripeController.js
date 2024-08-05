const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const userService = require('../../services/userService'); // Importar el servicio de usuario
const handlePaymentCompleted = require('../../handlers/Onboarding/handlePaymentCompleted'); // Importar la función


exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
      event = await stripe.webhooks.constructEvent(
          req.body,
          sig,
          endpointSecret
      );
      res.send(event);
  } catch (err) {
      console.log(err);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
  }
  switch (event.type) {
    case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;

        // Obtener userId y sessionId del evento
        const userId = checkoutSessionCompleted.metadata.userId;
        const sessionId = checkoutSessionCompleted.id;

        console.log(checkoutSessionCompleted);

        try {
            await verifyAndUpdatePayment(userId, sessionId);
            console.log(`Pago verificado para el usuario ${userId}`);
        } catch (error) {
            console.error(`Error al verificar el pago del usuario${userId}:`, error);
            res.status(500).send(`Error verificando y actualizando pago ${error.message}`);
            return;
        }

        break;
  
    default:
        console.log(`Unhandled event type ${event.type}`);
}
  res.send();
}



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
        // Llamar a la función handlePaymentCompleted
        await handlePaymentCompleted(userId);
  } catch (error) {
    console.error('Error al actualizar el estado de pago:', error);
    throw error; // Re-lanzar el error para que sea manejado en el manejador del webhook
  }
}