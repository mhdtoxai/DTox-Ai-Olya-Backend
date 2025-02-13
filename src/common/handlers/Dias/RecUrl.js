const axios = require('axios');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');

// Función para verificar si un test ha sido realizado, dado un testId dinámico
const RecUrl = async (senderId, message, testId) => {
  try {
    // Realizamos la consulta a la API para verificar si el usuario ha realizado el test
    const response = await axios.post('https://olya.club/api/test/testrespiracion/obtenerpruebas', {
      userId: senderId
    });

    // Verificar si el testId está presente en los resultados
    const pruebas = response.data;
    const testPresente = pruebas.some(prueba => prueba.id === testId);

    if (testPresente) {
      console.log(`⏩ El testId = ${testId} ya fue realizado por ${senderId}, no se enviará el mensaje.`);
      return { success: true, message: `El testId=${testId} ya está completado. No se enviará el mensaje.` };
    } else {
      console.log(`✅ El test = ${testId} NO ha sido realizado por ${senderId}. Se enviará el mensaje con el enlace.`);
      
      // Enviar el mensaje al usuario con el enlace al test
      await sendMessage(senderId, message);
      
      return { success: true, message: 'Mensaje de test enviado.' };
    }
  } catch (error) {
    console.error('❌ Error al consultar la API de prueba:', error);
    return { success: false, message: 'Error al consultar la API de prueba.' };
  }
};

module.exports = RecUrl;



