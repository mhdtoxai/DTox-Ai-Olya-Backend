const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');

const handleSendQuestionnaire = async (senderId) => {
  try {
    // Obtener la información del usuario desde la base de datos
    const userInfo = await getUserInfo(senderId);
    const { idioma, estado, nombre } = userInfo;

    // Generar la URL única con senderId, nombre e idioma
    const uniqueUrl = `https://jjhvjvui.top/Onboarding?id=${senderId}&name=${encodeURIComponent(nombre)}&language=${idioma}`;

    // Enviar el mensaje con el enlace único
    const url = idioma === 'ingles'
      ? `Please click here: ${uniqueUrl}`
      : `Por favor da clic aquí: ${uniqueUrl}`;
    await sendMessage(senderId, url);

    // Actualizar el estado en la base de datos después de enviar el enlace del cuestionario
    await userService.updateUser(senderId, { estado: 'cuestionariopendiente' });
  } catch (error) {
    console.error('Error al manejar cuestionario:', error);
  }
};

module.exports = handleSendQuestionnaire;
