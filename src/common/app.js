const express = require('express');
const bodyParser = require('body-parser');
const formRoutes = require('./routes/formRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const userRoutes = require('./routes/userRoutes');

const cors = require('cors');

const app = express();

// Configurar CORS para permitir solicitudes solo desde http://localhost:5173
// app.use(cors({
//   origin: 'http://localhost:5173'
// }));


// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());

// Middleware para manejar datos JSON y URL codificada
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(bodyParser.json());


app.use('/api/user', userRoutes);
app.use('/api', formRoutes);
app.use('/webhook', webhookRoutes);


module.exports = app;

