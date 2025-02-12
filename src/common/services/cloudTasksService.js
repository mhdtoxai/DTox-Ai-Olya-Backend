require('dotenv').config();

const { CloudTasksClient } = require('@google-cloud/tasks');
// Cargar credenciales desde .env
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
// Crear cliente con las credenciales
const client = new CloudTasksClient({ credentials });

const project = 'dtox-ai-a6f48';
const queue = 'ProgramaDias';
const location = 'us-central1';
const serviceUrl = 'https://olya.club/api/runTask';

const scheduleTask = async (payload, dateTime) => {
  try {
    const parent = client.queuePath(project, location, queue);

    // Extraer `taskName` del payload y asegurarse de que existe
    const taskName = payload.taskName || `task-${Date.now()}`;

    const task = {
      name: `${parent}/tasks/${taskName}`, // Usamos taskName como identificador único
      httpRequest: {
        httpMethod: 'POST',
        url: serviceUrl,
        headers: { 'Content-Type': 'application/json' },
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      },
      scheduleTime: { seconds: Math.floor(dateTime.getTime() / 1000) },
    };

    const [response] = await client.createTask({ parent, task });
    console.log(`✅ Tarea programada: ${response.name}`);
  } catch (error) {
    console.error('❌ Error al programar la tarea:', error);
  }
};

module.exports = scheduleTask;
