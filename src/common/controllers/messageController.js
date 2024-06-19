const messageService = require('../services/messageService');

exports.handleIncomingMessage = async (req, res) => {
  // console.log("Mensaje entrante del webhook:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200); // Enviar respuesta HTTP 200 inmediatamente
  await messageService.processMessage(req.body);
};

exports.verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    res.status(200).send(challenge);
    console.log("¡Webhook verificado correctamente!");
  } else {
    res.sendStatus(403);
  }
};
