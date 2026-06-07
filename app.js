// --- app.js ---
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

const ALERGENOS_LISTA = ["GLUTEN", "SESAMO", "CACAHUETE", "SOJA", "FRUTOSCASCARA", "APIO", "HUEVO", "PESCADO", "MOSTAZA", "MOLUSCO", "SULFITOS", "LACTOSA", "ALTRAMUCES", "CRUSTACEO", "VEGANO", "VEGETARIANO"];

const IDIOMAS_ORDEN = ['es', 'en', 'de', 'fr', 'it', 'ru', 'nl', 'pl', 'sv', 'no', 'da', 'fi', 'pt', 'ro', 'hu', 'cs', 'el', 'tr', 'ar', 'zh', 'ja'];

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

async function cargar() {
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
                let item = {
                    id: id,
                    precio: c[1] || "0.00", 
                    activa: (c[2] || "").trim().toUpperCase() === "SI",
                    carpeta: c[4] || "",
                    imagen: c[5] || "",
                    alergenos: superLimpiar(c[6])
                };
                
                item['es'] = superLimpiar(c[3]);
                item['en'] = superLimpiar(c[7]);
                item['de'] = superLimpiar(c[8]);
                item['fr'] = superLimpiar(c[9]);
                item['it'] = superLimpiar(c[10]);
                item['ru'] = superLimpiar(c[11]);
                item['nl'] = superLimpiar(c[12]);
                item['pl'] = superLimpiar(c[13]);
                item['sv'] = superLimpiar(c[14]);
                item['no'] = superLimpiar(c[15]);
                item['da'] = superLimpiar(c[16]);
                item['fi'] = superLimpiar(c[17]);
                item['pt'] = superLimpiar(c[18]);
                item['ro'] = superLimpiar(c[19]);
                item['hu'] = superLimpiar(c[20]);
                item['cs'] = superLimpiar(c[21]);
                item['el'] = superLimpiar(c[22]);
                item['tr'] = superLimpiar(c[23]);
                item['ar'] = superLimpiar(c[24]);
                item['zh'] = superLimpiar(c[25]);
                item['ja'] = superLimpiar(c[26]);
                
                datosLocales.push(item);
            }
        });
        
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) {
            statusCarga.innerText = "✅ Datos Sincronizados (21 Idiomas)";
            statusCarga.className = "status-ok";
        }
        renderizar();
        generarMenuAgrupado();
    } catch (e) { 
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) statusCarga.innerText = "❌ Error al cargar base multidireccional"; 
    }
}

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
            
            h += `<div class="plato-item">
                <div class="plato-orden-btns">
                    <button class="btn-orden" onclick="moverPlato(${p.id}, 'subir')">▲</button>
                    <button class="btn-orden" onclick="moverPlato(${p.id}, 'bajar')">▼</button>
                </div>
                <div class="plato-info">
                    <span class="plato-nombre">${nombreLimpio}</span>
                    <div style="font-size: 0.7rem; color: #7f8c8d; margin-top: 4px; display: flex; gap: 10px; align-items: center;">${htmlCarpetaPC} ${htmlImagenPC}</div>
                </div>
                <div class="plato-meta-footer">
                    <div><small>ID ${p.id} | ${p.precio}€</small></div>
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
        h += `</div>`;
    });
    document.getElementById('editor-dinamico').innerHTML = h;
}

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

function abrirEditor(id, esNuevo = false) {
    let p = esNuevo ? datosTempNuevo : datosLocales.find(x => x.id === id);
    esNuevoPlato = esNuevo;
    platoEditandoId = id;
    const esVino = (id >= 13000);
    
    document.getElementById('label-uvas').innerText = esVino ? "Nombres y Detalles del Plato / Vino (Uvas)" : "Nombres y Detalles del Plato";
    
    const dataEs = desglosarNombre(p['es'] || "");
    document.getElementById('edit-es').value = dataEs.nombre;
    const inputEsUvas = document.getElementById('edit-es-uvas');
    inputEsUvas.value = dataEs.uvas;
    inputEsUvas.style.display = esVino ? "block" : "none";
    
    const dataEn = desglosarNombre(p['en'] || "");
    document.getElementById('edit-en').value = dataEn.nombre;
    const inputEnUvas = document.getElementById('edit-en-uvas');
    inputEnUvas.value = dataEn.uvas;
    inputEnUvas.style.display = esVino ? "block" : "none";
    
    let htmlRestoLangs = `<div class="langs-fluid-container">`;
    IDIOMAS_ORDEN.forEach(l => {
        if (l === 'es' || l === 'en') return;
        const dataLang = desglosarNombre(p[l] || "");
        const labelIdioma = IDIOMAS_CONFIG[l.toUpperCase()] || l.toUpperCase();
        
        htmlRestoLangs += `
            <div class="input-row-lang">
                <div class="lang-tag">${l.toUpperCase()}</div>
                <div style="flex:1">
                    <input id="edit-${l}" class="input-estandar input-nombre-corto" placeholder="Nombre en ${labelIdioma}" value="${dataLang.nombre}">
                    <input id="edit-${l}-uvas" class="input-estandar input-uvas" placeholder="Detalles / Grapes (${labelIdioma})" value="${dataLang.uvas}" style="display: ${esVino ? 'block' : 'none'};">
                </div>
            </div>`;
    });
    htmlRestoLangs += `</div>`;
    document.getElementById('contenedor-resto-idiomas').innerHTML = htmlRestoLangs;
    
    document.getElementById('edit-precio').value = p.precio;
    document.getElementById('edit-imagen').value = p.imagen;
    
    const actuales = (p.alergenos || "").split(',').map(s => s.trim().toUpperCase());
    document.getElementById('alergenos-grid').innerHTML = ALERGENOS_LISTA.map(a => {
        const sel = actuales.includes(a) ? 'selected' : '';
        return `<div class="alergeno-btn ${sel}" onclick="this.classList.toggle('selected')">${a}</div>`;
    }).join('');
    
    comprobarRequisitosTraduccion();
    document.getElementById('modal-editor').style.display = 'block';
}

function comprobarRequisitosTraduccion() {
    const esValido = document.getElementById('edit-es').value.trim() !== "" && document.getElementById('edit-en').value.trim() !== "";
    document.getElementById('btn-autotraducir').disabled = !esValido;
}

// --- NUEVA FUNCIONALIDAD: TRADUCCIÓN INGLÉS DESDE ESPAÑOL CON SELECCIÓN ---
async function generarTraduccionEN() {
    const nombreEs = document.getElementById('edit-es').value.trim();
    if (!nombreEs) {
        alert("❌ Debes introducir primero el nombre en Español.");
        return;
    }

    const keys = getKeys();
    if (keys.length === 0) {
        alert("❌ No hay API Keys de Gemini configuradas. Añade al menos una en el panel superior.");
        return;
    }

    const btn = document.getElementById('btn-generar-en');
    const originalText = btn.innerText;
    btn.innerText = "🇬🇧 Generando opciones...";
    btn.disabled = true;

    const URL_MODELO = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
    const instruccion = `Actúa como un traductor profesional de menús de restaurantes. Te paso un plato en español: "${nombreEs}".
    Necesito que me des EXACTAMENTE 3 opciones de traducción al inglés con diferentes enfoques para un menú:
    1. Traducción directa/literal.
    2. Traducción gastronómica/descriptiva (más elegante).
    3. Traducción corta/concisa (estilo menú rápido).
    
    Responde EXCLUSIVAMENTE con un JSON plano, sin formato markdown ni explicaciones, con esta estructura exacta:
    {"directa": "...", "gastronomica": "...", "corta": "..."}`;

    let exito = false;
    let intentos = 0;
    let opciones = {};

    while (!exito && intentos < keys.length) {
        try {
            const apiKey = keys[intentos];
            const response = await fetch(`${URL_MODELO}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: instruccion }] }] })
            });

            const data = await response.json();

            if (data.error) {
                if (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED') {
                    intentos++;
                } else {
                    break;
                }
                continue;
            }

            const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (txt) {
                const jsonClean = txt.replace(/```json/g, '').replace(/```/g, '').trim();
                opciones = JSON.parse(jsonClean);
                if (opciones.directa || opciones.gastronomica || opciones.corta) {
                    exito = true;
                } else {
                    throw new Error("Formato inesperado");
                }
            } else {
                throw new Error("Respuesta vacía");
            }
        } catch (err) {
            console.error("Error generando EN:", err);
            intentos++;
        }
    }

    if (exito) {
        abrirModalTraduccionEN(opciones);
    } else {
        alert("❌ Error al generar las opciones en Inglés. Revisa las claves API o el formato.");
    }

    btn.innerText = originalText;
    btn.disabled = false;
}

function abrirModalTraduccionEN(opciones) {
    const container = document.getElementById('opciones-en-container');
    const textarea = document.getElementById('editar-opcion-en');
    textarea.value = "";

    let html = "";
    const mapaOpciones = {
        directa: "Directa / Literal",
        gastronomica: "Gastronómica / Elegante",
        corta: "Corta / Menú"
    };

    for (const [key, value] of Object.entries(opciones)) {
        if (value) {
            const label = mapaOpciones[key] || key;
            const valorSeguro = value.replace(/'/g, "\\'");
            html += `<div class="opcion-en-btn" onclick="seleccionarOpcionEN(this, '${valorSeguro}')">
                <span class="opcion-en-label">${label}</span>
                ${value}
            </div>`;
        }
    }

    container.innerHTML = html;
    // Usamos flex para que el cuadro se centre perfectamente vertical y horizontalmente
    document.getElementById('modal-traduccion-en').style.display = 'flex';
}

function seleccionarOpcionEN(elemento, texto) {
    document.querySelectorAll('.opcion-en-btn').forEach(el => el.classList.remove('selected'));
    elemento.classList.add('selected');
    document.getElementById('editar-opcion-en').value = texto;
}

function confirmarTraduccionEN() {
    const textoFinal = document.getElementById('editar-opcion-en').value.trim();
    if (!textoFinal) {
        alert("❌ Selecciona una opción o escribe la traducción antes de confirmar.");
        return;
    }
    document.getElementById('edit-en').value = textoFinal;
    cerrarModalTraduccionEN();
    comprobarRequisitosTraduccion();
}

function cerrarModalTraduccionEN() {
    document.getElementById('modal-traduccion-en').style.display = 'none';
}

// --- TRADUCCIÓN MASIVA 19 IDIOMAS CON GEMINI 2.5 ---
async function ejecutarTraduccionAutomatica() {
    const btn = document.getElementById('btn-autotraducir');
    const originalText = btn.innerText;
    btn.innerText = "✨ Traduciendo con Gemini 2.5...";
    btn.disabled = true;
    
    const nombreEs = document.getElementById('edit-es').value.trim();
    const nombreEn = document.getElementById('edit-en').value.trim();
    const esVino = (platoEditandoId >= 13000);
    const uvasEs = esVino ? document.getElementById('edit-es-uvas').value.trim() : "";
    const keys = getKeys();
    
    if (keys.length === 0) {
        alert("❌ No hay API Keys de Gemini configuradas. Añade al menos una en el panel superior.");
        btn.innerText = originalText;
        btn.disabled = false;
        return;
    }
    
    const idiomasObjetivo = IDIOMAS_ORDEN.filter(l => l !== 'es' && l !== 'en');
    const URL_MODELO = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";
    
    const instruccion = `Actúa como un traductor experto de menús de restaurantes. Traduce el siguiente plato basándote en su nombre en Español: "${nombreEs}" ${nombreEn ? `y su nombre en Inglés (como referencia): "${nombreEn}"` : ''}.
    ${esVino && uvasEs ? `También traduce estos detalles/uvas: "${uvasEs}".` : ''}
    
    Traduce a los siguientes idiomas (usa los códigos ISO proporcionados): ${idiomasObjetivo.join(', ')}.
    
    Devuelve la respuesta EXCLUSIVAMENTE en formato JSON plano (sin explicaciones ni formato markdown), usando los códigos de idioma como claves. ${esVino && uvasEs ? 'Incluye un objeto adicional llamado "uvas" con las traducciones de los detalles/uvas usando los mismos códigos de idioma.' : ''}
    Ejemplo de formato de respuesta esperado: {"de": "...", "fr": "...", "it": "..."} o si hay uvas: {"de": "...", "uvas": {"de": "..."}}`;
    
    let exito = false;
    let intentos = 0;
    
    while (!exito && intentos < keys.length) {
        try {
            const apiKey = keys[intentos];
            const response = await fetch(`${URL_MODELO}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: instruccion }] }] })
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.warn(`Error con Key ${intentos + 1}:`, data.error.message);
                if (data.error.code === 429 || data.error.status === 'RESOURCE_EXHAUSTED') {
                    intentos++;
                } else {
                    break;
                }
                continue; 
            }
            
            const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (txt) {
                const jsonClean = txt.replace(/```json/g, '').replace(/```/g, '').trim();
                const traducciones = JSON.parse(jsonClean);
                
                idiomasObjetivo.forEach(l => {
                    if (traducciones[l]) {
                        document.getElementById(`edit-${l}`).value = traducciones[l];
                    }
                    
                    const inputUva = document.getElementById(`edit-${l}-uvas`);
                    if (inputUva && inputUva.style.display !== "none") {
                        if (traducciones.uvas && traducciones.uvas[l]) {
                            inputUva.value = traducciones.uvas[l];
                        } else if (uvasEs) {
                            inputUva.value = uvasEs;
                        }
                    }
                });
                
                exito = true;
            } else {
                throw new Error("La respuesta de Gemini no contiene texto válido.");
            }
        } catch (err) {
            console.error(`Error en traducción con Gemini (Intento ${intentos + 1}):`, err);
            intentos++;
        }
    }
    
    if (!exito) {
        alert("❌ Error al traducir con Gemini. Revisa las claves API en el panel superior o el formato del texto.");
    }
    
    btn.innerText = originalText;
    btn.disabled = false;
}

function aplicarCambiosPlato() {
    let p = esNuevoPlato ? datosTempNuevo : datosLocales.find(x => x.id === platoEditandoId);
    if (esNuevoPlato) datosLocales.push(p);
    
    IDIOMAS_ORDEN.forEach(l => {
        const nom = superLimpiar(document.getElementById(`edit-${l}`).value);
        const inputUva = document.getElementById(`edit-${l}-uvas`);
        const uvas = (inputUva && inputUva.style.display !== "none") ? superLimpiar(inputUva.value) : "";
        p[l] = uvas ? `${nom} // ${uvas}` : nom;
    });
    
    let preVal = document.getElementById('edit-precio').value || "0.00";
    p.precio = parseFloat(preVal).toFixed(2);
    if(isNaN(p.precio)) p.precio = "0.00";
    
    p.imagen = superLimpiar(document.getElementById('edit-imagen').value);
    p.alergenos = Array.from(document.querySelectorAll('.alergeno-btn.selected')).map(el => el.innerText.trim()).join(', ');
    
    cerrarModal('modal-editor');
    renderizar();
}

function generarMenuAgrupado() {
    let h = "";
    ESTRUCTURA.forEach(cat => {
        h += `<div style="margin-bottom:10px;"><div style="background:#eee;padding:5px;font-size:0.7rem;font-weight:bold;text-transform:uppercase;">${cat.name}</div>`;
        if (cat.sub) {
            cat.sub.forEach(s => {
                h += `<button onclick="prepararNuevoPlato(${s.id}, '${s.folder}')" style="width:100%;text-align:left;padding:10px;background:white;border:1px solid #ddd;font-family:'Montserrat';cursor:pointer;">+ ${s.name}</button>`;
            });
        } else {
            h += `<button onclick="prepararNuevoPlato(${cat.id}, '${cat.folder || ''}')" style="width:100%;text-align:left;padding:10px;background:white;border:1px solid #ddd;font-family:'Montserrat';cursor:pointer;">+ ${cat.name}</button>`;
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
        alert("Límite de IDs alcanzado para esta subcategoría específica.");
        return;
    }

    datosTempNuevo = { 
        id: nuevoId, 
        precio: "0.00", 
        activa: true, 
        carpeta: folder, 
        imagen: "", 
        alergenos: "" 
    };
    
    IDIOMAS_ORDEN.forEach(l => { datosTempNuevo[l] = ""; });
    datosTempNuevo['es'] = "NUEVO ELEMENTO";

    cerrarModal('modal-selector');
    abrirEditor(nuevoId, true);
}

async function enviarAlExcel() {
    const btn = document.querySelector('.btn-guardar-main');
    const textoOriginal = btn.innerText;
    btn.innerText = "⏳ SUBIENDO Y ORDENANDO COLUMNAS..."; 
    btn.disabled = true;
    
    datosLocales.sort((a, b) => a.id - b.id);
    
    const payload = datosLocales.map(p => ({
        id: p.id, 
        precio: p.precio, 
        estado: p.activa ? 'si' : 'no', 
        carpeta: p.carpeta, 
        imagen: p.imagen, 
        alergenos: p.alergenos,
        nombre_es: p['es'] || "",
        nombre_en: p['en'] || "",
        nombre_de: p['de'] || "",
        nombre_fr: p['fr'] || "",
        nombre_it: p['it'] || "",
        nombre_ru: p['ru'] || "",
        nombre_nl: p['nl'] || "",
        nombre_pl: p['pl'] || "",
        nombre_sv: p['sv'] || "",
        nombre_no: p['no'] || "",
        nombre_da: p['da'] || "",
        nombre_fi: p['fi'] || "",
        nombre_pt: p['pt'] || "",
        nombre_ro: p['ro'] || "",
        nombre_hu: p['hu'] || "",
        nombre_cs: p['cs'] || "",
        nombre_el: p['el'] || "",
        nombre_tr: p['tr'] || "",
        nombre_ar: p['ar'] || "",
        nombre_zh: p['zh'] || "",
        nombre_ja: p['ja'] || ""
    }));
    
    try {
        const urlDestino = getWebAppUrl();
        await fetch(urlDestino, { 
            method: 'POST', 
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        });
        alert("✅ Guardado con éxito. Excel ordenado numéricamente.");
        location.reload();
    } catch (e) { 
        alert("Error al intentar impactar los datos en Google Sheets."); 
        btn.disabled = false; 
        btn.innerText = textoOriginal; 
    }
}

function toggleActivo(id, v) { 
    const p = datosLocales.find(x => x.id === id);
    if(p) p.activa = v; 
}

function abrirSelector() { document.getElementById('modal-selector').style.display = 'block'; }
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }

// --- SISTEMA DE GESTIÓN DE API KEYS EN LOCAL ---
function actualizarListaKeys() {
    const select = document.getElementById('selectKeys');
    const keys = getKeys();
    
    if (keys.length === 0) {
        select.innerHTML = '<option value="">No hay API Keys</option>';
        select.disabled = true;
        return;
    }
    
    select.disabled = false;
    select.innerHTML = keys.map((k, i) => {
        const resumida = `${k.substring(0, 6)}...${k.substring(k.length - 4)}`;
        return `<option value="${k}">Key ${i + 1}: ${resumida}</option>`;
    }).join('');
}

function agregarKey() {
    const input = document.getElementById('nuevaKey');
    if (input.value.trim()) {
        saveKey(input.value.trim());
        input.value = "";
        actualizarListaKeys();
    }
}

function eliminarKeySeleccionada() {
    const select = document.getElementById('selectKeys');
    if (select.value) {
        deleteKey(select.value);
        actualizarListaKeys();
    } else {
        alert("No hay ninguna Key seleccionada para eliminar.");
    }
}

// Inicialización automática
cargar();
actualizarListaKeys();
