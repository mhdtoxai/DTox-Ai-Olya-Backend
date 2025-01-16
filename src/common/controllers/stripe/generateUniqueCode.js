const { v4: uuidv4 } = require('uuid');
const userService = require('../../services/userService'); // Importar el servicio de usuario

// Función para generar un código único de 6 caracteres alfanuméricos
async function generateUniqueCode(userId) {
  let isUnique = false;
  let userCode = '';

  while (!isUnique) {
    // Generar un código usando uuid
    const uuid = uuidv4().replace(/-/g, ''); // Quitar los guiones
    userCode = uuid.substring(0, 6).toUpperCase(); // Tomar los primeros 6 caracteres

    // Verificar si el código ya existe en la base de datos
    const codeDoc = await userService.getCode(userCode);
    if (!codeDoc.exists) {
      isUnique = true; // Si no existe, el código es único
      console.log(`Código generado para el usuario ${userId}: ${userCode}`);
      await userService.saveCode(userCode, userId); // Guardar el nuevo código en la base de datos
    } else {
      console.log(`El código ${userCode} ya existe, generando uno nuevo...`);
    }
  }

  return userCode;
}

module.exports = generateUniqueCode;
