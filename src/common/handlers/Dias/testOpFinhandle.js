const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');

const testOpFinhandle = async (senderId) => {
  try {
    // Nombre de la plantilla
    const templateName = 'test_completed';
    
    const languageCode = 'es_MX';

    // Enviar el mensaje de plantilla al usuario
    await sendTemplateMessage(senderId, templateName, languageCode);

    console.log(`Mensaje de plantilla '${templateName}' enviado al usuario ${senderId}`);
  } catch (error) {
    console.error(`Error al enviar el mensaje de plantilla '${templateName}' para el usuario ${senderId}:`, error);
  }
};

module.exports = testOpFinhandle;
