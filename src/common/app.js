const express = require('express');
const path = require('path');

const formRoutes = require('./routes/formRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const userRoutes = require('./routes/userRoutes');
const webhookStripe  = require('./routes/webhookStripe');
const cuestionarioRoutes  = require('./routes/cuestionarioRoutes');
const testrespiracionRoutes  = require('./routes/testrespiracionRoutes');
const userBackupRoutes  = require('./routes/userBackupRoutes');



const cors = require('cors');

const app = express();


// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());


app.use('/backend/webhook', webhookStripe);

// Middleware para manejar datos JSON y URL codificada
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configura la carpeta pública para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/user', userRoutes);
app.use('/api', formRoutes);
app.use('/api/meta/webhook', webhookRoutes);
app.use('/api/user', cuestionarioRoutes);
app.use('/api/test', testrespiracionRoutes);
app.use('/api/backup', userBackupRoutes);


module.exports = app;

