const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const userService = require('../../services/userService'); // Importar el servicio de usuario
const handlePaymentCompleted = require('../../handlers/Onboarding/handlePaymentCompleted'); // Importar la función
const generateUniqueCode = require('./generateUniqueCode'); // Importar la función para generar códigos únicos
const createStripeCoupon = require('./createStripeCoupon'); // Importar la función para crear cupones en Stripe

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
      {
        const checkoutSessionCompleted = event.data.object;
        const userId = checkoutSessionCompleted.metadata.userId;
        const sessionId = checkoutSessionCompleted.id;
        console.log("Checkout session completada:", checkoutSessionCompleted);

        try {
          await verifyAndUpdatePayment(userId, sessionId);
          console.log(`Pago verificado para el usuario ${userId}`);
        } catch (error) {
          console.error(`Error al verificar el pago del usuario ${userId}:`, error);
          return res.status(500).send(`Error verificando y actualizando pago: ${error.message}`);
        }
      }
      break;

    case "customer.discount.created":
      {
        const discountCreated = event.data.object;
        console.log("Información del descuento creado:", discountCreated);

        const coupon = discountCreated.coupon;
        const userCode = coupon.name;
        const checkoutSession = discountCreated.checkout_session;  // Obtener el checkout session

        try {
          const sessionDetails = await stripe.checkout.sessions.retrieve(checkoutSession);
          const userId = sessionDetails.metadata.userId;
          console.log(`Registrando el uso del cupón ${userCode}`);
          await userService.saveCouponUsage(userCode, checkoutSession,userId); 
          console.log(`Uso del cupón registrado .`);
        } catch (error) {
          console.error(`Error al registrar el uso del cupón ${userCode} :`, error);
          return res.status(500).send(`Error al registrar el uso del cupón: ${error.message}`);
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.send();
}



async function verifyAndUpdatePayment(userId, sessionId) {
  try {
    const userDoc = await userService.getUser(userId);

    if (!userDoc.exists) {
      throw new Error(`Usuario con ID ${userId} no encontrado.`);
    }

    let userCode;

    // Verificar si el usuario ya tiene un código asignado
    const existingCodeSnapshot = await userService.getCodeByUserId(userId);

    if (!existingCodeSnapshot.empty) {
      // Si ya tiene un código, reutilizarlo
      userCode = existingCodeSnapshot.docs[0].id;
      console.log(`Código existente para el usuario ${userId}: ${userCode}`);
    } else {
      // Si no tiene código, generar uno nuevo de forma única
      userCode = await generateUniqueCode(userId); // Llamada optimizada para generar y verificar el código único
      console.log(`Código generado para el usuario ${userId}: ${userCode}`);
      await userService.saveCode(userCode, userId); // Guardar el nuevo código en la base de datos
    }

    // Actualizar el usuario con el código asignado
    console.log(`Actualizando el usuario ${userId} con el código: ${userCode}`);
    await userService.updateUser(userId, { codigo: userCode });

    // Crear un cupón en Stripe solo si el usuario no tenía código asignado
    if (existingCodeSnapshot.empty) {
      console.log(`Creando un cupón en Stripe para el usuario ${userId}.`);
      await createStripeCoupon(userCode, userId); // Crear un cupón para el usuario
    } else {
      console.log(`El usuario ${userId} ya tiene un código asignado, no se crea el cupón en Stripe.`);
    }

    // Actualizar el estado de pago y membresía del usuario
    console.log(`Actualizando el estado de pago para el usuario ${userId}.`);
    await userService.updateUser(userId, {
      estado: 'pagado',
      membresia: 'activa',
      ultimoPago: {
        sessionId: sessionId,
        fecha: new Date(),
      },
    });

    console.log(`Estado de pago y membresía actualizados para el usuario ${userId}.`);
    await handlePaymentCompleted(userId); // Manejar tareas adicionales después del pago
  } catch (error) {
    console.error('Error al actualizar el estado de pago:', error);
    throw error;
  }
}
