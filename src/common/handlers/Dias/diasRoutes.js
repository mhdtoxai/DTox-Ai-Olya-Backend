// diasRoutes.js

// Aquí importas todas las funciones correspondientes a los días
const handleDia1Call=require('../Onboarding/handleDia1Call');
const handleRemoteUser = require('../Onboarding/handleRemoteUser');
const dia1 = require('./dia1');
const dia2 = require('./dia2');  // Asegúrate de tener el archivo correcto y la función exportada
const dia3 = require('./dia3');  // Lo mismo para otros días
const dia4 = require('./dia4');
const dia5 = require('./dia5');
const dia6 = require('./dia6');
const dia7 = require('./dia7');
const dia8 = require('./dia8');
const dia9 = require('./dia9');
const dia10 = require('./dia10');
const dia11 = require('./dia11');
const dia12 = require('./dia12');
const dia13 = require('./dia13');
const dia14 = require('./dia14');
const dia15 = require('./dia15');
const dia16 = require('./dia16');
const dia17 = require('./dia17');
const dia18 = require('./dia18');
const dia19 = require('./dia19');
const dia20 = require('./dia20');
const dia21 = require('./dia21');


// Mapeamos los días a sus respectivas funciones
const diasRoutes = {
  'mensajeremoto': handleRemoteUser,
  'programardia1': handleDia1Call,
  'dia1': dia1,
  'dia2': dia2,
  'dia3': dia3,
  'dia4': dia4,
  'dia5': dia5,
  'dia6': dia6,
  'dia7': dia7,
  'dia8': dia8,
  'dia9': dia9,
  'dia10': dia10,
  'dia11': dia11,
  'dia12': dia12,
  'dia13': dia13,
  'dia14': dia14,
  'dia15': dia15,
  'dia16': dia16,
  'dia17': dia17,
  'dia18': dia18,
  'dia19': dia19,
  'dia20': dia20,
  'dia21': dia21,
 
};

module.exports = diasRoutes;

