// const admin = require('firebase-admin');
// const serviceAccount = require('./key.json');

// // Inicializar Firebase Admin SDK
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://dtox-ai.firebaseio.com'

// });

// console.log("Firebase Admin SDK cargado correctamente.");

// const db = admin.firestore();

// module.exports = db;


const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK con las credenciales de las variables de entorno
admin.initializeApp({
    credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ajustar el formato de la clave privada
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

console.log("Firebase Admin SDK cargado correctamente.");

const db = admin.firestore();

module.exports = db;
