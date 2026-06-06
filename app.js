const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz2wu6B0m-QWZLqDRXhWcONg0Lta3uhTDOXq1lly43p5XKC7uvReeT6HcfC8K0LTLusTA/exec';

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

const ALERGENOS_LISTA = ["GLUTEN", "SESAMO", "CACAHUETE", "SOJA", "FRUTOSCASCARA", "APIO", "HUEVO", "PESCADO", "MOSTAZA", "MOLUSCO", "SULFITOS", "LACTOSA", "ALTRAMUCES", "CRUSTACEO", "VEGANO", "VEGETARIANO"];

// Generar inputs dinámicos en el modal de edición para los 19 idiomas restantes
function construirCamposDeIdiomasDinamicos() {
    const contenedor = document.getElementById('contenedor-resto-idiomas');
    let html = "";
    Object.keys(IDIOMAS_CONFIG).forEach(lang => {
        if (lang === 'ES' || lang === 'EN') return; // Saltamos los dos fijos superiores
        const minusc = lang.toLowerCase();
        html += `
        <div class="input-row-lang">
            <div class="lang-tag">${IDIOMAS_CONFIG[lang].split(' ')[0]} ${lang}</div>
            <div style="flex:1">
                <input id="edit-${minusc}" class="input-estandar" placeholder="Traducción...">
                <input id="edit-${minusc}-uvas" class="input-estandar input-uvas" placeholder="Detalles / Uvas...">
            </div>
        </div>`;
    });
    contenedor.innerHTML = html;
}

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
                let itemPlato = {
                    id: id, precio: c[1]||"0.00", 
                    activa: (c[2]||"").trim().toUpperCase() === "SI",
                    es: superLimpiar(c[3]), carpeta: c[4]||"", imagen: c[5]||"",
                    alergenos: superLimpiar(c[6])
                };
                
                // Mapeo dinámico por posición en base al orden de IDIOMAS_CONFIG
                const keysLang = Object.keys(IDIOMAS_CONFIG); 
                for(let k = 1; k < keysLang.length; k++) { // c[7] es EN, c[8] es DE, etc.
                    const indexColumna = 6 + k; 
                    itemPlato[keysLang[k].toLowerCase()] = superLimpiar(c[indexColumna]);
                }
                datosLocales.push(itemPlato);
            }
        });
        document.getElementById('status-carga').innerText = "✅ Datos Sincronizados (21 Idiomas)";
        document.getElementById('status-carga').className = "status-ok";
        renderizar();
        generarMenuAgrupado();
    } catch (e) { 
        console.error(e);
        document.getElementById('status-carga').innerText = "❌ Error al cargar"; 
    }
}

function renderizar() {
    let h = "";
    datosLocales.sort((a,b)=>a.id-b.id);
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
                    <div class="info-pc-extra">${htmlCarpetaPC} ${htmlImagenPC}</div>
                </div>
                <div class="plato-meta-footer">
                    <div class="meta-left"><small>ID ${p.id} | ${p.precio}€</small></div>
                    <div class="meta-right">
                        <button class="btn-config" onclick="abrirEditor(${p.id})">⚙️</button>
                        <label class="switch"><input type="checkbox" ${p.activa?'checked':''} onchange="toggleActivo(${p.id},this.checked)"><span class="slider"></span></label>
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
    document.getElementById('label-uvas').innerText = esVino ? "Nombres y Uvas (Uvas solo para Vinos)" : "Nombres";
    
    Object.keys(IDIOMAS_CONFIG).forEach(lang => {
        const minusc = lang.toLowerCase();
        const data = desglosarNombre(p[minusc] || "");
        document.getElementById(`edit-${minusc}`).value = data.nombre;
        const inputUva = document.getElementById(`edit-${minusc}-uvas`);
        inputUva.value = data.uvas;
        inputUva.style.display = esVino ? "block" : "none";
    });

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
    const valEs = document.getElementById('edit-es').value.trim();
    const valEn = document.getElementById('edit-en').value.trim();
    const btn = document.getElementById('btn-autotraducir');
    
    if (valEs.length > 0 && valEn.length > 0) {
        btn.disabled = false;
        btn.innerText = "✨ Traducir los otros 19 idiomas desde el Inglés";
    } else {
        btn.disabled = true;
        btn.innerText = "✨ Traducir los otros 19 idiomas (Requiere ES y EN)";
    }
}

async function llamarApiTraductor(texto, targetLang) {
    if (!texto) return "";
    try {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|${targetLang.toLowerCase()}`;
        const res = await fetch(url);
        const json = await res.json();
        if(json && json.responseData) return json.responseData.translatedText;
        return "";
    } catch(e) {
        console.error("Error MyMemory en: " + targetLang, e);
        return "";
    }
}

async function ejecutarTraduccionAutomatica() {
    const btn = document.getElementById('btn-autotraducir');
    btn.disabled = true;
    btn.innerText = "⏳ TRADUCIENDO 19 IDIOMAS EN PARALELO...";

    const nombreEn = document.getElementById('edit-en').value.trim();
    const uvasEn = document.getElementById('edit-en-uvas').value.trim();
    const esVino = (platoEditandoId >= 13000);

    const idiomasDestino = Object.keys(IDIOMAS_CONFIG).filter(l => l !== 'ES' && l !== 'EN');

    // Procesamiento masivo concurrente asíncrono
    await Promise.all(idiomasDestino.map(async (lang) => {
        const minusc = lang.toLowerCase();
        if (nombreEn) {
            const resNom = await llamarApiTraductor(nombreEn, lang);
            if (resNom) document.getElementById(`edit-${minusc}`).value = resNom;
        }
        if (esVino && uvasEn) {
            const resUva = await llamarApiTraductor(uvasEn, lang);
            if (resUva) document.getElementById(`edit-${minusc}-uvas`).value = resUva;
        }
    }));

    btn.disabled = false;
    btn.innerText = "✅ ¡19 Idiomas Procesados!";
    setTimeout(() => comprobarRequisitosTraduccion(), 3000);
}

function aplicarCambiosPlato() {
    let p = esNuevoPlato ? datosTempNuevo : datosLocales.find(x => x.id === platoEditandoId);
    if(esNuevoPlato) datosLocales.push(p);
    
    Object.keys(IDIOMAS_CONFIG).forEach(lang => {
        const minusc = lang.toLowerCase();
        const nom = superLimpiar(document.getElementById(`edit-${minusc}`).value);
        const inputUva = document.getElementById(`edit-${minusc}-uvas`);
        const uvas = inputUva.style.display !== "none" ? superLimpiar(inputUva.value) : "";
        p[minusc] = uvas ? `${nom} // ${uvas}` : nom;
    });

    p.precio = parseFloat(document.getElementById('edit-precio').value || 0).toFixed(2);
    p.imagen = superLimpiar(document.getElementById('edit-imagen').value);
    p.alergenos = Array.from(document.querySelectorAll('.alergeno-btn.selected')).map(el => el.innerText).join(', ');
    cerrarModal('modal-editor');
    renderizar();
}

function generarMenuAgrupado() {
    let h = "";
    ESTRUCTURA.forEach(cat => {
        h += `<div style="margin-bottom:10px;"><div style="background:#eee;padding:5px;font-size:0.7rem;">${cat.name}</div>`;
        if (cat.sub) {
            cat.sub.forEach(s => {
                h += `<button onclick="prepararNuevoPlato(${s.id}, '${s.folder}')" style="width:100%;text-align:left;padding:10px;background:white;border:1px solid #ddd;">+ ${s.name}</button>`;
            });
        } else {
            h += `<button onclick="prepararNuevoPlato(${cat.id}, '${cat.folder||''}')" style="width:100%;text-align:left;padding:10px;background:white;border:1px solid #ddd;">+ ${cat.name}</button>`;
        }
        h += `</div>`;
    });
    document.getElementById('lista-agrupada').innerHTML = h;
}

function prepararNuevoPlato(baseId, folder) {
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

    datosTempNuevo = { id: nuevoId, precio: "0.00", activa: true, carpeta: folder, imagen: "", alergenos: "" };
    Object.keys(IDIOMAS_CONFIG).forEach(l => datosTempNuevo[l.toLowerCase()] = "");

    cerrarModal('modal-selector');
    abrirEditor(nuevoId, true);
}

async function enviarAlExcel() {
    const btn = document.querySelector('.btn-guardar-main');
    btn.innerText = "⏳ SUBIENDO..."; btn.disabled = true;
    datosLocales.sort((a, b) => a.id - b.id);
    
    const payload = datosLocales.map(p => {
        let fila = {
            id: p.id, precio: p.precio, estado: p.activa ? 'si' : 'no', 
            nombre_es: p.es, carpeta: p.carpeta, imagen: p.imagen, alergenos: p.alergenos
        };
        // Estructuración posicional exacta para el receptor de Google Apps Script
        Object.keys(IDIOMAS_CONFIG).forEach(lang => {
            if (lang === 'ES') return;
            fila[`nombre_${lang.toLowerCase()}`] = p[lang.toLowerCase()] || "";
        });
        return fila;
    });

    try {
        await fetch(WEB_APP_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        alert("✅ Guardado y sincronizado con éxito global.");
        location.reload();
    } catch (e) { 
        alert("Error al guardar"); 
        btn.disabled = false; btn.innerText = "💾 GUARDAR"; 
    }
}

function toggleActivo(id, v) { datosLocales.find(x => x.id === id).activa = v; }
function abrirSelector() { document.getElementById('modal-selector').style.display = 'block'; }
    function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }

// Inicialización Automática
cargar();
