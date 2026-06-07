// --- app.js ---
// Configuración extraída de bases de datos externas de Wine Sync
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

const ALERGENOS_LISTA = ["GLUTEN", "SESAMO", "CACAHUETE", "SOJA", "FRUTOSCASCARA", "APIO", "HUEVO", "PESCADO", "MOSTAZA", "MOLUSCO", "SULFITOS", "LACTOSA", "ALTRAMUCES", "CRUSTACEO", "VEGANO", "VEGETARIANO"];

// Mapeo ordenado de códigos ISO de idiomas correlativos a las columnas de la base de datos (D, H hasta AA)
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

// Carga asíncrona optimizada para parsear las 27 columnas (A-AA)
async function cargar() {
    try {
        const resp = await fetch(CSV_URL + '&t=' + Date.now());
        const text = await resp.text();
        const filas = text.split(/\r?\n/).filter(f => f.trim() !== "");
        datosLocales = [];
        
        filas.forEach((f, i) => {
            if (i === 0) return; // Omitir encabezados
            
            // Expresión regular para separar por comas respetando los textos entrecomillados
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
                
                // Mapeo posicional dinámico según la estructura de columnas de la hoja
                item['es'] = superLimpiar(c[3]);  // Columna D
                item['en'] = superLimpiar(c[7]);  // Columna H
                item['de'] = superLimpiar(c[8]);  // Columna I
                item['fr'] = superLimpiar(c[9]);  // Columna J
                item['it'] = superLimpiar(c[10]); // Columna K
                item['ru'] = superLimpiar(c[11]); // Columna L
                item['nl'] = superLimpiar(c[12]); // Columna M
                item['pl'] = superLimpiar(c[13]); // Columna N
                item['sv'] = superLimpiar(c[14]); // Columna O
                item['no'] = superLimpiar(c[15]); // Columna P
                item['da'] = superLimpiar(c[16]); // Columna Q
                item['fi'] = superLimpiar(c[17]); // Columna R
                item['pt'] = superLimpiar(c[18]); // Columna S
                item['ro'] = superLimpiar(c[19]); // Columna T
                item['hu'] = superLimpiar(c[20]); // Columna U
                item['cs'] = superLimpiar(c[21]); // Columna V
                item['el'] = superLimpiar(c[22]); // Columna W
                item['tr'] = superLimpiar(c[23]); // Columna X
                item['ar'] = superLimpiar(c[24]); // Columna Y
                item['zh'] = superLimpiar(c[25]); // Columna Z
                item['ja'] = superLimpiar(c[26]); // Columna AA
                
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
    
    // Sincronizar inputs fijos del layout: ES y EN
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
    
    // Renderizar dinámicamente en el contenedor scrollable los otros 19 idiomas restantes
    let htmlRestoLangs = `<div class="langs-fluid-container">`;
    IDIOMAS_ORDEN.forEach(l => {
        if (l === 'es' || l === 'en') return; // Saltar fijos
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

async function ejecutarTraduccionAutomatica() {
    const btn = document.getElementById('btn-autotraducir');
    const originalText = btn.innerText;
    btn.innerText = "✨ Traduciendo en tiempo real...";
    btn.disabled = true;
    
    const nombreEs = document.getElementById('edit-es').value.trim();
    const esVino = (platoEditandoId >= 13000);
    const keys = getKeys();
    const apiKey = keys[0]; // Usar la clave primaria configurada en state.js
    
    // Iteramos por los 19 idiomas restantes para traducirlos mediante la API de Google Translate
    for (let l of IDIOMAS_ORDEN) {
        if (l === 'es' || l === 'en') continue;
        try {
            const urlTranslate = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
            const response = await fetch(urlTranslate, {
                method: 'POST',
                body: JSON.stringify({ q: nombreEs, target: l, source: 'es', format: 'text' })
            });
            const resData = await response.json();
            if (resData.data && resData.data.translations && resData.data.translations[0]) {
                document.getElementById(`edit-${l}`).value = resData.data.translations[0].translatedText;
            }
            
            // Si es un vino, replicamos las uvas del input ES a los demás de forma inteligente
            if (esVino) {
                document.getElementById(`edit-${l}-uvas`).value = document.getElementById('edit-es-uvas').value.trim();
            }
        } catch (err) {
            console.error(`Error en traducción automática al idioma [${l}]:`, err);
        }
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
    
    // Inicializar campos vacíos de los 21 idiomas para el objeto temporal
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
    
    // Mapeo exacto del payload JSON plano que procesa el Apps Script en su función doPost
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

// Inicialización automática
cargar();
