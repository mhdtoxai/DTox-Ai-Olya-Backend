const axios = require('axios');
const userService = require('../../services/userService');

const FinBackUp = async (senderId) => {
    try {
        // Actualizar el estado del usuario en la base de datos
        await userService.updateUser(senderId, { estado: 'programafinalizado' });
        console.log(`✅ Estado del usuario ${senderId} actualizado a 'programafinalizado'.`);

        // Hacer la llamada a la API para realizar el backup y eliminar al usuario
        const response = await axios.post('https://olya.club/api/backup/user', { senderId }  
        );

        // Verificar si la respuesta fue exitosa
        if (response.status === 200) {
            console.log(`✅ Respaldo y eliminación exitosos: ${response.data.mensaje}`);
        } else {
            console.error('❌ Error al realizar el backup y eliminar el usuario');
        }

    } catch (error) {
        // Manejo de errores en caso de fallo
        console.error('❌ Error en la solicitud a la API:', error.response?.data || error.message);
    }
};

module.exports = FinBackUp;

