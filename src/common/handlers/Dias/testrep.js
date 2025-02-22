const axios = require('axios');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');

// Función para obtener el informe de pruebas de retención pulmonar
const testrep = async (senderId, idioma) => {
    try {
        // Realiza la solicitud POST a la API para obtener los resultados
        const response = await axios.post('https://olya.club/api/test/testrespiracion/obtenerpruebas', {
            userId: senderId
        });

        // Extrae los datos recibidos de la API
        const results = response.data;

        // Encontrar el primer score válido (no 0)
        let score1;
        for (let id = 1; id <= 5; id++) {
            const result = results.find(r => r.id === id.toString());
            if (result && result.score !== 0) {
                score1 = result.score;
                console.log(`Score1 encontrado en id ${id}: ${score1}`);
                break;  // Sale del bucle una vez que encuentra un score válido
            }
        }

        if (score1 === undefined) {
            throw new Error("No se encontró un score válido que no sea 0.");
        }

        // Buscar el último score disponible si el score 5 no está
        let score5 = results.find(r => r.id === "5");
        if (!score5) {
            score5 = results[results.length - 1];  // Toma el último valor disponible
        }

        if (!score5 || score5.score === undefined) {
            throw new Error("No se encontró un score válido para el id 5 o el último disponible.");
        }

        score5 = score5.score;

        // Calcula el porcentaje de cambio respecto al primer resultado válido
        const difference = score5 - score1;
        const percentageChange = ((difference / score1) * 100).toFixed(2);

        // Determina el status y el emoji correspondiente
        let status;
        let emoji;

        if (percentageChange > 0) {
            status = 'mejoró';
            emoji = '💪🤟';
        } else if (percentageChange < 0) {
            status = 'empeoró';
            emoji = '🥺👎';
        } else {
            status = 'no mejoró ni empeoró';
            emoji = '🙏';
        }

        // Construye el mensaje basado en el idioma
        const historyMessage = idioma === 'ingles' ?
            `Your lung retention test report: ${status} with a [${Math.abs(percentageChange)}%] retention rate ${emoji}. Quitting vaping will gradually increase it. I recommend following these exercises to help clear your lungs.` :
            `Tu informe de pruebas de retención pulmonar: ${status} en [${Math.abs(percentageChange)}%] tu retención. ${emoji}. Dejar de vapear la incrementará paulatinamente. Te recomiendo seguir estos ejercicios para limpiar tus pulmones.`;

        // Envía el mensaje al usuario
        await sendMessage(senderId, historyMessage);
        console.log(`Mensaje resultado prueba enviado para el usuario ${senderId} con el informe de retención pulmonar.`);
    } catch (error) {
        console.error(`Error al obtener las pruebas para el usuario ${senderId}:`, error);
    }
};

module.exports = testrep;
