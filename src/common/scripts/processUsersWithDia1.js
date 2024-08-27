const { getUsersByState } = require('../services/userService');

const dia1 = require('../handlers/Dias/dia1');
const dia2 = require('../handlers/Dias/dia2');
const dia3 = require('../handlers/Dias/dia3');
const dia4 = require('../handlers/Dias/dia4');
const dia5 = require('../handlers/Dias/dia5');
const dia6 = require('../handlers/Dias/dia6');
const dia7 = require('../handlers/Dias/dia7');
const dia8 = require('../handlers/Dias/dia8');
const dia9 = require('../handlers/Dias/dia9');
const dia10 = require('../handlers/Dias/dia10');
const dia11 = require('../handlers/Dias/dia11');
const dia12 = require('../handlers/Dias/dia12');
const dia13 = require('../handlers/Dias/dia13');
const dia14 = require('../handlers/Dias/dia14');
const dia15 = require('../handlers/Dias/dia15');
const dia16 = require('../handlers/Dias/dia16');
const dia17 = require('../handlers/Dias/dia17');
const dia18 = require('../handlers/Dias/dia18');
const dia19 = require('../handlers/Dias/dia19');
const dia20 = require('../handlers/Dias/dia20');



const handleRemoteUser = require('../handlers/Onboarding/handleRemoteUser');
const handleDia1Call = require('../handlers/Onboarding/handleDia1Call');


const BATCH_SIZE = 10;
const CONCURRENCY_LIMIT = 5;

const handlers = {
  mensajeremoto: handleRemoteUser,
  programardia1: handleDia1Call,
  dia1: dia1,
  dia2: dia2,
  dia3: dia3,
  dia4: dia4,
  dia5: dia5,
  dia6: dia6,
  dia7: dia7,
  dia8: dia8,
  dia9: dia9,
  dia10: dia10,
  dia11: dia11,
  dia12: dia12,
  dia13: dia13,
  dia14: dia14,
  dia15: dia15,
  dia16: dia16,
  dia17: dia17,
  dia18: dia18,
  dia19: dia19,
  dia20: dia20,

 

  
  // Agrega más días y sus manejadores aquí
};

async function processUsersByState(state, handler) {
  try {
    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(CONCURRENCY_LIMIT);

    let startAfter = null;
    let usersSnapshot;
    let usersFound = false;

    do {
      usersSnapshot = await getUsersByState(state, BATCH_SIZE, startAfter);

      if (usersSnapshot && !usersSnapshot.empty) {
        usersFound = true;
        const processingPromises = usersSnapshot.docs.map(doc => {
          const userId = doc.id;
          const userData = doc.data();

          // Validar userData si es necesario
          if (!userData) {
            console.error(`Datos del usuario ${userId} no encontrados en ${state}.`);
            return Promise.resolve(); // O gestionar según sea necesario
          }

          console.log(`Usuario ${userId} será reprogramado para el estado ${state}.`); // Mensaje indicando reprogramación

          return limit(() => handler(userId, userData).then(() => {
            console.log(`Usuario ${userId} procesado correctamente en ${state}.`);
          }).catch(error => {
            console.error(`Error al procesar el usuario ${userId} en ${state}:`, error);
          }));
        });

        await Promise.all(processingPromises);
        startAfter = usersSnapshot.docs.length > 0 ? usersSnapshot.docs[usersSnapshot.docs.length - 1] : null;
      }
    } while (usersSnapshot && !usersSnapshot.empty);

    if (!usersFound) {
      console.log(`No hay usuarios con el estado ${state}.`);
    } else {
      console.log(`Procesamiento de usuarios con estado ${state} completado.`);
    }
  } catch (error) {
    console.error(`Error al procesar usuarios con estado ${state}:`, error);
  }
}

async function processAllStates() {
  for (const [state, handler] of Object.entries(handlers)) {
    await processUsersByState(state, handler);
  }
}

module.exports = processAllStates;

