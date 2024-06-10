const admin = require('firebase-admin');
const serviceAccount = require('./key.json');

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dtox-ai.firebaseio.com'

});

console.log("Firebase Admin SDK cargado correctamente.");

const db = admin.firestore();

module.exports = db;