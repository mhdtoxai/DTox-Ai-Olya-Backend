const express = require('express');
const bodyParser = require('body-parser');
const formRoutes = require('./routes/formRoutes');
const cors = require('cors');

const app = express();

// Configurar CORS para permitir solicitudes solo desde http://localhost:5173
app.use(cors({
  origin: 'http://localhost:5173'
}));

app.use(bodyParser.json());
app.use('/api', formRoutes);

module.exports = app;
