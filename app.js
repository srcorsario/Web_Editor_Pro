import { getKeys } from './state.js';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz2wu6B0m-QWZLqDRXhWcONg0Lta3uhTDOXq1lly43p5XKC7uvReeT6HcfC8K0LTLusTA/exec';
const URL_GEMINI = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

const ALERGENOS_LISTA = ["GLUTEN", "SESAMO", "CACAHUETE", "SOJA", "FRUTOSCASCARA", "APIO", "HUEVO", "PESCADO", "MOSTAZA", "MOLUSCO", "SULFITOS", "LACTOSA", "ALTRAMUCES", "CRUSTACEO", "VEGANO", "VEGETARIANO"];

// --- MOTOR DE TRADUCCIÓN GEMINI (INTEGRADO) ---
async function llamarApiTraductor(texto, targetLang) {
    if (!texto) return "";
    const keys = getKeys();
    if (keys.length === 0) { console.error("No hay API Keys"); return ""; }
    const key = keys[0]; 

    try {
        const response = await fetch(`${URL_GEMINI}?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Traduce al idioma ISO ${targetLang}. SOLO la traducción: ${texto}` }] }]
            })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    } catch (e) {
        console.error("Error Gemini:", e);
        return "";
    }
}

// --- FUNCIONES ORIGINALES ---
function construirCamposDeIdiomasDinamicos() {
    const contenedor = document.getElementById('contenedor-resto-idiomas');
    if(!contenedor) return;
    let html = "";
    Object.keys(IDIOMAS_CONFIG).forEach(lang => {
        if (lang === 'ES' || lang === 'EN') return;
        const minusc = lang.toLowerCase();
        html += `<div class="input-row-lang"><div class="lang-tag">${IDIOMAS_CONFIG[lang].split(' ')[0]} ${lang}</div><div style="flex:1"><input id="edit-${minusc}" class="input-estandar" placeholder="Traducción..."><input id="edit-${minusc}-uvas" class="input-estandar input-uvas" placeholder="Detalles / Uvas..."></div></div>`;
    });
    contenedor.innerHTML = html;
}

function superLimpiar(texto) {
    if (!texto) return "";
    let t = texto.toString().trim();
    if (t.startsWith('"') && t.endsWith('"')) t = t.substring(1, t.length - 1);
    return t.replace(/""/g, '"').trim();
}

function desglosarNombre(texto) {
    if (!texto) return { nombre: "", uvas: "" };
    const partes = texto.split('//');
    return { nombre: partes[0]?.trim() || "", uvas: partes[1]?.trim() || "" };
}

async function cargar() {
    try {
        construirCamposDeIdiomasDinamicos();
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
    } catch (e) { console.error(e); }
}

function renderizar() {
    let h = "";
    datosLocales.sort((a,b)=>a.id-b.id);
    ESTRUCTURA.forEach(cat => {
        const platos = datosLocales.filter(p => p.id >= cat.id && p.id <= (cat.id + cat.rango));
        if (platos.length === 0) return;
        h += `<div class="categoria-tarjeta"><div class="categoria-titulo">${cat.name}</div>`;
        platos.forEach((p) => {
            h += `<div class="plato-item"><div class="plato-info"><span class="plato-nombre">${desglosarNombre(p.es).nombre}</span></div><div class="plato-meta-footer"><button class="btn-config" onclick="abrirEditor(${p.id})">⚙️</button></div></div>`;
        });
        h += `</div>`;
    });
    document.getElementById('editor-dinamico').innerHTML = h;
}

async function ejecutarTraduccionAutomatica() {
    const btn = document.getElementById('btn-autotraducir');
    btn.disabled = true; btn.innerText = "⏳ TRADUCIENDO CON GEMINI...";
    const nombreEn = document.getElementById('edit-en').value.trim();
    const uvasEn = document.getElementById('edit-en-uvas').value.trim();
    const esVino = (platoEditandoId >= 13000);
    const idiomas = Object.keys(IDIOMAS_CONFIG).filter(l => l !== 'ES' && l !== 'EN');

    await Promise.all(idiomas.map(async (lang) => {
        const m = lang.toLowerCase();
        if (nombreEn) { const r = await llamarApiTraductor(nombreEn, lang); if (r) document.getElementById(`edit-${m}`).value = r; }
        if (esVino && uvasEn) { const r = await llamarApiTraductor(uvasEn, lang); if (r) document.getElementById(`edit-${m}-uvas`).value = r; }
    }));
    btn.disabled = false; btn.innerText = "✅ ¡Procesado!";
}

function abrirEditor(id, esNuevo = false) {
    let p = esNuevo ? datosTempNuevo : datosLocales.find(x => x.id === id);
    esNuevoPlato = esNuevo; platoEditandoId = id;
    Object.keys(IDIOMAS_CONFIG).forEach(l => {
        const m = l.toLowerCase();
        const d = desglosarNombre(p[m] || "");
        document.getElementById(`edit-${m}`).value = d.nombre;
        const iu = document.getElementById(`edit-${m}-uvas`);
        if(iu) { iu.value = d.uvas; iu.style.display = (id >= 13000) ? "block" : "none"; }
    });
    document.getElementById('edit-precio').value = p.precio;
    document.getElementById('modal-editor').style.display = 'block';
}

// Exportamos lo necesario para que el HTML lo vea
window.ejecutarTraduccionAutomatica = ejecutarTraduccionAutomatica;
window.abrirEditor = abrirEditor;
document.addEventListener('DOMContentLoaded', cargar);
