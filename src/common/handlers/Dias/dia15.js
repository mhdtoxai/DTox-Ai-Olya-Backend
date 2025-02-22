const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia15 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const imageUrl = idioma === 'ingles' ?
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal5_Eng.png?alt=media&token=c9b0dc02-a590-40e6-99da-099a6b665d07' : // Reemplaza con el enlace de la imagen en inglés
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FINSIGNIAS_05_Esp.png?alt=media&token=f52f8ed8-7f18-459c-8c7f-379012170c0a'; // Reemplaza con el enlace de la imagen en español

        const plantilla = idioma === 'ingles'
            ? `Good morning. I want to express my admiration for you. Today I ask you to vape until after 10 PM. I know you can do it, look how far you've come.`
            : `Buenos días. Quiero expresar mi admiración por tí. Hoy te pido vapear hasta después de las 10 PM. Sé que lo puedes lograr, mira lo lejos que has llegado.`

        // 🔹 Construcción de URL única para test
        const testUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=4&language=${idioma}`;

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
            first: convertToUTC('10:00'),   // medio y alto
            second: convertToUTC('12:00'),  // alto 
            third: convertToUTC('14:00'),   // todos los niveles
            fourth: convertToUTC('16:00'),  // medio y alto
            testUrl: convertToUTC('17:00'), // todos los niveles
            fifth: convertToUTC('18:00'),  // alto 
            RecUrl: convertToUTC('19:00'), // todos los niveles
            sixth: convertToUTC('20:00'),   // todos los niveles 
            seventh: convertToUTC('22:00'), // alto 
            dia16Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia15_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day15',
            languageCode: idioma === 'ingles'
                ? 'en_US'
                : 'es_MX',
            plantilla: plantilla,
        }, times.morning, 'morning');


        // Mensajes dependiendo del nivel
        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Did you know that vaping can damage the epithelial cells in your airways 🌬️, making it harder to protect against infections 🦠?"
                    : "¿Sabías que el vapeo puede causar daños a las células epiteliales de las vías respiratorias 🌬️, lo que dificulta la protección contra infecciones 🦠?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ?"🗣️ Vaping can cause chest pain."
                    :"🗣️ Vapear puede causar dolor en el pecho."
            }, times.second, 'second');
        }


        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `${nombre}!, before lunch: 'It doesn’t matter how slow you go, as long as you don’t stop.' – Confucius. Keep moving forward!` 
                : `${nombre}!, antes del almuerzo: 'No importa cuán despacio vayas, siempre y cuando no te detengas.' – Confucio. ¡Sigue avanzando!`
        }, times.third, 'third');



        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ?"Your teeth 🦷 will suffer if you continue vaping. You’ll face cavities 😬 and constant gum pain 😖."
                    :"Tus dientes 🦷 sufrirán si sigues vapeando. Enfrentarás caries 😬 y dolor de encías constantes 😖."
            }, times.fourth, 'fourth');
        }
        
        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `💨 Time to test your lung capacity! Click here: ${testUrl}`
                : `💨 Hora de medir tu capacidad pulmonar! Da clic aquí: ${testUrl}`
        }, times.testUrl, 'test_url');

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping affects your sense of smell 👃. You won’t enjoy scents 🍃 and will miss out on sensory experiences 🌺."
                    : "El vapeo afecta tu sentido del olfato 👃. No podrás disfrutar de los aromas 🍃 y te perderás experiencias sensoriales 🌺."
            }, times.fifth, 'fifth');
        }
  
        await scheduleMessage({
            senderId,
            type: 'checktest',
            testId:'4',
            message: idioma === 'ingles'
                ? `💨 Your Lung Retention Test is still pending. Clic here to do it:: ${testUrl}`
                : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí: ${testUrl}`
        }, times.RecUrl, 'RecUrl');


        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Only the brave reach this point in the journey! Badge of Courage unlocked."
                : "¡Solo los valientes llegan a este punto del viaje! Insignia de Coraje desbloqueada."

        }, times.sixth, 'sixth');


        await scheduleMessage({
            senderId,
            type: 'image',
            imageUrl: imageUrl,
        }, times.sixth, 'sixth_Image');


        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Vaping reduces your lung capacity 🫁. Climbing stairs 🚶 will be a challenge, and you’ll constantly feel out of breath 😮‍💨."
                    : "Vapear afecta tu capacidad pulmonar 🫁. Subir escaleras 🚶 será un desafío, y te faltará el aire constantemente 😮‍💨."
            }, times.seventh, 'seventh');

        }


        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia16', // 🔥 Cambia al siguiente día
        }, times.dia16Transition, 'dia16_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 15 para ${senderId}:`, error);
    }
};

module.exports = dia15;
