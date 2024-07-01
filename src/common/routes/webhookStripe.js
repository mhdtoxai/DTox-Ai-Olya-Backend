const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe/stripeController');

// Ruta para manejar eventos de webhook de Stripe con express.raw
router.post('', express.raw({ type:'application/json'}), stripeController.handleStripeWebhook);

module.exports = router;