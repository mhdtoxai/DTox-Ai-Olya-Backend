const axios = require('axios');
const { TINYURL_API_TOKEN } = process.env; // Suponiendo que has configurado tu token de API de TinyURL como una variable de entorno

async function shortenUrl(longUrl) {
  try {
    const response = await axios.post(
      'http://tinyurl.com/api-create.php',
      {
        url: longUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${TINYURL_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data; // La respuesta directa de TinyURL es la URL acortada
  } catch (error) {
    console.error('Error al acortar URL con TinyURL:', error);
    throw error;
  }
}

module.exports = shortenUrl;
