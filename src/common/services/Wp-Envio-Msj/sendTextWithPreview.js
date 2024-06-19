// src/services/Wp-Envio-Msj/sendTextWithPreview .js
const axios = require('axios');
const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

const sendTextWithPreview  = async (recipientId, textWithUrl) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: "text",
    text: {
      body: textWithUrl,
      preview_url: true
    }
  };

  try {
    const response = await axios.post(`https://graph.facebook.com/v19.0/310493365488610/messages`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      },
    });

    console.log(' Mensaje enviado de sendTextWithPreview  :', response.data);
} catch (error) {
  console.error('Error al enviar sendTextWithPreview  message:', error.message);
  console.error('Error detalle:', error.response.data);
}
};

module.exports = sendTextWithPreview;



