// getUserInfo.js
const userService = require('../services/userService');

const getUserInfo = async (senderId) => {
  try {
    // Obtener datos del usuario desde la base de datos
    const userData = await userService.getUser(senderId);

    // Comprobar si userData es válido
    if (!userData || !userData._fieldsProto) {
      console.warn(`No se encontraron datos para el usuario ${senderId}.`);
      return { 
        idioma: '', // Retorna un objeto con valores vacíos
        estado: '', 
        nombre: '', 
        nivel: '', 
        timezone: '',
        codigo: '' 
      };
    }

    const userDataFields = userData._fieldsProto;

    // Verificar que las claves existen antes de acceder a sus valores
    const idioma = userDataFields.idioma?.stringValue || '';
    const estado = userDataFields.estado?.stringValue || '';
    const nombre = userDataFields.nombre?.stringValue || '';
    const timezone = userDataFields.timezone?.stringValue || '';
    const nivel = userDataFields.nivel?.stringValue || '';
    const codigo = userDataFields.codigo?.stringValue || '';

    // Mostrar toda la información del usuario en la consola
    console.log(`Información del usuario ${senderId}:`);
    console.log(`Idioma: ${idioma}`);
    console.log(`Estado: ${estado}`);
    console.log(`Nombre: ${nombre}`);
    console.log(`Timezone: ${timezone}`);
    console.log(`Nivel: ${nivel}`);
    console.log(`Codigo: ${codigo}`);
    // Retornar la información del usuario
    return { idioma, estado, nombre, nivel, timezone, codigo };
  } catch (error) {
    console.error(`Error al obtener información del usuario ${senderId}:`, error);
    // En lugar de propagar el error, retorna un objeto con valores vacíos
    return { 
      idioma: '', 
      estado: '', 
      nombre: '', 
      nivel: '', 
      timezone: '',
      codigo: '' 
    }; 
  }
};

module.exports = getUserInfo;
