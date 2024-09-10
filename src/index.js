require('dotenv').config();
const app = require('./common/app');

// Obtener el puerto desde las variables de entorno
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


// require('dotenv').config();
// const app = require('./common/app');
// const processUsersWithDia1 = require('./common/scripts/processUsersWithDia1');

// // Ejecutar la función al iniciar el servidor
// processUsersWithDia1();

// // Obtener el puerto desde las variables de entornos
// const PORT = process.env.PORT;

// app.listen(PORT, () => {
//   console.log(`Servidor corriendo en el puerto ${PORT}`);
// });
