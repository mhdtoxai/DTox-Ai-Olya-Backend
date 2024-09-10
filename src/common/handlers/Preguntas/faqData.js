// faqData.js
const faqs = {
    "¿qué es olya y cómo funciona?": "Olya es un asistente conversacional en WhatsApp que ayuda a dejar de vapear mediante un programa personalizado de 10 días.",
    "what is olya and how does it work?": "Olya is a WhatsApp conversational assistant that helps quit vaping through a personalized 10-day program.",
  
    "¿cuál es el costo del servicio?": "Costo promedio de vape en México (variable) $250. Programa para dejar de vapear $199. Tu salud… no tiene precio. El plan incluye:\n- Programa completo de seguimiento por 10 días\n- Ejercicios de control de ansiedad y antojos\n- Medición de capacidad pulmonar",
    "what is the cost of the service?": "The average cost of vaping in Mexico (variable) is $250. The quit vaping program costs $199. Your health is priceless. The plan includes:\n- Full 10-day follow-up program\n- Exercises to control anxiety and cravings\n- Lung capacity measurement",
  
    "¿cuánto tiempo dura el programa?": "El programa dura 10 días.",
    "how long does the program last?": "The program lasts for 10 days.",
  
    "¿cómo se personaliza el programa?": "El programa se personaliza mediante la observación de tus usos y costumbres, así como un cuestionario inicial de conocimiento.",
    "how is the program personalized?": "The program is personalized based on your habits and a initial knowledge questionnaire.",
  
    "¿qué incluye el programa personalizado?": "Incluye consejos, recordatorios y recomendaciones en general para apoyar al usuario en su lucha por dejar de vapear.",
    "what does the personalized program include?": "It includes tips, reminders, and general recommendations to support the user in quitting vaping.",
  
    "¿cómo ayuda olya a combatir los antojos y la ansiedad?": "Olya ofrece apoyo en tiempo real, técnicas de manejo del estrés y estrategias para superar los antojos y la ansiedad.",
    "how does olya help combat cravings and anxiety?": "Olya provides real-time support, stress management techniques, and strategies to overcome cravings and anxiety.",
  
    "¿es necesario tener whatsapp para usar olya?": "Sí, el servicio se proporciona a través de WhatsApp.",
    "do I need WhatsApp to use olya?": "Yes, the service is provided through WhatsApp.",
    
    "¿qué sucede si necesito más tiempo después de los 10 días?": "Puedes contactar a nuestro soporte para opciones adicionales o renovaciones del programa.",
    "what happens if I need more time after the 10 days?": "You can contact our support for additional options or program renewals.",
  
    "¿es olya adecuado para todas las edades?": "El programa está diseñado principalmente para adultos. Consulta con un profesional de salud si tienes alguna duda.",
    "is olya suitable for all ages?": "The program is primarily designed for adults. Consult a healthcare professional if you have any concerns.",
  
    "¿hay algún reembolso si no estoy satisfecho con el servicio?": "Consulta nuestra política de reembolso en nuestro sitio web o contacta a nuestro servicio al cliente.",
    "is there a refund if I am not satisfied with the service?": "Check our refund policy on our website or contact our customer service.",
  
    "¿necesito dejar de vapear inmediatamente al iniciar el programa?": "No necesariamente. El programa está diseñado para ayudarte a reducir y eventualmente dejar de vapear de manera gradual.",
    "do I need to quit vaping immediately when starting the program?": "Not necessarily. The program is designed to help you reduce and eventually quit vaping gradually.",
  
    "¿qué tipo de soporte ofrece olya durante el programa?": "Olya ofrece soporte continuo mediante mensajes de texto, recordatorios y respuestas a tus preguntas y preocupaciones.",
    "what type of support does olya offer during the program?": "Olya offers continuous support through text messages, reminders, and answers to your questions and concerns.",
  
    "¿cómo se maneja la privacidad de mis datos?": "Tomamos la privacidad de tus datos muy en serio y seguimos estrictas políticas de protección de datos. Consulta nuestra política de privacidad para más detalles.",
    "how is my data privacy managed?": "We take your data privacy very seriously and follow strict data protection policies. Check our privacy policy for more details.",
  
    "¿olya está disponible en otros idiomas?": "Actualmente, Olya está disponible en español. Consulta para futuras actualizaciones sobre otros idiomas.",
    "is olya available in other languages?": "Currently, Olya is available in Spanish. Check for future updates on other languages.",
  
    "¿qué debo hacer si tengo un problema técnico con el servicio?": "Contacta a nuestro soporte técnico a través de WhatsApp o nuestro sitio web para asistencia.",
    "what should I do if I encounter a technical issue with the service?": "Contact our technical support via WhatsApp or our website for assistance.",
  
    "¿olya ofrece algún tipo de seguimiento después de los 10 días?": "Puedes optar por programas de seguimiento y soporte adicional después de completar los 10 días iniciales.",
    "does olya offer any follow-up after the initial 10 days?": "You can opt for follow-up programs and additional support after completing the initial 10 days.",
  
    "¿hay algún tipo de compromiso a largo plazo?": "No, el compromiso inicial es solo por 10 días, pero puedes elegir continuar con el soporte si lo deseas.",
    "is there any long-term commitment?": "No, the initial commitment is only for 10 days, but you can choose to continue with support if desired.",
  
    "¿puedo usar olya junto con otros métodos para dejar de vapear?": "Sí, Olya puede complementar otros métodos o tratamientos que estés usando para dejar de vapear.",
    "can I use olya alongside other methods to quit vaping?": "Yes, Olya can complement other methods or treatments you are using to quit vaping.",
  
    "¿cómo empiezo con olya?": "Regístrate en nuestro sitio web y sigue las instrucciones para comenzar a usar Olya a través de WhatsApp.",
    "how do I get started with olya?": "Sign up on our website and follow the instructions to start using Olya via WhatsApp.",
  
    "¿qué pasa si no tengo acceso a whatsapp todo el tiempo?": "Trata de acceder a WhatsApp al menos una vez al día para recibir los mensajes y apoyo de Olya.",
    "what if I don't have access to WhatsApp all the time?": "Try to access WhatsApp at least once a day to receive messages and support from Olya.",
  
    "¿el servicio de olya requiere algún tipo de equipamiento adicional?": "No, solo necesitas tu teléfono móvil con acceso a WhatsApp.",
    "does olya's service require any additional equipment?": "No, you only need your mobile phone with access to WhatsApp.",
  
    "¿olya proporciona algún tipo de material de lectura o recursos adicionales?": "Sí, Olya te enviará artículos, enlaces y otros recursos útiles durante el programa.",
    "does olya provide any reading material or additional resources?": "Yes, Olya will send you articles, links, and other helpful resources during the program.",
  
    "¿puedo personalizar la frecuencia de los mensajes de olya?": "Sí, puedes ajustar la frecuencia de los mensajes según tus necesidades y preferencias.",
    "can I customize the frequency of olya's messages?": "Yes, you can adjust the message frequency according to your needs and preferences.",
  
    "¿qué tipo de técnicas utiliza olya para ayudar a dejar de vapear?": "Utiliza técnicas de manejo del estrés, mindfulness, y estrategias de cambio de comportamiento.",
    "what techniques does olya use to help quit vaping?": "It uses stress management techniques, mindfulness, and behavior change strategies.",
  
    "¿el servicio de olya es apto para mujeres embarazadas?": "Recomendamos que las mujeres embarazadas consulten a su médico antes de usar el servicio.",
    "is olya's service suitable for pregnant women?": "We recommend that pregnant women consult their doctor before using the service.",
  
    "¿puedo recomendar olya a un amigo o familiar?": "Sí, puedes recomendar Olya a otros, y ellos pueden inscribirse individualmente.",
    "can I recommend olya to a friend or family member?": "Yes, you can recommend Olya to others, and they can enroll individually.",
  
    "¿hay algún requisito médico para usar olya?": "No hay requisitos médicos, pero es recomendable consultar a un profesional de la salud si tienes condiciones preexistentes.",
    "are there any medical requirements to use olya?": "There are no medical requirements, but it's advisable to consult a healthcare professional if you have pre-existing conditions.",
  
    "¿cómo se paga el servicio de olya?": "Puedes pagar mediante tarjeta de crédito, débito u otros métodos de pago disponibles en nuestro sitio web.",
    "how is olya's service paid for?": "You can pay by credit card, debit card, or other payment methods available on our website.",
  
    "¿qué pasa si olvido responder a los mensajes de olya?": "Olya te enviará recordatorios amigables para asegurarse de que sigas en el camino correcto.",
    "what if I forget to respond to olya's messages?": "Olya will send you friendly reminders to ensure you stay on track.",
  
    "¿puedo pausar el programa si lo necesito?": "Sí, puedes pausar el programa y retomarlo cuando estés listo.",
    "can I pause the program if needed?": "Yes, you can pause the program and resume it when you're ready.",
  
    "¿hay alguna prueba gratuita disponible?": "Actualmente no ofrecemos una prueba gratuita, pero puedes contactar a nuestro servicio al cliente para más información.",
    "is there a free trial available?": "We currently do not offer a free trial, but you can contact our customer service for more information.",
  
    "¿olya puede ayudarme a identificar los desencadenantes de mi vapeo?": "Sí, el programa te ayudará a identificar y manejar tus desencadenantes personales.",
    "can olya help me identify my vaping triggers?": "Yes, the program will help you identify and manage your personal triggers.",
  
    "¿olya es compatible con todos los dispositivos móviles?": "Olya es compatible con cualquier dispositivo móvil que pueda usar WhatsApp.",
    "is olya compatible with all mobile devices?": "Olya is compatible with any mobile device that can use WhatsApp.",
  
    "¿puedo usar olya si también estoy tratando de dejar de fumar cigarrillos tradicionales?": "Sí, Olya puede ayudar con ambos, aunque el enfoque principal es dejar de vapear.",
    "can I use olya if I'm also trying to quit traditional cigarettes?": "Yes, Olya can help with both, although the primary focus is on quitting vaping.",
  
    "¿hay un límite de usuarios que pueden inscribirse al mismo tiempo?": "No, no hay límite de usuarios; cada persona recibe un programa personalizado.",
    "is there a limit to the number of users who can enroll at the same time?": "No, there is no limit to users; each person receives a personalized program.",
  
    "¿olya ofrece algún tipo de recompensa o incentivo por completar el programa?": "Olya no ofrece recompensas materiales, pero el mayor incentivo es tu propio bienestar.",
    "does olya offer any rewards or incentives for completing the program?": "Olya does not offer material rewards, but the greatest incentive is your own well-being.",
  
    "¿puedo dar retroalimentación sobre mi experiencia con olya?": "Sí, tu retroalimentación es valiosa y nos ayuda a mejorar el servicio.",
    "can I provide feedback on my experience with olya?": "Yes, your feedback is valuable and helps us improve the service.",
  
    "¿qué tipo de apoyo emocional ofrece olya?": "Olya proporciona mensajes de apoyo, motivación y técnicas para manejar el estrés y la ansiedad.",
    "what kind of emotional support does olya offer?": "Olya provides messages of support, motivation, and techniques for managing stress and anxiety.",
  
    "¿puedo interactuar con otros usuarios de olya?": "Actualmente, el servicio está diseñado para interacción uno a uno con Olya, pero estamos considerando opciones de comunidad para el futuro.",
    "can I interact with other olya users?": "Currently, the service is designed for one-on-one interaction with Olya, but we are considering community options for the future.",
  
    "¿qué sucede si tengo una emergencia de salud durante el programa?": "En caso de emergencia de salud, contacta a un profesional de la salud o a los servicios de emergencia locales de inmediato.",
    "what if I have a health emergency during the program?": "In case of a health emergency, contact a healthcare professional or local emergency services immediately."
  };
  
  // Lista de palabras clave para detectar dudas generales
  const generalDoubtKeywords = [
    'duda', 'dudas', 'pregunta', 'preguntas'
  ];
  
  // Sinónimos y variaciones de preguntas para mejorar la detección
  const synonyms = {
    "¿cuánto tiempo dura el programa?": [
      "cuanto dura el programa",
      "cuantos días dura el programa",
      "duración del programa",
      "tiempo del programa",
      "cuánto dura el programa"
    ],
    "¿cuál es el costo del servicio?": [
      "precio del servicio",
      "costo del programa",
      "cuanto cuesta el servicio",
      "cuánto es el precio",
      "cuánto cuesta el programa"
    ],
    "¿qué es olya y cómo funciona?": [
      "qué es olya",
      "cómo funciona olya",
      "qué hace olya",
      "explicación de olya",
      "qué es y cómo funciona olya"
    ]
    // Agregar más sinónimos según sea necesario
  };
  
  module.exports = { faqs, generalDoubtKeywords, synonyms };
  