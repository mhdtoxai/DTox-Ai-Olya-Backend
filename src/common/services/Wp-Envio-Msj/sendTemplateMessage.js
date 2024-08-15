// sendTemplateMessage.js

const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

const sendTemplateMessage = async (recipientId, templateName, languageCode) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: "template",
    template: {
      name: templateName,
      language: {
        code: languageCode
      }
    }
  };

  try {
    const response = await axios.post(`https://graph.facebook.com/v19.0/310493365488610/messages`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      },
    });

    console.log('Mensaje de plantilla enviado:', response.data);
  } catch (error) {
    console.error('Error al enviar el mensaje de plantilla:', error.message);
    console.error('Detalles del error:', error.response ? error.response.data : error.message);
  }
};

module.exports = sendTemplateMessage;
