const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

const sendStickerMessage = async (recipientId, stickerId) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: "sticker",
    sticker: {
      id: stickerId
    }
  };

  try {
    const response = await axios.post(`https://graph.facebook.com/v19.0/310493365488610/messages`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      },
    });

    console.log('Mensaje de sticker enviado:', response.data);
  } catch (error) {
    console.error('Error al enviar el mensaje de sticker:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
  }
};

module.exports = sendStickerMessage;