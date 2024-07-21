const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

// Define el objeto de contacto fijo
const contactData = {
  name: {
    formatted_name: "Olya",
    first_name: "Olya"
  },
  org: {
    company: "Empresa",
    title: "Medicina"
  },
  phones: [
    {
      phone: "+5214871956877",
      type: "Celular"
    }
  ],
  urls: [
    {
      url: "https://www.olya.ai",
      type: "Salud"
    }
  ]
};

const sendContactMessage = async (recipientId) => {
  const requestBody = {
    messaging_product: "whatsapp",
    to: recipientId,
    type: "contacts",
    contacts: [contactData]
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

module.exports = sendContactMessage;
