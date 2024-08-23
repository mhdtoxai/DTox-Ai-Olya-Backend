const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessage = require('../../services/Wp-Envio-Msj/sendTemplateMessage');
const sendMessageTarget = require('../../services/Wp-Envio-Msj/sendMessageTarget');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone'); // Asegúrate de tener instalada esta biblioteca
const dia10 = require('./dia10'); // Asegúrate de ajustar la ruta según tu estructura de archivos

const scheduledJobs = {}; // Objeto para almacenar trabajos programados

const dia9 = async (senderId) => {
    try {
        console.log(`Iniciando programación de mensajes para el usuario ${senderId}`);

        // Verificar y cancelar trabajos existentes al inicio
        if (scheduledJobs[senderId]) {
            console.log(`Cancelando trabajos anteriores para el usuario ${senderId}`);
            const userJobs = scheduledJobs[senderId];
            for (const jobName in userJobs) {
                if (userJobs.hasOwnProperty(jobName)) {
                    console.log(`Cancelando trabajo: ${jobName} programado para ${userJobs[jobName].nextInvocation().toString()}`);
                    const wasCancelled = userJobs[jobName].cancel(); // Intentar cancelar el trabajo
                    if (wasCancelled) {
                        console.log(`Trabajo ${jobName} fue cancelado con éxito.`);
                    } else {
                        console.log(`No se pudo cancelar el trabajo ${jobName}.`);
                    }
                }
            }
            delete scheduledJobs[senderId];
            console.log(`Todos los trabajos anteriores para el usuario ${senderId} han sido cancelados y eliminados.`);
        } else {
            console.log(`No se encontraron trabajos anteriores para el usuario ${senderId}.`);
        }


        // Obtener la información del usuario incluyendo el nivel y la zona horaria
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, nivel: ${nivel}, timezone: ${timezone}`);

        // Definir el código de idioma y el nombre de la plantilla
        const languageCode = idioma === 'ingles' ? 'en_US' : 'es_MX';
        const templateName = 'morning_day9'; // Nombre de la plantilla

        // Crear objetos de fecha y hora en la zona horaria del usuario para cada mensaje
        const times = {
            morning: moment.tz('07:00', 'HH:mm', timezone), // 7 AM - Plantilla
            first: moment.tz('10:00', 'HH:mm', timezone), // 10 AM
            second: moment.tz('12:00:', 'HH:mm', timezone), // 12 PM
            third: moment.tz('14:00', 'HH:mm', timezone), // 2 PM
            fourth: moment.tz('16:00', 'HH:mm', timezone), // 4 PM
            fifth: moment.tz('18:00', 'HH:mm', timezone), // 6 PM
            sixth: moment.tz('20:00', 'HH:mm', timezone), // 8 PM
            seventh: moment.tz('22:00', 'HH:mm', timezone) // 10 PM
        };


        console.log(`Horas del usuario convertidas a objetos de momento:`);
        Object.keys(times).forEach(key => {
            console.log(`Hora ${key}: ${times[key].format('YYYY-MM-DD HH:mm:ss')}`);
        });

        // Convertir las horas del usuario a la hora del servidor
        const serverTimes = {};
        Object.keys(times).forEach(key => {
            serverTimes[key] = times[key].clone().tz(moment.tz.guess());
            console.log(`Hora convertida servidor (${key}): ${serverTimes[key].format('YYYY-MM-DD HH:mm:ss')}`);
        });

        // Programar cada mensaje
        scheduledJobs[senderId] = {
            morning: schedule.scheduleJob(`MensajeBuenosDias ${senderId}`, { hour: serverTimes.morning.hours(), minute: serverTimes.morning.minutes() }, async () => {
                console.log(`Programado msj buenos días ${senderId} a las ${serverTimes.morning.format()}`);

                // Enviar el mensaje de plantilla de buenos días
                await sendTemplateMessage(senderId, templateName, languageCode);

                // Iniciar el envío del mensaje de consentimiento
                const messageText = "¿Estás de acuerdo?";
                const buttons = [
                    { id: 'yes', title: 'Sí' },];
                // Enviar el mensaje interactivo con botones
                await sendMessageTarget(senderId, messageText, buttons);
                console.log(`Mensaje de confirmacion enviado para el usuario ${senderId}`);
            }),


            first: schedule.scheduleJob(`MensajePrimero ${senderId}`, { hour: serverTimes.first.hours(), minute: serverTimes.first.minutes() }, async () => {
                console.log(`Programado primer mensaje ${senderId} a las ${serverTimes.first.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const firstMessage = idioma === 'ingles' ?
                        `Did you know that vaping can lead to nicotine dependence equal to or even greater 🚬 than smoking traditional cigarettes?` :
                        `¿Sabías que el vapeo puede llevar a una dependencia de la nicotina igual o incluso mayor 🚬 que fumar cigarrillos tradicionales?`;

                    await sendMessage(senderId, firstMessage);
                    console.log(`Primer mensaje enviado a ${senderId}`);
                }
            }),

            second: schedule.scheduleJob(`MensajeSegundo ${senderId}`, { hour: serverTimes.second.hours(), minute: serverTimes.second.minutes() }, async () => {
                console.log(`Programado segundo mensaje ${senderId} a las ${serverTimes.second.format()}`);

                if (nivel === 'alto') {
                    const secondMessage = idioma === 'ingles' ?
                        `🗣️ Vaping can cause high blood pressure.` :
                        `🗣️ Vapear puede provocar hipertensión arterial.`;

                    await sendMessage(senderId, secondMessage);
                    console.log(`Mensaje específico enviado para el usuario ${senderId}`);
                }
            }),

            third: schedule.scheduleJob(`MensajeTercero ${senderId}`, { hour: serverTimes.third.hours(), minute: serverTimes.third.minutes() }, async () => {
                console.log(`Programado tercer mensaje ${senderId} a las ${serverTimes.third.format()}`);

                const thirdMessage = idioma === 'ingles' ?
                    `"In the middle of the day, remember: 'Success is the sum of small efforts repeated day in and day out.' – Robert Collier. Keep going!"` :
                    `"A mitad del día, recuerda: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.' – Robert Collier. ¡Sigue adelante!"`;

                await sendMessage(senderId, thirdMessage);
                console.log(`Tercer mensaje enviado a usuario ${senderId}`);

            }),

            fourth: schedule.scheduleJob(`MensajeCuarto ${senderId}`, { hour: serverTimes.fourth.hours(), minute: serverTimes.fourth.minutes() }, async () => {
                console.log(`Programado cuarto mensaje ${senderId} a las ${serverTimes.fourth.format()}`);

                if (nivel === 'medio' || nivel === 'alto') {
                    const fourthMessage = idioma === 'ingles' ?
                        `Did you know that vape liquids can contain carcinogenic substances like tobacco-specific nitrosamines 🧬🧬?` :
                        `¿Sabías que los líquidos de vapeo pueden contener sustancias cancerígenas como las nitrosaminas específicas del tabaco 🧬🧬?`;

                    await sendMessage(senderId, fourthMessage);
                    console.log(`Mensaje sobre sustancias cancerígenas enviado para el usuario ${senderId}`);
                }
            }),

            fifth: schedule.scheduleJob(`MensajeQuinto ${senderId}`, { hour: serverTimes.fifth.hours(), minute: serverTimes.fifth.minutes() }, async () => {
                console.log(`Programado quinto mensaje ${senderId} a las ${serverTimes.fifth.format()}`);

                if (nivel === 'alto') {
                    const fifthMessage = idioma === 'ingles' ?
                        `Did you know that vaping can cause oxidative damage to body tissues, contributing to premature aging 🕰️👵?` :
                        `¿Sabías que el vapeo puede causar daño oxidativo en los tejidos del cuerpo, lo que contribuye al envejecimiento prematuro 🕰️👵?`;

                    await sendMessage(senderId, fifthMessage);
                    console.log(`Quinto mensaje enviado a ${senderId}`);
                }
            }),

            sixth: schedule.scheduleJob(`MensajeSexto ${senderId}`, { hour: serverTimes.sixth.hours(), minute: serverTimes.sixth.minutes() }, async () => {
                console.log(`Programado sexto mensaje ${senderId} a las ${serverTimes.sixth.format()}`);

                const sixthMessage = idioma === 'ingles' ?
                    `Congratulations! You’ve completed day 9 of your program.\n\nNow you should take out the paper where you wrote this morning.\n1.- Read the reasons you wrote down\n2.- Realize that you carried those reasons all day\n3.- They didn’t help you, in fact, they probably were a hindrance.\n4.- Similarly, vaping is a habit that serves no purpose.\n5.- Tear the paper into as many pieces as you can and throw it away.\n6.- While you do this, thank yourself for the great step you are taking\n\nCongratulations! Time for dinner and bed :)` :
                    `¡Felicidades! Has pasado el día 9 de tu programa.\n\nLo que deberás hacer ahora es sacar el papel donde anotaste esta mañana.\n1.- Lee las razones que anotaste\n2.- Date cuenta que todo el día estuviste cargando con esas razones\n3.- No te aportaron nada, de hecho seguramente te estuvieron estorbando.\n4.- De la misma manera, vapear es un hábito que no te sirve de nada.\n5.- Rompe el papel en tantos pedazos como puedas y tíralo a la basura.\n6.- Mientras lo haces, agradécete a ti mismo por el gran paso que estás dando\n\n¡Felicidades! A cenar y a dormir :)`;

                await sendMessage(senderId, sixthMessage);
                console.log(`Mensaje sexto enviado a usuario ${senderId}`);
            }),


            seventh: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.seventh.hours(), minute: serverTimes.seventh.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.seventh.format()}`);

                if (nivel === 'alto') {
                    const seventhMessage = idioma === 'ingles' ?
                        `Vaping can harm your heart ❤️. You could develop arrhythmias ⚠️ and suffer a heart attack 💔 at any moment.` :
                        `Vapear afecta tu corazón ❤️. Podrías desarrollar arritmias ⚠️ y sufrir un infarto 💔 en cualquier momento.`;

                    await sendMessage(senderId, seventhMessage);
                    console.log(`Séptimo mensaje enviado a usuario ${senderId}`);
                }


                // Esperar a que el mensaje 7 se haya enviado antes de cancelar los trabajos
                if (scheduledJobs[senderId]) {
                    console.log(`Cancelando todos los trabajos programados al finalizar para el usuario ${senderId}`);
                    const userJobs = scheduledJobs[senderId];
                    for (const jobName in userJobs) {
                        if (userJobs.hasOwnProperty(jobName)) {
                            console.log(`Cancelando trabajo: ${jobName} programado para ${userJobs[jobName].nextInvocation().toString()}`);
                            const wasCancelled = userJobs[jobName].cancel(); // Intentar cancelar el trabajo
                            if (wasCancelled) {
                                console.log(`Trabajo ${jobName} fue cancelado con éxito.`);
                            } else {
                                console.log(`No se pudo cancelar el trabajo ${jobName}.`);
                            }
                        }
                    }
                    delete scheduledJobs[senderId];
                    console.log(`Todos los trabajos anteriores para el usuario ${senderId} han sido cancelados y eliminados.`);
                } else {
                    console.log(`No se encontraron trabajos programados para cancelar.`);
                }

                // Llamar a dia 10 después de cancelar todos los trabajos
                await dia10(senderId);
            })
        };
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia9;