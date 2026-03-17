const crypto = require("crypto");
const uuid = () => crypto.randomUUID();

// Group UUIDs (shared between question label + input field)
const g = {
  title: uuid(), nombre: uuid(), tel: uuid(), email: uuid(),
  puesto: uuid(), exp: uuid(), inmediata: uuid(), permiso: uuid(),
  menu: uuid(), afluencia: uuid(), intensos: uuid(),
  volumen: uuid(), tareas: uuid(), menuCarta: uuid(),
  habitaciones: uuid(), ritmos: uuid(), estandares: uuid(),
  equipo: uuid(), cv: uuid(),
  cond1: uuid(), cond2: uuid(), cond3: uuid()
};

const puestoOpts = { sala: uuid(), cocina: uuid(), piso: uuid() };

function yesNo(groupUuid, questionHtml) {
  return [
    { uuid: uuid(), type: "QUESTION", groupUuid, groupType: "QUESTION", payload: { html: "<p>" + questionHtml + "</p>", isRequired: true } },
    { uuid: uuid(), type: "MULTIPLE_CHOICE", groupUuid, groupType: "MULTIPLE_CHOICE", payload: { isRequired: true } },
    { uuid: uuid(), type: "MULTIPLE_CHOICE_OPTION", groupUuid, groupType: "MULTIPLE_CHOICE_OPTION", payload: { html: "<p>S\u00ed</p>", index: 0, isFirst: true, isLast: false } },
    { uuid: uuid(), type: "MULTIPLE_CHOICE_OPTION", groupUuid, groupType: "MULTIPLE_CHOICE_OPTION", payload: { html: "<p>No</p>", index: 1, isFirst: false, isLast: true } },
  ];
}

const blocks = [
  // FORM TITLE
  { uuid: uuid(), type: "FORM_TITLE", groupUuid: g.title, groupType: "FORM_TITLE", payload: { html: "<h1>Formulario de Candidatura</h1>" } },

  // INTRO TEXT
  { uuid: uuid(), type: "TEXT", groupUuid: uuid(), groupType: "TEXT", payload: { html: "<p>\u00a1Hola! Gracias por tu inter\u00e9s en trabajar con nosotros.</p><p>Somos un <strong>restaurante familiar de comida casera asturiana y mediterr\u00e1nea</strong>, con m\u00e1s de 50 a\u00f1os de trayectoria. Un negocio de gran volumen y alta rotaci\u00f3n de clientes, con servicio \u00e1gil y exigente.</p><p>Este formulario es muy r\u00e1pido <strong>(2-3 minutos)</strong> y nos ayuda a conocerte mejor. \u00a1Mucha suerte!</p>" } },

  // NOMBRE
  { uuid: uuid(), type: "QUESTION", groupUuid: g.nombre, groupType: "QUESTION", payload: { html: "<p>Nombre completo</p>", isRequired: true } },
  { uuid: uuid(), type: "INPUT_TEXT", groupUuid: g.nombre, groupType: "INPUT_TEXT", payload: { isRequired: true, placeholder: "Tu nombre y apellidos" } },

  // TELEFONO
  { uuid: uuid(), type: "QUESTION", groupUuid: g.tel, groupType: "QUESTION", payload: { html: "<p>Tel\u00e9fono</p>", isRequired: true } },
  { uuid: uuid(), type: "INPUT_PHONE_NUMBER", groupUuid: g.tel, groupType: "INPUT_PHONE_NUMBER", payload: { isRequired: true } },

  // EMAIL
  { uuid: uuid(), type: "QUESTION", groupUuid: g.email, groupType: "QUESTION", payload: { html: "<p>Email <em>(opcional)</em></p>", isRequired: false } },
  { uuid: uuid(), type: "INPUT_EMAIL", groupUuid: g.email, groupType: "INPUT_EMAIL", payload: { isRequired: false, placeholder: "tu@email.com" } },

  // PUESTO
  { uuid: uuid(), type: "QUESTION", groupUuid: g.puesto, groupType: "QUESTION", payload: { html: "<p>\u00bfA qu\u00e9 puesto te presentas?</p>", isRequired: true } },
  { uuid: uuid(), type: "MULTIPLE_CHOICE", groupUuid: g.puesto, groupType: "MULTIPLE_CHOICE", payload: { isRequired: true } },
  { uuid: puestoOpts.sala, type: "MULTIPLE_CHOICE_OPTION", groupUuid: g.puesto, groupType: "MULTIPLE_CHOICE_OPTION", payload: { html: "<p>Camarero/a de Sala</p>", index: 0, isFirst: true, isLast: false } },
  { uuid: puestoOpts.cocina, type: "MULTIPLE_CHOICE_OPTION", groupUuid: g.puesto, groupType: "MULTIPLE_CHOICE_OPTION", payload: { html: "<p>Ayudante de Cocina</p>", index: 1, isFirst: false, isLast: false } },
  { uuid: puestoOpts.piso, type: "MULTIPLE_CHOICE_OPTION", groupUuid: g.puesto, groupType: "MULTIPLE_CHOICE_OPTION", payload: { html: "<p>Camarero/a de Piso / Limpiador/a</p>", index: 2, isFirst: false, isLast: true } },

  // EXPERIENCIA
  { uuid: uuid(), type: "QUESTION", groupUuid: g.exp, groupType: "QUESTION", payload: { html: "<p>\u00bfCu\u00e1ntos a\u00f1os de experiencia tienes en hosteler\u00eda?</p>", isRequired: true } },
  { uuid: uuid(), type: "INPUT_NUMBER", groupUuid: g.exp, groupType: "INPUT_NUMBER", payload: { isRequired: true, placeholder: "Ej: 2" } },

  // INCORPORACION INMEDIATA
  ...yesNo(g.inmediata, "\u00bfPodr\u00edas incorporarte de forma inmediata?"),

  // PERMISO TRABAJO
  ...yesNo(g.permiso, "\u00bfTienes permiso de trabajo en Espa\u00f1a?"),

  // === SALA ===
  ...yesNo(g.menu, "\u00bfHas trabajado con men\u00fa del d\u00eda, carta o tapeo?"),
  ...yesNo(g.afluencia, "\u00bfHas trabajado en restaurantes con gran afluencia o ritmo alto?"),
  ...yesNo(g.intensos, "\u00bfTe manejas bien en servicios intensos de sala y coordinaci\u00f3n con cocina?"),

  // === COCINA ===
  ...yesNo(g.volumen, "\u00bfHas trabajado en cocinas con mucho volumen de servicio?"),

  { uuid: uuid(), type: "QUESTION", groupUuid: g.tareas, groupType: "QUESTION", payload: { html: "<p>Marca las tareas con las que tienes experiencia real:</p>", isRequired: true } },
  { uuid: uuid(), type: "CHECKBOXES", groupUuid: g.tareas, groupType: "CHECKBOXES", payload: { isRequired: true } },
  { uuid: uuid(), type: "CHECKBOX", groupUuid: g.tareas, groupType: "CHECKBOX", payload: { html: "<p>Freidoras</p>", index: 0, isFirst: true, isLast: false } },
  { uuid: uuid(), type: "CHECKBOX", groupUuid: g.tareas, groupType: "CHECKBOX", payload: { html: "<p>Limpieza de pescado</p>", index: 1, isFirst: false, isLast: false } },
  { uuid: uuid(), type: "CHECKBOX", groupUuid: g.tareas, groupType: "CHECKBOX", payload: { html: "<p>Corte y limpieza de alimentos</p>", index: 2, isFirst: false, isLast: false } },
  { uuid: uuid(), type: "CHECKBOX", groupUuid: g.tareas, groupType: "CHECKBOX", payload: { html: "<p>Emplatado</p>", index: 3, isFirst: false, isLast: false } },
  { uuid: uuid(), type: "CHECKBOX", groupUuid: g.tareas, groupType: "CHECKBOX", payload: { html: "<p>Mise en place</p>", index: 4, isFirst: false, isLast: false } },
  { uuid: uuid(), type: "CHECKBOX", groupUuid: g.tareas, groupType: "CHECKBOX", payload: { html: "<p>Fregaplatos</p>", index: 5, isFirst: false, isLast: false } },
  { uuid: uuid(), type: "CHECKBOX", groupUuid: g.tareas, groupType: "CHECKBOX", payload: { html: "<p>Limpieza de cocina y utensilios</p>", index: 6, isFirst: false, isLast: true } },

  ...yesNo(g.menuCarta, "\u00bfHas trabajado con servicio de men\u00fa y tambi\u00e9n de carta?"),

  // === PISO ===
  ...yesNo(g.habitaciones, "\u00bfHas limpiado habitaciones completas y zonas comunes?"),
  ...yesNo(g.ritmos, "\u00bfTe manejas bien con ritmos altos de entradas, salidas y picos de trabajo?"),
  ...yesNo(g.estandares, "\u00bfEst\u00e1s acostumbrad@ a trabajar con est\u00e1ndares de limpieza, orden e higiene?"),

  // === CONDITIONAL LOGIC ===
  { uuid: uuid(), type: "CONDITIONAL_LOGIC", groupUuid: g.cond1, groupType: "CONDITIONAL_LOGIC", payload: {
    logicalOperator: "AND",
    conditionals: [{ uuid: uuid(), type: "SINGLE", payload: { field: { uuid: g.puesto, type: "MULTIPLE_CHOICE" }, comparison: "IS", value: puestoOpts.sala } }],
    actions: [{ uuid: uuid(), type: "SHOW_BLOCKS", payload: { showBlocks: [g.menu, g.afluencia, g.intensos] } }]
  }},
  { uuid: uuid(), type: "CONDITIONAL_LOGIC", groupUuid: g.cond2, groupType: "CONDITIONAL_LOGIC", payload: {
    logicalOperator: "AND",
    conditionals: [{ uuid: uuid(), type: "SINGLE", payload: { field: { uuid: g.puesto, type: "MULTIPLE_CHOICE" }, comparison: "IS", value: puestoOpts.cocina } }],
    actions: [{ uuid: uuid(), type: "SHOW_BLOCKS", payload: { showBlocks: [g.volumen, g.tareas, g.menuCarta] } }]
  }},
  { uuid: uuid(), type: "CONDITIONAL_LOGIC", groupUuid: g.cond3, groupType: "CONDITIONAL_LOGIC", payload: {
    logicalOperator: "AND",
    conditionals: [{ uuid: uuid(), type: "SINGLE", payload: { field: { uuid: g.puesto, type: "MULTIPLE_CHOICE" }, comparison: "IS", value: puestoOpts.piso } }],
    actions: [{ uuid: uuid(), type: "SHOW_BLOCKS", payload: { showBlocks: [g.habitaciones, g.ritmos, g.estandares] } }]
  }},

  // === FINAL ===
  { uuid: uuid(), type: "QUESTION", groupUuid: g.equipo, groupType: "QUESTION", payload: { html: "<p>En una frase, \u00bfc\u00f3mo te definir\u00edas trabajando en equipo?</p>", isRequired: true } },
  { uuid: uuid(), type: "INPUT_TEXT", groupUuid: g.equipo, groupType: "INPUT_TEXT", payload: { isRequired: true, placeholder: "Ej: Soy responsable, puntual y me adapto r\u00e1pido" } },

  { uuid: uuid(), type: "QUESTION", groupUuid: g.cv, groupType: "QUESTION", payload: { html: "<p>Sube tu CV <em>(foto, PDF, documento... lo que tengas. Es opcional pero nos ayuda!)</em></p>", isRequired: false } },
  { uuid: uuid(), type: "FILE_UPLOAD", groupUuid: g.cv, groupType: "FILE_UPLOAD", payload: { isRequired: false, hasMultipleFiles: true } },
];

const body = {
  status: "PUBLISHED",
  blocks,
  settings: { language: "es" }
};

const API_KEY = process.argv[2];
if (!API_KEY) { console.error("Usage: node create-tally-form.js <API_KEY>"); process.exit(1); }

fetch("https://api.tally.so/forms", {
  method: "POST",
  headers: { "Authorization": "Bearer " + API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify(body)
})
.then(r => r.json().then(data => ({ status: r.status, data })))
.then(({ status, data }) => {
  if (status === 201) {
    console.log("FORMULARIO CREADO!");
    console.log("ID:", data.id);
    console.log("URL: https://tally.so/r/" + data.id);
    console.log("Editar: https://tally.so/forms/" + data.id + "/edit");
  } else {
    console.error("Error:", status);
    console.error(JSON.stringify(data, null, 2));
  }
})
.catch(err => console.error("Error:", err.message));
