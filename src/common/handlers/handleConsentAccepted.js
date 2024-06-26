const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext'); 


const handleConsentAccepted = async (senderId) => {
  try {

    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

     // Generar la URL única con senderId y nombre
     const uniqueUrl = `https://jjhvjvui.top/Bienvenida?id=${senderId}&name=${encodeURIComponent(nombre)}`;
     console.log('URL única generada:', uniqueUrl);
 

    // Enviar el mensaje con el enlace único
    await sendMessage(senderId, idioma === 'ingles'
      ? `Click here: ${uniqueUrl}`
      : `Da clic aquí: ${uniqueUrl}`);

    // Actualizar el estado después de enviar el enlace del cuestionario
    await userService.updateUser(senderId, { estado: 'cuestionariopendiente' });
    userContext[senderId].estado = 'cuestionariopendiente';
    console.log(`Estado en contexto actualizado  a ${userContext[senderId].estado}`);
    console.log(`Estado actualizado a cuestionariopendiente para ${senderId}`);
  } catch (error) {
    console.error('Error al manejar consentimiento aceptado:', error);
  }
  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};
module.exports = handleConsentAccepted;
