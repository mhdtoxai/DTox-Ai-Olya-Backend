const userService = require('../services/userService');
const sendMessage = require('../services/Wp-Envio-Msj/sendMessage');
const sendDocument = require('../services/Wp-Envio-Msj/sendDocument');
const getUserInfo = require('../services/getUserInfo');
const userContext = require('../services/userContext'); 
const handlePlanSent = require('./handlePlanSent');

const handleQuestionnaireCompleted = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    
    await sendMessage(senderId, idioma === 'ingles'
      ? `Questionnaire completed! Great job! Give me a few seconds, I'm putting the final touches on your plan.`
      : `¡Cuestionrio completado! Ya tengo tu plan personalizado para los siguientes 10 días. Vas con todo!`);


      await delay(2000);  // Espera 2 segundos

  // Enviar PDF al usuario
  const filePath = 'https://drive.google.com/uc?id=1SeK1f-XgN889rAyt42A4Lw55DhV573nb'; // Ruta al archivo PDF
  const fileName = 'demo.pdf';
  await sendDocument(senderId, filePath, fileName);
  

    // Actualizar el estado del usuario
    await userService.updateUser(senderId, { estado: 'planenviado' });
    userContext[senderId].estado = 'planenviado';

    console.log(`Estado actualizado a planenviado para ${senderId}`);

    // Esperar un tiempo suficiente antes de enviar el PDF
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 3 segundos (ajustar según sea necesario)

//  // Llamar a la función para manejar el estado 'planenviado'
 await handlePlanSent(senderId);

  } catch (error) {
    console.error('Error al manejar cuestionario completado:', error);
    throw error; // Propagar el error para manejarlo en el controlador o en la lógica superior
  }
 // Imprimir todo el contexto del usuario en la consola
 console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

// Función de retraso
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = handleQuestionnaireCompleted;
