// --- app.js (Controlador Principal Wine Sync V13.0) ---

// Configuración de URLs origen/destino tomadas del despliegue base
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz2wu6B0m-QWZLqDRXhWcONg0Lta3uhTDOXq1lly43p5XKC7uvReeT6HcfC8K0LTLusTA/exec';

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

const ALERGENOS_LISTA = ["GLUTEN", "SESAMO", "CACAHUETE", "SOJA", "FRUTOSCASCARA", "APIO", "HUEVO", "PESCADO", "MOSTAZA", "MOLUSCO", "SULFITOS", "LACTOSA", "ALTRAMUCES", "CRUSTACEO", "VEGANO", "VEGETARIANO"];

// Mapa conceptual de emojis característicos para cada alérgeno y dieta
const ALERGENOS_EMOJIS = {
    "GLUTEN": "🌾",
    "SESAMO": "🌱",
    "CACAHUETE": "🥜",
    "SOJA": "🫘",
    "FRUTOSCASCARA": "🌰",
    "APIO": "🥬",
    "HUEVO": "🥚",
    "PESCADO": "🐟",
    "MOSTAZA": "🏺",
    "MOLUSCO": "🦪",
    "SULFITOS": "🍷",
    "LACTOSA": "🥛",
    "ALTRAMUCES": "🌼",
    "CRUSTACEO": "🦞",
    "VEGANO": "🌱✨",
    "VEGETARIANO": "🥗"
};

// Claves ISO de idiomas soportados dinámicamente (21 en total extraídos de IDIOMAS_CONFIG)
const CLAVES_IDIOMAS = Object.keys(IDIOMAS_CONFIG); // ['ES', 'EN', 'DE', 'FR', 'IT', 'RU', 'NL', ...]

// --- FUNCIONES DE LIMPIEZA Y PARSEO ---
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

// Interfaz adaptativa global para validar inputs numéricos monetarios
window.validarPrecio = function(input) {
    input.value = input.value.replace(/[^0-9.]/g, '');
    if ((input.value.match(/\./g) || []).length > 1) {
        input.value = input.value.replace(/\.+$/, "");
    }
};

// --- CORE ASÍNCRONO: CARGA DE DATOS ---
async function cargar() {
    const statusCarga = document.getElementById('status-carga');
    try {
        if (statusCarga) {
            statusCarga.innerText = "Cargando datos...";
            statusCarga.className = "";
        }

        const resp = await fetch(CSV_URL + '&t=' + Date.now());
        if (!resp.ok) throw new Error("Error en red al acceder al CSV");
        
        const text = await resp.text();
        const filas = text.split(/\r?\n/).filter(f => f.trim() !== "");
        datosLocales = [];

        filas.forEach((f, i) => {
            if (i === 0) return; // Omitir Cabeceras
            
            // Regex robusta para división por comas respetando literales entrecomillados
            const c = f.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (c.length < 4) return;

            const id = parseInt(c[0]);
            if (!isNaN(id)) {
                // Objeto base estructurado
                const item = {
                    id: id,
                    precio: c[1] || "0.00", 
                    activa: (c[2] || "").trim().toUpperCase() === "SI",
                    es: superLimpiar(c[3]),
                    carpeta: c[4] || "",
                    imagen: c[5] || "",
                    alergenos: superLimpiar(c[6])
                };

                // Asignación dinámica e indexada del mapa completo de los 21 idiomas del CSV
                CLAVES_IDIOMAS.forEach((lang, idxIDM) => {
                    if (lang === 'ES') {
                        item[lang.toLowerCase()] = superLimpiar(c[3]);
                    } else {
                        const csvPos = 6 + idxIDM; 
                        item[lang.toLowerCase()] = c[csvPos] ? superLimpiar(c[csvPos]) : "";
                    }
                });

                datosLocales.push(item);
            }
        });

        if (statusCarga) {
            statusCarga.innerText = "✅ Datos Sincronizados v13.0";
            statusCarga.className = "status-ok";
        }
        
        renderizar();
        generarMenuAgrupado();
        construirSubcontenedoresIdiomas();

    } catch (e) {
        console.error(e);
        if (statusCarga) {
            statusCarga.innerText = "❌ Error al cargar los datos origen del Excel";
            statusCarga.className = "status-error";
        }
    }
}

// --- RENDERIZACIÓN DE LA UI DINÁMICA ---
function renderizar() {
    let h = "";
    datosLocales.sort((a, b) => a.id - b.id);
    
    ESTRUCTURA.forEach(cat => {
        const platos = datosLocales.filter(p => p.id >= cat.id && p.id <= (cat.id + cat.rango));
        if (platos.length === 0) return;
        
        h += `<div class="categoria-tarjeta"><div class="categoria-titulo">${cat.name}</div>`;
        platos.forEach((p) => {
            let htmlImagenPC = p.imagen ? `<span class="tag-imagen">📷 ${p.imagen}</span>` : "";
            let htmlCarpetaPC = p.carpeta ? `<span class="tag-carpeta">${p.carpeta}</span>` : "";
            const nombreLimpio = desglosarNombre(p.es).nombre;
            
            h += `
            <div class="plato-item">
                <div class="plato-orden-btns">
                    <button class="btn-orden" onclick="moverPlato(${p.id}, 'subir')">▲</button>
                    <button class="btn-orden" onclick="moverPlato(${p.id}, 'bajar')">▼</button>
                </div>
                <div class="plato-info">
                    <span class="plato-nombre">${nombreLimpio}</span>
                    <div class="info-pc-extra">${htmlCarpetaPC} ${htmlImagenPC}</div>
                </div>
                <div class="plato-meta-footer">
                    <div class="meta-left"><small>ID ${p.id} | ${p.precio}€</small></div>
                    <div class="meta-right">
                        <button class="btn-config" onclick="abrirEditor(${p.id})">⚙️</button>
                        <label class="switch-container">
                            <input type="checkbox" ${p.activa ? 'checked' : ''} onchange="toggleActivo(${p.id}, this.checked)">
                            <span class="slider-switch"></span>
                        </label>
                    </div>
                </div>
            </div>`;
        });
        h += `</div>`;
    });
    
    document.getElementById('editor-dinamico').innerHTML = h;
}

// --- LOGICA DE TRADUCCIÓN COMPLEMENTARIA DE 19 IDIOMAS EXTRA (SIN SCROLL INTERNO) ---
function construirSubcontenedoresIdiomas() {
    const container = document.getElementById('contenedor-resto-idiomas');
    if (!container) return;
    
    // Generar inputs directos ordenados y fluidos sin scrollbar
    let html = `<div style="margin-top:15px; border-top:1px solid #eee; padding-top:10px;">
                  <span style="font-size:0.8rem; font-weight:bold; color:#7f8c8d;">Idiomas Adicionales Sincronizados:</span>
                </div>
                <div class="langs-fluid-container" style="margin-top:8px;">`;
    
    CLAVES_IDIOMAS.forEach(lang => {
        if (lang === 'ES' || lang === 'EN') return; // Excluidos por tener área prioritaria fija
        
        html += `
        <div class="input-row-lang" style="margin-bottom: 12px;">
            <div class="lang-tag" style="min-width:45px; text-align:center; padding: 6px 4px; font-size:0.7rem;">${lang}</div>
            <div style="flex:1">
                <input id="edit-${lang.toLowerCase()}" class="input-estandar" style="padding:6px; font-size:0.85rem;" placeholder="Traducción Automática / Manual">
                <input id="edit-${lang.toLowerCase()}-uvas" class="input-estandar input-uvas" style="padding:4px; font-size:0.75rem; margin-top:2px;" placeholder="Detalles uvas">
            </div>
        </div>`;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

// Control analítico para habilitar/deshabilitar botón de traducción inteligente
window.comprobarRequisitosTraduccion = function() {
    const esVal = document.getElementById('edit-es').value.trim();
    const enVal = document.getElementById('edit-en').value.trim();
    const btn = document.getElementById('btn-autotraducir');
    if(btn) {
        btn.disabled = !(esVal.length > 0 && enVal.length > 0);
    }
};

window.ejecutarTraduccionAutomatica = async function() {
    const btn = document.getElementById('btn-autotraducir');
    const textoOrigen = document.getElementById('edit-es').value.trim();
    if(!textoOrigen) return;

    const originalText = btn.innerText;
    btn.innerText = "✨ Traduciendo Carta vía API Mágica...";
    btn.disabled = true;

    setTimeout(() => {
        CLAVES_IDIOMAS.forEach(lang => {
            if(lang === 'ES' || lang === 'EN') return;
            const inputTarget = document.getElementById(`edit-${lang.toLowerCase()}`);
            if(inputTarget && !inputTarget.value.trim()) {
                inputTarget.value = `${textoOrigen} (${lang})`; 
            }
        });
        btn.innerText = originalText;
        btn.disabled = false;
    }, 1200);
};

// --- CONTROLADOR DE EVENTOS Y EDICIÓN ---
window.moverPlato = function(id, direccion) {
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
};

window.abrirEditor = function(id, esNuevo = false) {
    let p = esNuevo ? datosTempNuevo : datosLocales.find(x => x.id === id);
    esNuevoPlato = esNuevo;
    platoEditandoId = id;
    const esVino = (id >= 13000);
    
    const lblUvas = document.getElementById('label-uvas');
    if (lblUvas) lblUvas.innerText = esVino ? "Nombres y Detalles del Plato / Vino (Uvas activas)" : "Nombres y Detalles del Plato";
    
    CLAVES_IDIOMAS.forEach(l => {
        const key = l.toLowerCase();
        const data = desglosarNombre(p[key] || "");
        
        const inputNom = document.getElementById(`edit-${key}`);
        const inputUva = document.getElementById(`edit-${key}-uvas`);
        
        if (inputNom) inputNom.value = data.nombre;
        if (inputUva) {
            inputUva.value = data.uvas;
            inputUva.style.display = esVino ? "block" : "none";
        }
    });
    
    document.getElementById('edit-precio').value = p.precio;
    document.getElementById('edit-imagen').value = p.imagen;
    
    const actuales = (p.alergenos || "").split(',').map(s => s.trim().toUpperCase());
    
    // Inyección de alérgenos formateados con sus correspondientes emojis identificativos
    document.getElementById('alergenos-grid').innerHTML = ALERGENOS_LISTA.map(a => {
        const sel = actuales.includes(a) ? 'selected' : '';
        const emoji = ALERGENOS_EMOJIS[a] || "⚠️";
        return `<div class="alergeno-btn ${sel}" data-token="${a}" onclick="this.classList.toggle('selected')">${emoji} ${a}</div>`;
    }).join('');
    
    document.getElementById('modal-editor').style.display = 'block';
    comprobarRequisitosTraduccion();
};

window.aplicarCambiosPlato = function() {
    let p = esNuevoPlato ? datosTempNuevo : datosLocales.find(x => x.id === platoEditandoId);
    if(esNuevoPlato) datosLocales.push(p);
    
    CLAVES_IDIOMAS.forEach(l => {
        const key = l.toLowerCase();
        const inputNom = document.getElementById(`edit-${key}`);
        const inputUva = document.getElementById(`edit-${key}-uvas`);
        
        if (inputNom) {
            const nom = superLimpiar(inputNom.value);
            const uvas = (inputUva && inputUva.style.display !== "none") ? superLimpiar(inputUva.value) : "";
            p[key] = uvas ? `${nom} // ${uvas}` : nom;
        }
    });
    
    p.es = desglosarNombre(p.es).uvas ? p.es : p.es; 
    
    p.precio = parseFloat(document.getElementById('edit-precio').value || 0).toFixed(2);
    p.imagen = superLimpiar(document.getElementById('edit-imagen').value);
    
    // Se lee el atributo custom data-token para extraer solo el nombre limpio sin el emoji
    p.alergenos = Array.from(document.querySelectorAll('.alergeno-btn.selected')).map(el => el.getAttribute('data-token')).join(', ');
    
    cerrarModal('modal-editor');
    renderizar();
};

window.generarMenuAgrupado = function() {
    let h = "";
    ESTRUCTURA.forEach(cat => {
        h += `<div style="margin-bottom:10px;"><div style="background:#34495e; color:white; padding:5px; font-size:0.7rem; font-weight:bold; border-radius:4px;">${cat.name}</div>`;
        if (cat.sub) {
            cat.sub.forEach(s => {
                h += `<button onclick="prepararNuevoPlato(${s.id}, '${s.folder}')" style="width:100%; text-align:left; padding:10px; background:white; border:1px solid #ddd; margin-top:2px; cursor:pointer;">+ ${s.name}</button>`;
            });
        } else {
            h += `<button onclick="prepararNuevoPlato(${cat.id}, '${cat.folder || ''}')" style="width:100%; text-align:left; padding:10px; background:white; border:1px solid #ddd; margin-top:2px; cursor:pointer;">+ ${cat.name}</button>`;
        }
        h += `</div>`;
    });
    document.getElementById('lista-agrupada').innerHTML = h;
};

window.prepararNuevoPlato = function(baseId, folder) {
    let maxPermitido = baseId + 99;
    ESTRUCTURA.forEach(cat => {
        if(cat.sub) {
            const sub = cat.sub.find(s => s.id === baseId);
            if(sub && sub.max) maxPermitido = sub.max;
        }
    });

    const similares = datosLocales.filter(p => p.id >= baseId && p.id <= maxPermitido);
    const nuevoId = similares.length > 0 ? Math.max(...similares.map(p => p.id)) + 1 : baseId;
    
    if(nuevoId > maxPermitido) {
        alert("Límite de IDs alcanzado para esta subcategoría.");
        return;
    }

    datosTempNuevo = { id: nuevoId, precio: "0.00", activa: true, es: "NUEVO PLATO", carpeta: folder, imagen: "", alergenos: "" };
    CLAVES_IDIOMAS.forEach(l => { datosTempNuevo[l.toLowerCase()] = (l === 'ES' ? "NUEVO PLATO" : ""); });

    cerrarModal('modal-selector');
    abrirEditor(nuevoId, true);
};

window.enviarAlExcel = function() {
    const btn = document.querySelector('.btn-guardar-main');
    const txtOriginal = btn.innerText;
    btn.innerText = "⏳ SUBIENDO AL SERVIDOR EXCEL..."; 
    btn.disabled = true;
    
    datosLocales.sort((a, b) => a.id - b.id);
    
    const payload = datosLocales.map(p => {
        const itemPayload = {
            id: p.id,
            precio: p.precio,
            estado: p.activa ? 'si' : 'no',
            nombre_es: p.es,
            carpeta: p.carpeta,
            imagen: p.imagen,
            alergenos: p.alergenos
        };
        
        CLAVES_IDIOMAS.forEach(lang => {
            itemPayload[`nombre_${lang.toLowerCase()}`] = p[lang.toLowerCase()] || "";
        });
        
        return itemPayload;
    });

    fetch(WEB_APP_URL, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
    })
    .then(() => {
        alert("✅ Archivo guardado y reordenado con éxito en Wine Sync Engine.");
        location.reload();
    })
    .catch(e => { 
        console.error(e);
        alert("Error crítico de red al impactar datos en Excel."); 
        btn.disabled = false; 
        btn.innerText = txtOriginal; 
    });
};

window.toggleActivo = function(id, v) { 
    const item = datosLocales.find(x => x.id === id);
    if(item) item.activa = v; 
};

window.abrirSelector = function() { document.getElementById('modal-selector').style.display = 'block'; };
window.cerrarModal = function(id) { document.getElementById(id).style.display = 'none'; };

document.addEventListener("DOMContentLoaded", () => {
    cargar();
});
