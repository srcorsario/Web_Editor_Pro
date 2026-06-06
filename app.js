import { getKeys } from './state.js';
import { UI } from './ui.js';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const URL_GEMINI = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

let datosLocales = [];
let platoEditandoId = null;

async function llamarApiTraductor(texto, targetLang) {
    if (!texto) return "";
    const keys = getKeys();
    if (keys.length === 0) { UI.log("Error: No hay API Keys"); return ""; }
    
    try {
        const response = await fetch(`${URL_GEMINI}?key=${keys[0]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Traduce al idioma ISO ${targetLang}. SOLO la traducción: ${texto}` }] }] })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (e) {
        UI.log("Error en traducción");
        return "";
    }
}

async function cargar() {
    UI.log("Cargando datos...");
    try {
        const resp = await fetch(CSV_URL + '&t=' + Date.now());
        const text = await resp.text();
        // ... (Tu lógica de procesamiento de CSV)
        UI.log("Datos cargados correctamente");
        renderizar();
    } catch (e) { UI.log("Error de carga"); }
}

async function ejecutarTraduccionAutomatica() {
    UI.setLoadingState('btn-autotraducir', true, 'TRADUCIENDO...');
    // ... (Tu lógica de traducción)
    UI.setLoadingState('btn-autotraducir', false, '✨ Traducir los otros 19 idiomas');
}

// Exponer funciones al entorno global
window.ejecutarTraduccionAutomatica = ejecutarTraduccionAutomatica;
window.abrirEditor = abrirEditor;
// ... (resto de tus funciones necesarias)

document.addEventListener('DOMContentLoaded', cargar);
