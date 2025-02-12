const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const sendTemplateMessage = require('../services/Wp-Envio-Msj/sendTemplateMessage');
const sendImageMessage = require('../services/Wp-Envio-Msj/sendImageMessage');
const userService = require('../services/userService'); // Asegúrate de que este servicio esté correctamente importado
const diasRoutes = require('../handlers/Dias/diasRoutes'); // Ajusta esta ruta según sea necesario
const sendAudioMessage = require('../services/Wp-Envio-Msj/sendAudioMessage');
const sendContactMessage = require('../services/Wp-Envio-Msj/sendContactMessage');

const runTask = async (req, res) => {
  try {
    const { senderId, type, message, templateName, languageCode, imageUrl, estado, plantilla, audioUrl } = req.body;

    // console.log("🔍 Datos recibidos en runTask:", req.body);

    if (type === 'text') {
      await sendMessage(senderId, message);
    }
    else if (type === 'template') {
      await sendTemplateMessage(senderId, templateName, languageCode);
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
    else if (type === 'estado') {

      console.log(`🔄 Actualizando estado del usuario ${senderId} a: ${estado}`);

      const updateData = { estado };
      if (plantilla) updateData.plantilla = plantilla;

      await userService.updateUser(senderId, updateData);

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
