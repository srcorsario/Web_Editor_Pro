=========================================
REPOSITORIO: Web_Editor_Pro (PRINCIPAL)
ARCHIVO: app.js
=========================================
// --- CONTROLADOR DE FLUJO PRINCIPAL Y FLUJO DE CREACIÓN ---

// Configuración de URLs de conexión de datos de Wine Sync
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz2wu6B0m-QWZLqDRXhWcONg0Lta3uhTDOXq1lly43p5XKC7uvReeT6HcfC8K0LTLusTA/exec';

// Lista oficial de Alérgenos y Dietas
const ALERGENOS_LISTA = ["GLUTEN", "SESAMO", "CACAHUETE", "SOJA", "FRUTOSCASCARA", "APIO", "HUEVO", "PESCADO", "MOSTAZA", "MOLUSCO", "SULFITOS", "LACTOSA", "ALTRAMUCES", "CRUSTACEO", "VEGANO", "VEGETARIANO"];

// Estado Global de Datos Locales
let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

// --- FUNCIONES UTILITARIAS Y LIMPIEZA DE CAMPOS ---
function superLimpiar(texto) {
    if (!texto) return "";
    let t = texto.toString().trim();
    if (t.startsWith('"') && t.endsWith('"')) t = t.substring(1, t.length - 1);
    t = t.replace(/""/g, '"');
    return t.trim();
}

function desglosarNombre(texto) {
    if (!texto) return { nombre: "", uvas: "" };
    const partes = texto.split('//');
    return {
        nombre: partes[0] ? partes[0].trim() : "",
        uvas: partes[1] ? partes[1].trim() : ""
    };
}

// Validar entrada del precio para forzar formato numérico correcto
window.validarPrecio = function(input) {
    input.value = input.value.replace(/[^0-9.]/g, '');
    if ((input.value.match(/\./g) || []).length > 1) {
        input.value = input.value.replace(/\.+$/, "");
    }
};

// --- SINCRONIZACIÓN Y CARGA DE DATOS (READ) ---
async function cargar() {
    try {
        const resp = await fetch(CSV_URL + '&t=' + Date.now());
        const text = await resp.text();
        const filas = text.split(/\r?\n/).filter(f => f.trim() !== "");
        datosLocales = [];

        // Mapeo dinámico e iteración del CSV respetando los 21 idiomas potenciales
        filas.forEach((f, i) => {
            if (i === 0) return; // Omitir cabecera del Excel
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            const id = parseInt(c[0]);
            if (!isNaN(id)) {
                // Estructura de mapeo dinámico basada en la configuración de IDIOMAS_CONFIG
                let item = {
                    id: id,
                    precio: c[1] || "0.00", 
                    activa: (c[2] || "").trim().toUpperCase() === "SI",
                    es: superLimpiar(c[3]),
                    carpeta: c[4] || "",
                    imagen: c[5] || "",
                    alergenos: superLimpiar(c[6])
                };

                // Inyectamos las columnas dinámicas para el resto de los idiomas del ecosistema (EN, DE, FR, IT...)
                const listaClasesIdiomas = Object.keys(IDIOMAS_CONFIG);
                listaClasesIdiomas.forEach((idioma, indiceIdioma) => {
                    if (idioma !== 'ES') {
                        // Las columnas de idioma empiezan desde la posición 7 en el CSV (Índice 7 = EN)
                        item[idioma.toLowerCase()] = superLimpiar(c[6 + indiceIdioma] || "");
                    }
                });

                datosLocales.push(item);
            }
        });

        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) {
            statusCarga.innerText = "✅ Datos Sincronizados";
            statusCarga.className = "status-ok";
        }
        renderizar();
        generarMenuAgrupado();
    } catch (e) { 
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) statusCarga.innerText = "❌ Error al cargar datos remotos"; 
    }
}

// --- RENDERING DILIGENTE DE LA INTERFAZ ---
function renderizar() {
    let htmlDinamico = "";
    datosLocales.sort((a, b) => a.id - b.id);

    ESTRUCTURA.forEach(cat => {
        const platos = datosLocales.filter(p => p.id >= cat.id && p.id <= (cat.id + cat.rango));
        if (platos.length === 0) return;

        htmlDinamico += `<div class="categoria-tarjeta"><div class="categoria-titulo">${cat.name}</div>`;
        platos.forEach((p) => {
            let htmlImagenPC = p.imagen ? `<span class="tag-imagen">📷 ${p.imagen}</span>` : "";
            let htmlCarpetaPC = p.carpeta ? `<span class="tag-carpeta">${p.carpeta}</span>` : "";
            const nombreLimpio = desglosarNombre(p.es).nombre;

            htmlDinamico += `
            <div class="plato-item">
                <div class="plato-orden-btns">
                    <button class="btn-nav" onclick="moverPlato(${p.id}, 'subir')">▲</button>
                    <button class="btn-nav" onclick="moverPlato(${p.id}, 'bajar')">▼</button>
                </div>
                <div class="plato-info">
                    <span class="plato-nombre">${nombreLimpio}</span>
                    <div style="font-size: 0.7rem; color: #7f8c8d; margin-top: 4px; display: flex; gap: 10px; align-items: center;">
                        ${htmlCarpetaPC} ${htmlImagenPC}
                    </div>
                </div>
                <div class="plato-meta-footer">
                    <div style="display: flex; align-items: center; gap: 5px; flex: 0 1 auto; white-space: nowrap;">
                        <small>ID ${p.id} | ${p.precio}€</small>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <button class="btn-config" onclick="abrirEditor(${p.id})">⚙️</button>
                        <label class="switch-container">
                            <input type="checkbox" ${p.activa ? 'checked' : ''} onchange="toggleActivo(${p.id}, this.checked)">
                            <span class="slider-switch"></span>
                        </label>
                    </div>
                </div>
            </div>`;
        });
        htmlDinamico += `</div>`;
    });
    document.getElementById('editor-dinamico').innerHTML = htmlDinamico;
}

// --- REORGANIZACIÓN / REORDENACIÓN ---
function moverPlato(id, direccion) {
    const idx = datosLocales.findIndex(x => x.id === id);
    if (direccion === 'subir' && idx > 0) {
        const temp = datosLocales[idx].id;
        datosLocales[idx].id = datosLocales[idx-1].id;
        datosLocales[idx-1].id = temp;
    } else if (direccion === 'bajar' && idx < datosLocales.length - 1) {
        const temp = datosLocales[idx].id;
        datosLocales[idx].id = datosLocales[idx+1].id;
        datosLocales[idx+1].id = temp;
    }
    renderizar();
}

// --- APERTURA Y EDICIÓN (MODALES) ---
function abrirEditor(id, esNuevo = false) {
    let p = esNuevo ? datosTempNuevo : datosLocales.find(x => x.id === id);
    esNuevoPlato = esNuevo;
    platoEditandoId = id;

    const esVino = (id >= 13000);
    document.getElementById('label-uvas').innerText = esVino ? "Nombres y Detalles del Vino (Uvas / D.O.)" : "Nombres y Detalles del Plato";

    // Cargar datos de ES y EN obligatorios nativos de la interfaz principal
    const dataES = desglosarNombre(p.es || "");
    document.getElementById('edit-es').value = dataES.nombre;
    const inputUvaES = document.getElementById('edit-es-uvas');
    inputUvaES.value = dataES.uvas;
    inputUvaES.style.display = esVino ? "block" : "none";

    const dataEN = desglosarNombre(p.en || "");
    document.getElementById('edit-en').value = dataEN.nombre;
    const inputUvaEN = document.getElementById('edit-en-uvas');
    inputUvaEN.value = dataEN.uvas;
    inputUvaEN.style.display = esVino ? "block" : "none";

    // Renderizar y rellenar dinámicamente los 19 idiomas restantes en el contenedor scrollable
    let htmlRestoLangs = "";
    Object.keys(IDIOMAS_CONFIG).forEach(l => {
        if (l !== 'ES' && l !== 'EN') {
            const lowL = l.toLowerCase();
            const dataLang = desglosarNombre(p[lowL] || "");
            htmlRestoLangs += `
            <div class="input-row-lang">
                <div class="lang-tag">${l}</div>
                <div style="flex:1">
                    <input id="edit-${lowL}" class="input-estandar" placeholder="Nombre en ${IDIOMAS_CONFIG[l]}" value="${dataLang.nombre}">
                    <input id="edit-${lowL}-uvas" class="input-estandar input-uvas" placeholder="Detalles (${IDIOMAS_CONFIG[l]})" value="${dataLang.uvas}" style="display: ${esVino ? 'block' : 'none'};">
                </div>
            </div>`;
        }
    });
    document.getElementById('contenedor-resto-idiomas').innerHTML = htmlRestoLangs;

    document.getElementById('edit-precio').value = p.precio;
    document.getElementById('edit-imagen').value = p.imagen;

    // Control de alérgenos seleccionados
    const actuales = (p.alergenos || "").split(',').map(s => s.trim().toUpperCase());
    document.getElementById('alergenos-grid').innerHTML = ALERGENOS_LISTA.map(a => {
        const sel = actuales.includes(a) ? 'selected' : '';
        return `<div class="alergeno-btn ${sel}" onclick="this.classList.toggle('selected')">${a}</div>`;
    }).join('');

    comprobarRequisitosTraduccion();
    document.getElementById('modal-editor').style.display = 'block';
}

// --- CREACIÓN DE PLATOS NUEVOS (FLUJO INTERESANTE HEREDADO) ---
function generarMenuAgrupado() {
    let h = "";
    ESTRUCTURA.forEach(cat => {
        h += `<div style="margin-bottom:10px;"><div style="background:#eee; padding:5px; font-size:0.7rem; font-weight:bold; border-radius:4px;">${cat.name}</div>`;
        if (cat.sub) {
            cat.sub.forEach(s => {
                h += `<button onclick="prepararNuevoPlato(${s.id}, '${s.folder}')" style="width:100%; text-align:left; padding:10px; background:white; border:1px solid #ddd; border-radius:6px; margin-top:2px; cursor:pointer;">+ ${s.name}</button>`;
            });
        } else {
            h += `<button onclick="prepararNuevoPlato(${cat.id}, '${cat.folder || ''}')" style="width:100%; text-align:left; padding:10px; background:white; border:1px solid #ddd; border-radius:6px; margin-top:2px; cursor:pointer;">+ ${cat.name}</button>`;
        }
        h += `</div>`;
    });
    document.getElementById('lista-agrupada').innerHTML = h;
}

function prepararNuevoPlato(baseId, folder) {
    let maxPermitido = baseId + 99;
    ESTRUCTURA.forEach(cat => {
        if (cat.sub) {
            const sub = cat.sub.find(s => s.id === baseId);
            if (sub && sub.max) maxPermitido = sub.max;
        }
    });

    const similares = datosLocales.filter(p => p.id >= baseId && p.id <= maxPermitido);
    const nuevoId = similares.length > 0 ? Math.max(...similares.map(p => p.id)) + 1 : baseId;
    
    if (nuevoId > maxPermitido) {
        alert("Límite de IDs alcanzado para esta subcategoría.");
        return;
    }

    // Inicialización completa del objeto con soporte para los 21 idiomas vacíos
    datosTempNuevo = { 
        id: nuevoId, 
        precio: "0.00", 
        activa: true, 
        es: "NUEVO PLATO", 
        carpeta: folder, 
        imagen: "", 
        alergenos: "" 
    };

    Object.keys(IDIOMAS_CONFIG).forEach(l => {
        if (l !== 'ES') datosTempNuevo[l.toLowerCase()] = "";
    });

    cerrarModal('modal-selector');
    abrirEditor(nuevoId, true);
}

// --- GUARDADO Y PROCESAMIENTO DE CAMBIOS ---
function aplicarCambiosPlato() {
    let p = esNuevoPlato ? datosTempNuevo : datosLocales.find(x => x.id === platoEditandoId);
    
    // Si el flujo dicta que es un plato nuevo válido, lo empujamos al stack global
    if (esNuevoPlato) {
        datosLocales.push(p);
    }

    // Procesar y empaquetar los 21 idiomas dinámicamente
    Object.keys(IDIOMAS_CONFIG).forEach(l => {
        const lowL = l.toLowerCase();
        const inputNom = document.getElementById(`edit-${lowL}`);
        if (inputNom) {
            const nom = superLimpiar(inputNom.value);
            const inputUva = document.getElementById(`edit-${lowL}-uvas`);
            const uvas = (inputUva && inputUva.style.display !== "none") ? superLimpiar(inputUva.value) : "";
            p[lowL] = uvas ? `${nom} // ${uvas}` : nom;
        }
    });

    p.precio = parseFloat(document.getElementById('edit-precio').value || 0).toFixed(2);
    p.imagen = superLimpiar(document.getElementById('edit-imagen').value);
    p.alergenos = Array.from(document.querySelectorAll('.alergeno-btn.selected')).map(el => el.innerText).join(', ');
    
    cerrarModal('modal-editor');
    renderizar();
}

// --- AUTOMATIZACIONES (TRADUCTOR MÁGICO DE 21 IDIOMAS) ---
function comprobarRequisitosTraduccion() {
    const esValido = document.getElementById('edit-es').value.trim().length > 0 && 
                     document.getElementById('edit-en').value.trim().length > 0;
    document.getElementById('btn-autotraducir').disabled = !esValido;
}

async function ejecutarTraduccionAutomatica() {
    // Implementación requerida por el botón autotraducir de la UI principal si se desea expandir en el futuro
    console.log("Traducción automática disparada para los 19 idiomas adicionales.");
}

// --- ACCIONES REMOTAS DE PERSISTENCIA (WRITE) ---
async function enviarAlExcel() {
    const btn = document.querySelector('.btn-guardar-main');
    const textoOriginal = btn.innerText;
    btn.innerText = "⏳ SUBIENDO Y REORDENANDO..."; 
    btn.disabled = true;
    
    datosLocales.sort((a, b) => a.id - b.id);
    
    // Estructura adaptada para enviar el payload exacto esperado por Google Apps Script
    const payload = datosLocales.map(p => {
        let fila = {
            id: p.id,
            precio: p.precio,
            estado: p.activa ? 'si' : 'no',
            nombre_es: p.es,
            carpeta: p.carpeta,
            imagen: p.imagen,
            alergenos: p.alergenos,
            nombre_en: p.en,
            nombre_de: p.de,
            nombre_fr: p.fr,
            nombre_it: p.it
        };

        // Adjuntar el resto de idiomas de la suite si existen en el objeto local
        Object.keys(IDIOMAS_CONFIG).forEach(l => {
            const lowL = l.toLowerCase();
            if (!['es', 'en', 'de', 'fr', 'it'].includes(lowL)) {
                fila[`nombre_${lowL}`] = p[lowL] || "";
            }
        });
        return fila;
    });

    try {
        await fetch(WEB_APP_URL, { 
            method: 'POST', 
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        });
        alert("✅ Reordenación y adiciones guardadas con éxito en Google Sheets.");
        location.reload();
    } catch (e) { 
        alert("❌ Error crítico de comunicación al guardar"); 
        btn.disabled = false; 
        btn.innerText = textoOriginal; 
    }
}

// --- MANEJO DE MODALES E INTERRUPTORES DE ESTADO ---
function toggleActivo(id, v) { 
    const item = datosLocales.find(x => x.id === id);
    if (item) item.activa = v; 
}

window.abrirSelector = function() { 
    document.getElementById('modal-selector').style.display = 'block'; 
};

window.cerrarModal = function(id) { 
    document.getElementById(id).style.display = 'none'; 
};

// Iniciar aplicación al cargar el documento de manera asíncrona
document.addEventListener("DOMContentLoaded", () => {
    cargar();
});
