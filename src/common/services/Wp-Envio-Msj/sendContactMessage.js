const axios = require('axios');

const GRAPH_API_TOKEN = process.env.GRAPH_API_TOKEN;

// Define el objeto de contacto fijo
const contactData = {
"name": {
        "formatted_name": "Olya AI - Quit Vaping",
        "first_name": "Olya AI - Quit Vaping",
       
      },
      "org": {
        "company": "Empresa",
        "title": "Medicina"
      },
      "phones": [
        {
          "phone": "+524871956877",
          "type": "CELL",
          "wa_id": "524871956877"
        }
      ],
      "emails": [
        {
          "email": "hello@olya.ai",
          "type": "WORK"
        }
      ],
      "urls": [
        {
          "url": "https://www.olya.ai",
          "type": "WORK"
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
