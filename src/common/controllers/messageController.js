
const messageService = require('../services/messageService');

exports.handleIncomingMessage = async (req, res) => {
  console.log("Mensaje entrante del webhook:", JSON.stringify(req.body, null, 2));

  // Verificar si es un mensaje de estado (statuses)
  if (req.body.object === "whatsapp_business_account" && req.body.entry && req.body.entry.length > 0) {
    const entry = req.body.entry[0];
    if (entry.changes && entry.changes.length > 0 && entry.changes[0].field === "messages") {
      const message = entry.changes[0].value;
      if (message.statuses && message.statuses.length > 0) {
        // Es un mensaje de estado, responder con 200 OK
        res.sendStatus(200);
        console.log("Mensaje de estado recibido:", JSON.stringify(message, null, 2));
        return;
      }
    }
  }

  // Si no es un mensaje de estado, procesarlo como un mensaje normal
  res.sendStatus(200); // Enviar respuesta HTTP 200 inmediatamente

  try {
    await messageService.processMessage(req.body);
  } catch (error) {
    console.error('Error al procesar el mensaje:', error);
    res.sendStatus(400); // Responder con 400 en caso de error
  }
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











// const messageService = require('../services/messageService');

// exports.handleIncomingMessage = async (req, res) => {
//   console.log("Mensaje entrante del webhook:", JSON.stringify(req.body, null, 2));
//   res.sendStatus(200); 
//   await messageService.processMessage(req.body);
// };

// exports.verifyWebhook = (req, res) => {
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   if (mode === "subscribe" && token === process.env.WEBHOOK_VERIFY_TOKEN) {
//     res.status(200).send(challenge);
//     console.log("¡Webhook verificado correctamente!");
//   } else {
//     res.sendStatus(403);
//   }
// };

