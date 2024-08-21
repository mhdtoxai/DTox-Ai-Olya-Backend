// getUserInfo.js
const userService = require('../services/userService');

const getUserInfo = async (senderId) => {
  try {
    // Obtener datos del usuario desde la base de datos
    const userData = await userService.getUser(senderId);
    const userDataFields = userData._fieldsProto;

    // Verificar que las claves existen antes de acceder a sus valores
    const idioma = userDataFields.idioma?.stringValue || '';
    const estado = userDataFields.estado?.stringValue || '';
    const nombre = userDataFields.nombre?.stringValue || '';
    const timezone = userDataFields.timezone?.stringValue || '';
    const nivel = userDataFields.nivel?.stringValue || '';

    // Mostrar toda la información del usuario en la consola
    console.log(`Información del usuario ${senderId}:`);
    console.log(`Idioma: ${idioma}`);
    console.log(`Estado: ${estado}`);
    console.log(`Nombre: ${nombre}`);
    console.log(`Timezone: ${timezone}`);
    console.log(`Nivel: ${nivel}`);

    // Retornar la información del usuario
    return { idioma, estado, nombre, nivel, timezone };
  } catch (error) {
    console.error(`Error al obtener información del usuario ${senderId}:`, error);
    throw error; // Propagar el error para manejarlo en un nivel superior
  }
};

module.exports = getUserInfo;
