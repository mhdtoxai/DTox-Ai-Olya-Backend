const getUserInfo = require('../../services/getUserInfo');
const schedule = require('node-schedule');
const sendTemplateMessageVariable = require('../../services/Wp-Envio-Msj/sendTemplateMessageVariable');
const sendMessage = require('../../services/Wp-Envio-Msj/sendMessage');
const moment = require('moment-timezone');
const scheduledJobs = {}; // Objeto para almacenar trabajos programados
const userService = require('../../services/userService');

// Función para cancelar trabajos programados
const cancelScheduledJobs = (senderId) => {
    if (scheduledJobs[senderId]) {
        console.log(`Cancelando trabajos para el usuario ${senderId}`);
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
        console.log(`Todos los trabajos para el usuario ${senderId} han sido cancelados y eliminados.`);
    } else {
        console.log(`No se encontraron trabajos para el usuario ${senderId}.`);
    }
};

const dia21 = async (senderId) => {
    try {
        console.log(`Iniciando programación de mensajes para el usuario ${senderId}`);

        // Verificar y cancelar trabajos existentes al inicio
        cancelScheduledJobs(senderId);

        // Obtener la información del usuario incluyendo el nivel y la zona horaria
        const { idioma, nombre, nivel, timezone } = await getUserInfo(senderId);
        console.log(`Usuario ${senderId} tiene idioma: ${idioma}, nombre: ${nombre}, nivel: ${nivel}, timezone: ${timezone}`);

        // Definir el código de idioma y el nombre de la plantilla
        const languageCode = idioma === 'ingles' ? 'en_US' : 'es_MX';
        const templateName = 'morning_day_21'; // Nombre de la plantilla

        // Crear objetos de fecha y hora en la zona horaria del usuario para cada mensaje
        const times = {
            morning: moment.tz('07:00', 'HH:mm', timezone), // 7 AM - Plantilla
            programafinalizado: moment.tz('8:00', 'HH:mm', timezone) // 10 PM
        };

        // Convertir las horas del usuario a la hora del servidor
        const serverTimes = {};
        Object.keys(times).forEach(key => {
            serverTimes[key] = times[key].clone().tz(moment.tz.guess());
            // console.log(`Hora convertida servidor (${key}): ${serverTimes[key].format('YYYY-MM-DD HH:mm:ss')}`);
        });

        // Programar cada mensaje
        scheduledJobs[senderId] = {
            morning: schedule.scheduleJob(`MensajeBuenosDias ${senderId}`, { hour: serverTimes.morning.hours(), minute: serverTimes.morning.minutes() }, async () => {
                console.log(`Programado msj buenos días ${senderId} a las ${serverTimes.morning.format()}`);


                  // Enlace dinámico para el mensaje
                  const dynamicLink = `https://olya.club/FinEnc?id=${senderId}&name=${encodeURIComponent(nombre)}&language=${idioma}`;

                  // Parámetros con solo el enlace
                  const parameters = [
                      { type: 'text', text: dynamicLink } // Solo el enlace
                  ];
                // Enviar el mensaje de plantilla de buenos días
                await sendTemplateMessageVariable(senderId, templateName, languageCode,parameters);


            }),

            programafinalizado: schedule.scheduleJob(`MensajeSeptimo ${senderId}`, { hour: serverTimes.programafinalizado.hours(), minute: serverTimes.programafinalizado.minutes() }, async () => {
                console.log(`Programado séptimo mensaje ${senderId} a las ${serverTimes.programafinalizado.format()}`);



                // Esperar a que el orogramafinalizado se haya enviado antes de cancelar los trabajos
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


                // Actualizar el estado
                await userService.updateUser(senderId, { estado: 'programafinalizado' });

                // Hacer la llamada a la API para realizar el backup y eliminar el usuario
                try {
                    const response = await fetch('https://olya.club/api/backup/user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ senderId })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log(`Respuesta de la API: ${data.mensaje}`);
                    } else {
                        console.error('Error al realizar el backup y eliminar el usuario');
                    }
                } catch (error) {
                    console.error('Error en la solicitud a la API:', error);
                }

            })
        };

        // Imprimir detalles de los trabajos programados
        console.log(`Trabajos 21 programados para el usuario ${senderId}:`);
        Object.keys(scheduledJobs[senderId]).forEach(jobName => {
            const job = scheduledJobs[senderId][jobName];
            console.log(`Trabajo: ${jobName}, Próxima invocación: ${job.nextInvocation().toString()}`);
        });
    } catch (error) {
        console.error(`Error al programar los mensajes para el usuario ${senderId}:`, error);
    }
};

module.exports = dia21;
