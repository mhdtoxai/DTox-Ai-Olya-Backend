// getUserInfo.js
const userService = require('../services/userService');
const userContext = require('./userContext');

const getUserInfo = async (senderId) => {
  try {
    // Obtener datos del usuario desde la base de datos
    const userData = await userService.getUser(senderId);
    const userDataFields = userData._fieldsProto;

    // // Log completo de userDataFields para depuración
    // console.log(`Datos completos del usuario obtenidos de la base de datos:`, userDataFields);

    // Verificar que las claves existen antes de acceder a sus valores
    const idioma = userDataFields.idioma?.stringValue || '';
    const estado = userDataFields.estado?.stringValue || '';
    const nombre = userDataFields.nombre?.stringValue || '';
    const timezone = userDataFields.timezone?.stringValue || '';

    // Actualizar el contexto con los datos del usuario y un timestamp
    userContext[senderId] = { idioma, estado, nombre, timezone, timestamp: Date.now() };

    // Log de cada campo
    console.log(`Datos del usuario actualizados en el contexto: idioma=${idioma}, estado=${estado}, nombre=${nombre}, timezone=${timezone}`);

    // Retornar la información del usuario
    return userContext[senderId];
  } catch (error) {
    console.error(`Error al obtener información del usuario ${senderId}:`, error);
    throw error; // Propagar el error para manejarlo en un nivel superior
  }
};

module.exports = getUserInfo;
