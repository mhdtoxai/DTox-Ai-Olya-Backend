const express = require('express');

const formRoutes = require('./routes/formRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const userRoutes = require('./routes/userRoutes');
const webhookStripe  = require('./routes/webhookStripe');
const cuestionarioRoutes  = require('./routes/cuestionarioRoutes');

const cors = require('cors');
const path = require('path'); // Importar el módulo path

const app = express();


// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());


app.use('/api/webhook', webhookStripe);

// Middleware para manejar datos JSON y URL codificada
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/user', userRoutes);
app.use('/api', formRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/user', cuestionarioRoutes);


module.exports = app;

