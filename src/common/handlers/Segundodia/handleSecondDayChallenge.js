const userService = require('../../services/userService');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const getUserInfo = require('../../services/getUserInfo');
const userContext = require('../../services/userContext');

const handleSecondDayChallenge = async (senderId) => {
  try {
    // Obtener la información del usuario incluyendo el nombre
    const { idioma, estado, nombre } = await getUserInfo(senderId);
    console.log(`Usuario ${senderId} tiene idioma: ${idioma}, estado: ${estado} y nombre: ${nombre}`);

    // Enviar primer mensaje
    const firstMessage = idioma === 'ingles' ?
      `Good morning ${nombre}! Remember your first challenge is not to touch your vape for just one hour.` :
      `Buenos días ${nombre}! Recuerda que tu primer reto es no tocar tu vape por una hora solamente.`;
    await sendMessage(senderId, firstMessage);

    // Enviar segundo mensaje
    const secondMessage = idioma === 'ingles' ?
      `If you can hold out until later that would be great but to respect the method one hour will be enough.` :
      `Si puedes aguantar hasta más tarde sería genial pero para respetar el método con 1 hora será suficiente.`;
    await sendMessage(senderId, secondMessage);

    // Enviar tercer mensaje
    const thirdMessage = idioma === 'ingles' ?
      `Remember, doing this to "Improve my health" is a great motivation. Keep this in mind in your fight for habit freedom. We are with you! And remember, do you have cravings? TELL ME` :
      `Recuerda, hacer esto por "Mejorar mi salud", es un gran motor. Tenlo muy en cuenta en tu lucha por la libertad de hábitos. ¡Estamos contigo! Y recuerda, ¿tienes antojo? DIMELO`;
    await sendMessage(senderId, thirdMessage);

    // Enviar cuarto mensaje
    const fourthMessage = idioma === 'ingles' ?
      `Woohoo! I'm still here for anything. Let me know when you want to vape so we can eliminate the craving together :)` :
      `¡Yuhu! Sigo por aquí para cualquier cosa. Avísame cuando quieras vapear para lograr eliminar el antojo juntos :)`;
    await sendMessage(senderId, fourthMessage);

    // Enviar quinto mensaje con la URL específica
    const specificURL = '#';
    const fifthMessage = idioma === 'ingles' ?
      `Psst! Sorry for the time, can you take 2 minutes to answer the following questions? ${specificURL}` :
      `¡Psst! Perdón la hora, ¿puedes tomarte 2 minutos para responder por favor a las siguientes preguntas? ${specificURL}`;
    await sendMessage(senderId, fifthMessage);

    // Actualizar el estado después de enviar el mensaje del reto del segundo día
    await userService.updateUser(senderId, { estado: 'segundodianoche' });
    userContext[senderId].estado = 'segundodianoche';
    console.log(`Estado en contexto actualizado a ${userContext[senderId].estado}`);

    // Aquí podrías programar cualquier otra acción que desees realizar para el segundo día

  } catch (error) {
    console.error('Error al manejar el reto del segundo día:', error);
  }

  // Imprimir todo el contexto del usuario en la consola
  console.log(`Contexto del usuario ${senderId}:`, userContext[senderId]);
};

module.exports = handleSecondDayChallenge;
