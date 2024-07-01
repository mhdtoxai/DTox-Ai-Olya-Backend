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
     const uniqueUrl = `https://jjhvjvui.top/Onboarding?id=${senderId}&name=${encodeURIComponent(nombre)}`;
     console.log('URL única generada:', uniqueUrl);
 
    // Enviar el mensaje con el enlace único
    const url = idioma === 'ingles'
      ? `Click here: ${uniqueUrl}`
      : `¡Perfecto! da clic aquí: ${uniqueUrl}`;
    await sendMessage(senderId, url);

  
    // Actualizar el estado después de enviar el enlace del cuestionario
    await userService.updateUser(senderId, { estado: 'cuestionariopendiente' });
    userContext[senderId].estado = 'cuestionariopendiente';
  } catch (error) {
    console.error('Error al manejar consentimiento aceptado:', error);
  }
  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};
module.exports = handleConsentAccepted;
