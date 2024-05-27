
const admin = require('firebase-admin');
const fs = require('fs');

// Lee la ruta del archivo JSON desde las variables de entorno
const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;

// Verifica si la ruta del archivo JSON está definida en las variables de entorno
if (!serviceAccountFile) {
  console.error("Error: La ruta del archivo JSON de la clave privada de Firebase no está definida en las variables de entorno.");
  process.exit(1);
}

// Lee el archivo JSON de la clave privada de Firebase
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountFile));

// Configurar Firebase utilizando las credenciales del archivo JSON
const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://dtox-ai.firebaseio.com' // Reemplaza con la URL de tu base de datos Firebase
};

// Inicializar Firebase Admin SDK con las credenciales
admin.initializeApp(firebaseConfig);

console.log("Firebase Admin SDK cargado correctamente.");

const db = admin.firestore();

module.exports = db;
