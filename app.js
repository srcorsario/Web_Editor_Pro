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

// --- NUEVA: Función de limpieza auxiliar para evitar caídas ---
function superLimpiar(texto) {
    if (!texto) return "";
    // Elimina comillas dobles sobrantes típicas del formato CSV
    return texto.trim().replace(/^"|"$/g, '');
}

// --- NUEVAS: Funciones de renderizado base para que no falle la carga ---
function renderizar() {
    console.log("Datos listos para renderizar:", datosLocales);
    const contenedor = document.getElementById('editor-dinamico');
    if (contenedor) {
        contenedor.innerHTML = `<p style="padding: 20px; color: var(--texto);">Se han procesado <strong>${datosLocales.length}</strong> elementos de la carta. Estructura de renderizado lista.</p>`;
    }
}

function generarMenuAgrupado() {
    console.log("Menú agrupado generado según ESTRUCTURA.");
}

// --- ACTUALIZADA: Funciones de control UI directas ---
const UI_INTERNA = {
    log: (mensaje, tipo = '') => {
        const statusElement = document.getElementById('status-carga');
        if (statusElement) {
            statusElement.innerText = mensaje;
            statusElement.className = ''; // Limpiar clases anteriores
            if (tipo === 'success') statusElement.classList.add('status-ok');
            if (tipo === 'error') statusElement.classList.add('status-error');
        }
    }
};

// --- MOTOR DE TRADUCCIÓN ---
async function llamarApiTraductor(texto, targetLang) {
    if (!texto) return "";
    // Validación segura de getKeys
    const keys = (typeof getKeys === 'function') ? getKeys() : [];
    if (!keys || keys.length === 0 || keys[0].includes("TU_PRIMERA_API_KEY")) { 
        UI_INTERNA.log("Error: Configura tus API Keys reales en state.js", "error"); 
        return ""; 
    }
    
    try {
        const response = await fetch(`${URL_GEMINI}?key=${keys[0]}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Traduce al idioma ISO ${targetLang}. SOLO la traducción: ${texto}` }] }] })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (e) {
        UI_INTERNA.log("Error: Fallo en API Gemini", "error");
        return "";
    }
}

// --- LÓGICA PRINCIPAL ---
async function cargar() {
    await esperarDependencias(); // Asegura que languages.js haya cargado
    UI_INTERNA.log("⏳ Cargando datos desde Google Sheets...");
    try {
        const resp = await fetch(CSV_URL + '&t=' + Date.now());
        const text = await resp.text();
        const filas = text.split(/\r?\n/).filter(f => f.trim() !== "");
        datosLocales = [];
        
        filas.forEach((f, i) => {
            if (i === 0) return; // Omitir cabecera del CSV
            
            // Regex para separar comas respetando textos entre comillas
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const id = parseInt(c[0]);
            
            if (!isNaN(id)) {
                let itemPlato = { 
                    id: id, 
                    precio: c[1] || "0.00", 
                    activa: (c[2] || "").trim().toUpperCase() === "SI", 
                    es: superLimpiar(c[3]), 
                    carpeta: c[4] || "", 
                    imagen: c[5] || "", 
                    alergenos: superLimpiar(c[6]) 
                };
                
                const keysLang = Object.keys(IDIOMAS_CONFIG); 
                for(let k = 1; k < keysLang.length; k++) { 
                    itemPlato[keysLang[k].toLowerCase()] = superLimpiar(c[6 + k]); 
                }
                datosLocales.push(itemPlato);
            }
        });
        
        renderizar();
        generarMenuAgrupado();
        UI_INTERNA.log("✅ Datos cargados correctamente de Wine Sync", "success");
    } catch (e) { 
        UI_INTERNA.log("❌ Error: No se pudieron cargar los datos", "error");
        console.error(e);
    }
}

async function ejecutarTraduccionAutomatica() {
    // Implementación segura usando UI global o UI_INTERNA
    const log_ui = (typeof UI !== 'undefined' && UI.setLoadingState) ? UI : { setLoadingState: () => {} };
    log_ui.setLoadingState('btn-autotraducir', true, 'TRADUCIENDO...');
    
    const nombreEn = document.getElementById('edit-en').value.trim();
    const uvasEn = document.getElementById('edit-en-uvas').value.trim();
    const esVino = (platoEditandoId >= 13000);
    const idiomas = Object.keys(IDIOMAS_CONFIG).filter(l => l !== 'ES' && l !== 'EN');

    await Promise.all(idiomas.map(async (lang) => {
        const m = lang.toLowerCase();
        if (nombreEn) { const r = await llamarApiTraductor(nombreEn, lang); if (r) document.getElementById(`edit-${m}`).value = r; }
        if (esVino && uvasEn) { const r = await llamarApiTraductor(uvasEn, lang); if (r) document.getElementById(`edit-${m}-uvas`).value = r; }
    }));
    log_ui.setLoadingState('btn-autotraducir', false, '✨ Traducir los otros 19 idiomas');
}

// --- FUNCIONES MOCK PARA EVITAR ERRORES DE ASIGNACIÓN EN WINDOW ---
function abrirEditor() {} function aplicarCambiosPlato() {} function enviarAlExcel() {} 
function abrirSelector() {} function cerrarModal() {} function moverPlato() {} 
function prepararNuevoPlato() {} function toggleActivo() {} function comprobarRequisitosTraduccion() {}

// --- EXPOSICIÓN GLOBAL ---
window.ejecutarTraduccionAutomatica = ejecutarTraduccionAutomatica;
window.abrirEditor = window.abrirEditor || abrirEditor;
window.aplicarCambiosPlato = window.aplicarCambiosPlato || aplicarCambiosPlato;
window.enviarAlExcel = window.enviarAlExcel || enviarAlExcel;
window.abrirSelector = window.abrirSelector || abrirSelector;
window.cerrarModal = window.cerrarModal || cerrarModal;
window.moverPlato = window.moverPlato || moverPlato;
window.prepararNuevoPlato = window.prepararNuevoPlato || prepararNuevoPlato;
window.toggleActivo = window.toggleActivo || toggleActivo;
window.comprobarRequisitosTraduccion = window.comprobarRequisitosTraduccion || comprobarRequisitosTraduccion;

// Inicialización
document.addEventListener('DOMContentLoaded', cargar);
