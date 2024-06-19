// getUserInfo.js
const userService = require('../services/userService');
const userContext = require('./userContext');

const getUserInfo = async (senderId) => {
  let user = userContext[senderId];

  if (!user) {
    try {
      const userData = await userService.getUser(senderId);
      const userDataFields = userData._fieldsProto;

      // Verificar que las claves existen antes de acceder a sus valores
      const idioma = userDataFields.idioma?.stringValue || '';
      const estado = userDataFields.estado?.stringValue || '';
      const nombre = userDataFields.nombre?.stringValue || '';

      userContext[senderId] = { idioma, estado, nombre };
      user = userContext[senderId];
    } catch (error) {
      console.error(`Error al obtener información del usuario ${senderId}:`, error);
      throw error; // Propagar el error para manejarlo en un nivel superior
    }
  }

  return userContext[senderId];
};

module.exports = getUserInfo;
