// --- state.js ---

// Aquí colocas tus llaves reales de Gemini. 
// Como solo viven en tu máquina, son seguras mientras no subas este archivo a un repo público.
const API_KEYS = [
    "TU_PRIMERA_API_KEY_AQUI",
    "TU_SEGUNDA_API_KEY_AQUI" 
];

// Función que permite a app.js leer tus llaves
function getKeys() {
    return API_KEYS;
}

// Exportación necesaria para el sistema de módulos
export { getKeys };
