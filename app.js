import { getKeys } from './state.js';
import { UI } from './ui.js';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const URL_GEMINI = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

// --- SEGURIDAD: Esperar a que las variables globales de languages.js estén listas ---
async function esperarDependencias() {
    return new Promise((resolve) => {
        const intervalo = setInterval(() => {
            if (typeof IDIOMAS_CONFIG !== 'undefined' && typeof ESTRUCTURA !== 'undefined') {
                clearInterval(intervalo);
                resolve();
            }
        }, 50);
    });
}

// --- MOTOR DE TRADUCCIÓN ---
async function llamarApiTraductor(texto, targetLang) {
    if (!texto) return "";
    const keys = getKeys();
    if (!keys || keys.length === 0) { UI.log("Error: No hay API Keys"); return ""; }
    
    try {
        const response = await fetch(`${URL_GEMINI}?key=${keys[0]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Traduce al idioma ISO ${targetLang}. SOLO la traducción: ${texto}` }] }] })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (e) {
        UI.log("Error: Fallo en API Gemini");
        return "";
    }
}

// --- LÓGICA PRINCIPAL ---
async function cargar() {
    await esperarDependencias(); // Asegura que languages.js haya cargado
    UI.log("Cargando datos...");
    try {
        const resp = await fetch(CSV_URL + '&t=' + Date.now());
        const text = await resp.text();
        const filas = text.split(/\r?\n/).filter(f => f.trim() !== "");
        datosLocales = [];
        filas.forEach((f, i) => {
            if (i === 0) return;
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const id = parseInt(c[0]);
            if (!isNaN(id)) {
                let itemPlato = { id: id, precio: c[1]||"0.00", activa: (c[2]||"").trim().toUpperCase() === "SI", es: superLimpiar(c[3]), carpeta: c[4]||"", imagen: c[5]||"", alergenos: superLimpiar(c[6]) };
                const keysLang = Object.keys(IDIOMAS_CONFIG); 
                for(let k = 1; k < keysLang.length; k++) { itemPlato[keysLang[k].toLowerCase()] = superLimpiar(c[6 + k]); }
                datosLocales.push(itemPlato);
            }
        });
        renderizar();
        generarMenuAgrupado();
        UI.log("Datos cargados correctamente");
    } catch (e) { 
        UI.log("Error: No se pudieron cargar los datos");
        console.error(e);
    }
}

async function ejecutarTraduccionAutomatica() {
    UI.setLoadingState('btn-autotraducir', true, 'TRADUCIENDO...');
    const nombreEn = document.getElementById('edit-en').value.trim();
    const uvasEn = document.getElementById('edit-en-uvas').value.trim();
    const esVino = (platoEditandoId >= 13000);
    const idiomas = Object.keys(IDIOMAS_CONFIG).filter(l => l !== 'ES' && l !== 'EN');

    await Promise.all(idiomas.map(async (lang) => {
        const m = lang.toLowerCase();
        if (nombreEn) { const r = await llamarApiTraductor(nombreEn, lang); if (r) document.getElementById(`edit-${m}`).value = r; }
        if (esVino && uvasEn) { const r = await llamarApiTraductor(uvasEn, lang); if (r) document.getElementById(`edit-${m}-uvas`).value = r; }
    }));
    UI.setLoadingState('btn-autotraducir', false, '✨ Traducir los otros 19 idiomas');
}

// --- EXPOSICIÓN GLOBAL (NECESARIO PARA ONCLICK EN HTML) ---
window.ejecutarTraduccionAutomatica = ejecutarTraduccionAutomatica;
window.abrirEditor = abrirEditor;
window.aplicarCambiosPlato = aplicarCambiosPlato;
window.enviarAlExcel = enviarAlExcel;
window.abrirSelector = abrirSelector;
window.cerrarModal = cerrarModal;
window.moverPlato = moverPlato;
window.prepararNuevoPlato = prepararNuevoPlato;
window.toggleActivo = toggleActivo;
window.comprobarRequisitosTraduccion = comprobarRequisitosTraduccion;

// Inicialización
document.addEventListener('DOMContentLoaded', cargar);
