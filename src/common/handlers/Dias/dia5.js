const moment = require('moment-timezone');
const scheduleTask = require('../../services/cloudTasksService');
const getUserInfo = require('../../services/getUserInfo');

const dia5 = async (senderId) => {
    try {

        // Obtener información del usuario
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);

        const imageUrl = idioma === 'ingles' ?
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Ingles%2FMedal3_Eng.png?alt=media&token=11a21866-1082-45eb-b68d-02554440e3a7' : // Reemplaza con el enlace de la imagen en inglés
            'https://firebasestorage.googleapis.com/v0/b/dtox-ai-a6f48.appspot.com/o/Medallas%20Espa%C3%B1ol%2FINSIGNIAS_03_Esp.png?alt=media&token=02201577-6f2e-4788-8bd2-8859e30c5a29'; // Reemplaza con el enlace de la imagen en español

        const plantilla = idioma === 'ingles'
            ? `Good morning, 🌅 Today is a new day full of opportunities. Remember, every little victory counts. Start your day with a deep, fresh breath! Today’s challenge? Don’t reach for your vape before 3️⃣ PM. YOU GOT THIS!`
            : `Buenos días, 🌅 Hoy es un nuevo día lleno de oportunidades. Recuerda, cada pequeña victoria cuenta. ¡Empieza tu día con una respiración profunda y fresca! ¿El reto de hoy? No tomes tu vape antes de las 3️⃣PM. ¡TU PUEDES!`

        // 🔹 Construcción de URL única para test
        const testUrl = `https://olya.club/Pruebarespirar?id=${senderId}&name=${encodeURIComponent(nombre)}&testId=2&language=${idioma}`;

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
            dia6Transition: convertToUTC('22:05'), // todos los niveles  🔹 Transición a Día 2

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
            message.taskName = `${message.senderId}_dia5_${eventName}_${timestamp}`;

            await scheduleTask(message, scheduledTime.toDate());
            console.log(`✅ Tarea programada para: ${scheduledTime.format('YYYY-MM-DD HH:mm:ss')} UTC`);
        };



        await scheduleMessage({
            senderId,
            type: 'template',
            templateName: 'morning_day5',
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
                    ? "Did you know that vaping can cause 🫁 severe lung damage and 😷 acute respiratory illnesses?"
                    : "¿Sabías que el vapeo puede causar 🫁 daños pulmonares severos y 😷 enfermedades respiratorias agudas?"
            }, times.first, 'first');
        }

        if (nivel === 'alto' || nivel === 'high') {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "🗣️ Vaping is linked to a higher risk of heart attack"
                    : "🗣️ El vaping está relacionado con un mayor riesgo de ataque cardíaco"
            }, times.second, 'second');
        }

        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? `🗯️ ${nombre} - I may not have mentioned this, but having a hobby can distract you from vaping, and 72% of users report it has helped them. Have you thought about picking up something new? Reading, painting, or even taking short afternoon walks are great options.`
                : `🗯️ ${nombre} - No sé si te lo había dicho, pero tener un hobby puede distraerte del vapeo y el 72% de los usuarios reconocen que les ha ayudado. ¿Has pensado en aprender algo nuevo? La lectura, la pintura o incluso las caminatas cortas por la tarde pueden ser excelentes opciones.`

        }, times.third, 'third');



        if ((nivel === 'medio' || nivel === 'alto') || (nivel === 'medium' || nivel === 'high')) {
            await scheduleMessage({
                senderId,
                type: 'text',
                message: idioma === 'ingles'
                    ? "Did you know that e-cigarettes can explode 💥, causing severe injuries to the face 😵 and hands?"
                    : "¿Sabías que los cigarrillos electrónicos pueden explotar 💥, causando lesiones graves en la cara 😵 y manos?"
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
                    ? "Did you know that vaping can trigger asthma symptoms in people who have never had the condition 🌬️?"
                    : "¿Sabías que el vapeo puede provocar síntomas de asma en personas que nunca han tenido la enfermedad 🌬️?"
            }, times.fifth, 'fifth');
        }

        await scheduleMessage({
            senderId,
            type: 'checktest',
            testId:'2',
            message: idioma === 'ingles'
                ? `💨 Your Lung Retention Test is still pending. Clic here to do it:: ${testUrl}`
                : `💨 Aún tienes pendiente tu prueba de retención pulmonar! Da clic aquí: ${testUrl}`
        }, times.RecUrl, 'RecUrl');


        await scheduleMessage({
            senderId,
            type: 'text',
            message: idioma === 'ingles'
                ? "Hey! I got a letter for you! Here it is...\n\nJust wanted to take a moment to say how awesome it is that you’ve made it to day 5 of the Olya program. I was right where you are not too long ago, and I totally get how tough those first few days can be. But honestly, they’re also the most important ones. Every little step you're taking is getting you closer to breaking free, and trust me, it’s so worth it.\n\nThis isn’t just about quitting vaping, it’s about taking back control of your life and feeling better overall. I finished the program, and I can’t even describe how great it feels on the other side. So whenever those cravings hit hard, take a deep breath and remind yourself of how far you’ve already come. You’re so much closer to the finish line than you think.\n\nKeep going—you’ve got this!\n\nMichael D. - Hershey, PA. \n\n🎉 PD: Congratulations! Here’s your recognition for completing day 5. Keep it up!"
                : "¡Hey! ¡Me dieron una carta para ti! Aquí te la dejo...\n\n¡Hola! Quiero decirte lo increíble que es que ya estés en el día 5 del programa de Olya. Yo estuve en tu lugar no hace mucho, y sé que los primeros días pueden ser desafiantes, pero también son los más importantes. Cada pequeño paso que das te acerca más a tu objetivo, y créeme, el esfuerzo que estás haciendo ahora te va a traer una libertad y una tranquilidad que no te imaginas.\n\nRecuerda que esto no es solo dejar de vapear, es recuperar el control sobre ti mismo y tu bienestar. Yo terminé el programa y te puedo decir que la sensación de haberlo logrado es indescriptible. Así que sigue fuerte, ten paciencia contigo mismo, y cuando sientas que las ganas son intensas, respira profundo y recuerda todo lo que has avanzado hasta ahora. ¡Estás más cerca de lo que crees!\n\nKarla G. - CDMX  PD: ¡Felicidades! Aquí tienes tu reconocimiento por haber completado tu 5to día. ¡Sigue así!"

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
                    ? "Vaping can lead to chronic lung diseases 🫁. You’ll live with constant pain 😣 and require prolonged medical treatment 💊."
                    : "Vapear puede provocar enfermedades pulmonares crónicas 🫁. Vivirás con dolor constante 😣 y necesitarás tratamiento médico prolongado 💊."
            }, times.seventh, 'seventh');

        }

        await scheduleMessage({
            senderId,
            type: 'estado',
            estado: 'dia6', // 🔥 Cambia al siguiente día
        }, times.dia6Transition, 'dia6_transition');

        console.log(`📅 Mensajes programados para el usuario ${senderId}`);
    } catch (error) {
        console.error(`❌ Error al programar el día 5 para ${senderId}:`, error);
    }
};

module.exports = dia5;
