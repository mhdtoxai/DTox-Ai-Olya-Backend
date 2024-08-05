// sendMessageTarget.js

const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

const sendMessageTarget = async (recipientId, messageText, buttons = []) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: buttons.length > 0 ? 'interactive' : 'text',
    [buttons.length > 0 ? 'interactive' : 'text']: buttons.length > 0 ? {
      type: 'button',
      body: {
        text: messageText
      },
      action: {
        buttons: buttons.map((button, index) => ({
          type: 'reply',
          reply: {
            id: button.id,
            title: button.title
          }
        }))
      }
    } : { body: messageText }
  };

  try {
    const response = await axios.post(`https://graph.facebook.com/v19.0/310493365488610/messages`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      },
    });

    console.log('Mensaje enviado:', response.data);
  } catch (error) {
    console.error('Error al enviar el mensaje:', error.message);
    console.error('Detalles del error:', error.response.data);
  }
};

module.exports = sendMessageTarget;
