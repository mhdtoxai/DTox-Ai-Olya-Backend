const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Función para crear un cupón en Stripe usando un código de usuario y luego generar un código de promoción
async function createStripeCoupon(code, userId) {
  try {
    // Primero, crea el cupón en Stripe
    const coupon = await stripe.coupons.create({
      id: code, // Usa el código del cupón como el ID
      percent_off: 15,
      duration: 'forever', // Permite que el cupón no tenga fecha de vencimiento
      metadata: { userId: userId },
      name:code,
    });
    console.log(`Cupón creado en Stripe con el código ${code} para el usuario ${userId}.`);

    // Ahora, crea un código de promoción asociado al cupón
    const promotionCode = await stripe.promotionCodes.create({
      coupon: coupon.id, // Asocia el código de promoción al cupón recién creado
      code: code, // El código que los usuarios utilizarán
    });
    console.log(`Código de promoción ${promotionCode.code} creado y asociado al cupón.`);

  } catch (error) {
    console.error('Error al crear el cupón o el código de promoción en Stripe:', error);
    throw error;
  }
}

module.exports = createStripeCoupon;
