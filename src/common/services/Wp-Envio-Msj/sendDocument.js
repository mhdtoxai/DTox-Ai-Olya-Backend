const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

const sendDocument = async (recipientId, filePath, fileName) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: "document",
    document: {
      link: filePath,
      filename: fileName
    }
  };

  try {
    const response = await axios.post(`https://graph.facebook.com/v19.0/310493365488610/messages`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GRAPH_API_TOKEN}`
      },
    });

    console.log('Documento enviado:', response.data);
  } catch (error) {
    console.error('Error al enviar el documento:', error.message);
    console.error('Detalles del error:', error.response.data);
    throw error; 
  }
};

module.exports = sendDocument;
