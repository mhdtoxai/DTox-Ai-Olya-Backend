const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia21 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const plantilla = idioma === 'ingles'
            ? `Hello! 🌟First of all, I want to congratulate you once again for completing the program. Your effort, dedication and commitment have taken you to a place where many only dream of being 🚭. You are amazing! 💪 To continue improving and helping more people like you, I would love for you to share your experience in a short survey (it will take less than 2 minutes). Your voice helps us grow and inspire others.`
            : `¡Hola! 🌟Primero que nada, quiero felicitarte una vez más por haber completado el programa. Tu esfuerzo, dedicación y compromiso te han llevado a un lugar donde muchos solo sueñan estar 🚭. ¡Eres increíble! 💪 Para seguir mejorando y ayudar a más personas como tú, me encantaría que compartieras tu experiencia en una breve encuesta (te tomará menos de 2 minutos). Tu voz nos ayuda a crecer y a inspirar a otros.`

        // Enlace dinámico para el mensaje
        const dynamicLink = `https://olya.club/FinEnc?id=${senderId}&name=${encodeURIComponent(nombre)}&language=${idioma}`;

        console.log(`🌍 Zona horaria del usuario: ${timezone}`);
        // Función para convertir la hora local del usuario a UTC
        const convertToUTC = (time) => {
            const localTime = moment.tz(time, 'HH:mm', timezone).set({
                year: moment().tz(timezone).year(),
                month: moment().tz(timezone).month(),
                date: moment().tz(timezone).date(),
            });

            const utcTime = localTime.clone().utc();

            return utcTime;
        };

        // Definir los horarios en UTC
        const times = {
            morning: convertToUTC('07:00'), // todos los niveles
            programafinalizado: convertToUTC('08:00'), // todos los niveles  
        };

        // Obtener la hora actual en UTC
        const nowUTC = moment().utc();

        const scheduleMessage = async (message, scheduledTime, eventName) => {
            // Usar scheduledTime directamente
            if (scheduledTime.isBefore(nowUTC)) {
                console.log(`⚠️ La hora programada (${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC) ya pasó. Se programará para el día siguiente.`);
                scheduledTime.add(1, 'day'); // Mover al día siguiente
            } else {
                console.log(`🕒 Hora en UTC: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
            }

            console.log(`🌍 Equivalente en ${timezone}: ${scheduledTime.clone().tz(timezone).format('YYYY-MM-DD HH:mm:ss')}`);

            const timestamp = Date.now(); // Obtener timestamp actual
            message.taskName = `${message.senderId}_dia21_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };

          // 📌 Programar el mensaje con la plantilla dinámica
          await scheduleMessage({
            senderId,
            type: 'templatedynamic', // Usamos el nuevo tipo para indicar que tiene variables dinámicas
            templateName: 'morning_day_21',
            plantilla: plantilla,
            languageCode: idioma === 'ingles' ? 'en_US' : 'es_MX',
            parameters: [{ type: 'text', text: dynamicLink }], // Pasamos el enlace dinámico como parámetro
        }, times.morning, 'morning');


        await scheduleMessage({
            senderId,
            type: 'finBackUp'
        }, times.programafinalizado, 'programafinalizado');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 21 para ${senderId}:`, error);
    }
};

module.exports = dia21;
