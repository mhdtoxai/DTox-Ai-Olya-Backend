const userService = require('../services/userService');
const stateFunctions = require('../handlers/Dias/diasRoutes'); // Asegúrate de que contenga todas las funciones

const updateEstado = async (req, res) => {
  try {
    const { senderId, estado } = req.body;

    if (!senderId || !estado) {
      return res.status(400).json({ success: false, message: "Faltan datos requeridos" });
    }

    console.log(`🔄 Actualizando estado del usuario ${senderId} a: ${estado}`);

    // Actualizar el estado en la base de datos
    await userService.updateUser(senderId, { estado });

    // Verificar si hay una función correspondiente al estado en stateFunctions
    if (stateFunctions[estado]) {
      console.log(`✅ Ejecutando función para el estado: ${estado}`);
      await stateFunctions[estado](senderId); // Llamar a la función correspondiente
    } else {
      console.log(`🚨 No se encontró una función para el estado: ${estado}`);
    }

    res.status(200).json({ success: true, message: `Estado actualizado y ejecutado: ${estado}` });

  } catch (error) {
    console.error(`❌ Error al actualizar estado:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = updateEstado;
