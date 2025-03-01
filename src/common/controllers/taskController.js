const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const sendTemplateMessage = require('../services/Wp-Envio-Msj/sendTemplateMessage');
const sendImageMessage = require('../services/Wp-Envio-Msj/sendImageMessage');
const userService = require('../services/userService'); // Asegúrate de que este servicio esté correctamente importado
const diasRoutes = require('../handlers/Dias/diasRoutes'); // Ajusta esta ruta según sea necesario
const sendAudioMessage = require('../services/Wp-Envio-Msj/sendAudioMessage');
const sendContactMessage = require('../services/Wp-Envio-Msj/sendContactMessage');
const RecUrl = require('../handlers/Dias/RecUrl'); // Ajusta esta ruta según sea necesario
const testrep = require('../handlers/Dias/testrep'); // Ajusta esta ruta según sea necesario
const sendTemplateMessageVariable = require('../services/Wp-Envio-Msj/sendTemplateMessageVariable');
const FinBackUp = require('../handlers/Dias/FinBackUp'); // Ajusta esta ruta según sea necesario


const runTask = async (req, res) => {
  try {
    const { senderId, type, idioma, message, templateName, languageCode, imageUrl, estado, plantilla, audioUrl, testId, parameters } = req.body;

    // console.log("🔍 Datos recibidos en runTask:", req.body);

    if (type === 'text') {
      await sendMessage(senderId, message);
    }
    else if (type === 'template') {
      // Actualizar la plantilla en la base de datos
      if (plantilla) {
        await userService.updateUser(senderId, { plantilla });
      }
      // Enviar el mensaje de plantilla
      await sendTemplateMessage(senderId, templateName, languageCode);
    }
    else if (type === 'templatedynamic') {
      // Actualizar la plantilla 
      if (plantilla) {
        await userService.updateUser(senderId, { plantilla });
      }
      // Enviar el mensaje de plantilla dinamica
      await sendTemplateMessageVariable(senderId, templateName, languageCode, parameters);
    }
    else if (type === 'image') {
      await sendImageMessage(senderId, imageUrl);
    }
    else if (type === 'audio') {
      await sendAudioMessage(senderId, audioUrl);
    }
    else if (type === 'contactcard') {
      await sendContactMessage(senderId);
    }
    else if (type === 'checktest') {
      await RecUrl(senderId, message, testId);
    }

    else if (type === 'testrep') {
      await testrep(senderId, idioma);
    }

    else if (type === 'finBackUp') {
      await FinBackUp(senderId);
    }

    else if (type === 'estado') {
      // Solo actualizamos el estado, sin tocar la plantilla
      await userService.updateUser(senderId, { estado });

      if (diasRoutes[estado]) {
        console.log(`🔄 Ejecutando la función para el estado ${estado}`);
        await diasRoutes[estado](senderId);
      } else {
        console.log(`🚨 No se encontró una función definida para el estado: ${estado}`);
      }
    }
    else {
      console.error("❌ Tipo de mensaje no soportado o datos insuficientes");
    }

    res.status(200).send({ success: true });

  } catch (error) {
    console.error(`❌ Error al ejecutar la tarea:`, error);
    res.status(500).send({ success: false, error: error.message });
  }
};

module.exports = runTask;
