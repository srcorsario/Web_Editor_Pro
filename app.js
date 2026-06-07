const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const URL_GEMINI = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

// --- LISTA MAESTRA DE ALÉRGENOS (ID CONCORDANTE CON EXCEL) ---
const LISTA_ALERGENOS = [
    { id: "GLUTEN", nombre: "Gluten", icono: "🌾" },
    { id: "SESAMO", nombre: "Sésamo", icono: "🥯" },
    { id: "CACAHUETE", nombre: "Cacahuete", icono: "🥜" },
    { id: "SOJA", nombre: "Soja", icono: "🫘" },
    { id: "FRUTOSCASCARA", nombre: "Frutos Cáscara", icono: "🌰" },
    { id: "APIO", nombre: "Apio", icono: "🌱" },
    { id: "HUEVO", nombre: "Huevo", icono: "🥚" },
    { id: "PESCADO", nombre: "Pescado", icono: "🐟" },
    { id: "MOSTAZA", nombre: "Mostaza", icono: "🏺" },
    { id: "MOLUSCO", nombre: "Molusco", icono: "🦑" },
    { id: "SULFITOS", nombre: "Sulfitos", icono: "🍷" },
    { id: "LACTOSA", nombre: "Lactosa", icono: "🥛" },
    { id: "ALTRAMUCES", nombre: "Altramuces", icono: "🌼" },
    { id: "CRUSTACEO", nombre: "Crustáceo", icono: "🦀" },
    { id: "VEGANO", nombre: "Vegano", icono: "🌱" },
    { id: "VEGETARIANO", nombre: "Vegetariano", icono: "🥗" }
];

// Variable global interna para controlar el estado de selección en la interfaz de botones
let alergenosSeleccionadosTemporales = [];

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

// --- FUNCIÓN AUXILIAR: Limpieza de textos provenientes de CSV ---
function superLimpiar(texto) {
    if (!texto) return "";
    return texto.trim().replace(/^"|"$/g, '');
}

// --- INICIALIZADOR DEL GRID DE ALÉRGENOS EN EL DOM (FORMATO BOTONERA COMPACTA) ---
function inicializarGridAlergenos() {
    const grid = document.getElementById('alergenos-grid');
    if (!grid) return;
    
    // Forzamos distribución horizontal responsiva calculada para 4 o 5 elementos por fila
    grid.style.cssText = "display: grid; grid-template-columns: repeat(auto-fill, minmax(18%, 1fr)); gap: 8px; width: 100%; margin-top: 10px;";
    renderizarBotoneraAlergenos();
}

// Dibujado dinámico del estado visual de los botones de alérgenos
function renderizarBotoneraAlergenos() {
    const grid = document.getElementById('alergenos-grid');
    if (!grid) return;
    
    grid.innerHTML = "";
    LISTA_ALERGENOS.forEach(al => {
        const estaActivo = alergenosSeleccionadosTemporales.includes(al.id);
        const boton = document.createElement('button');
        boton.type = "button";
        
        // Estilos dinámicos dependiendo de si está seleccionado o no
        boton.style.cssText = `
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            gap: 5px; padding: 10px 5px; border-radius: 8px; border: 1px solid ${estaActivo ? 'var(--verde)' : '#ddd'};
            background: ${estaActivo ? '#e8f8f0' : '#f8f9fa'}; color: ${estaActivo ? '#27ae60' : 'var(--texto)'};
            cursor: pointer; font-family: 'Montserrat', sans-serif; font-size: 0.75rem; font-weight: 700;
            transition: all 0.2s ease; box-shadow: ${estaActivo ? '0 2px 4px rgba(39,174,96,0.2)' : 'none'};
        `;
        
        boton.innerHTML = `<span style="font-size: 1.2rem;">${al.icono}</span><span>${al.nombre}</span>`;
        boton.onclick = () => toggleSeleccionAlergeno(al.id);
        grid.appendChild(boton);
    });
}

// Alternar la selección del alérgeno al hacer click en el botón
function toggleSeleccionAlergeno(id) {
    const index = alergenosSeleccionadosTemporales.indexOf(id);
    if (index === -1) {
        alergenosSeleccionadosTemporales.push(id);
    } else {
        alergenosSeleccionadosTemporales.splice(index, 1);
    }
    renderizarBotoneraAlergenos();
}

// --- MOTOR DE RENDERIZADO DINÁMICO ---
function renderizar() {
    console.log("Datos listos para renderizar:", datosLocales);
    const contenedor = document.getElementById('editor-dinamico');
    if (!contenedor) return;

    contenedor.innerHTML = "";

    ESTRUCTURA.forEach(cat => {
        let platosDeCategoria = [];
        
        if (cat.sub && cat.sub.length > 0) {
            cat.sub.forEach(subcat => {
                const maxId = subcat.max || (subcat.id + 99);
                const filtrados = datosLocales.filter(p => p.id >= subcat.id && p.id <= maxId);
                platosDeCategoria = platosDeCategoria.concat(filtrados);
            });
        } else {
            const maxId = cat.id + (cat.rango || 999);
            platosDeCategoria = datosLocales.filter(p => p.id >= cat.id && p.id <= maxId);
        }

        if (platosDeCategoria.length > 0) {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'categoria-tarjeta';

            let HTMLTarjeta = `
                <div class="categoria-titulo">
                    ${cat.name.toUpperCase()} (${platosDeCategoria.length})
                </div>
                <div class="categoria-cuerpo">
            `;

            platosDeCategoria.forEach((plato, index) => {
                const checkedAttr = plato.activa ? 'checked' : '';
                const esPrimero = (index === 0);
                const esUltimo = (index === platosDeCategoria.length - 1);

                HTMLTarjeta += `
                    <div class="plato-item">
                        <div>
                            <label class="switch-container">
                                <input type="checkbox" ${checkedAttr} onchange="window.toggleActivo(${plato.id})">
                                <span class="slider-switch"></span>
                            </label>
                        </div>
                        <div class="plato-info">
                            <span class="plato-nombre">${plato.es || 'Sin Nombre'}</span>
                            <small style="color: #7f8c8d; font-size: 0.75rem;">ID: ${plato.id} | Carpeta: ${plato.carpeta || 'Ninguna'}</small>
                        </div>
                        <div class="plato-meta-footer">
                            <span style="font-weight: bold; color: var(--primario);">${parseFloat(plato.precio).toFixed(2)} €</span>
                            <button class="btn-nav" ${esPrimero ? 'disabled' : ''} onclick="window.moverPlato(${plato.id}, 'arriba')">⬆️</button>
                            <button class="btn-nav" ${esUltimo ? 'disabled' : ''} onclick="window.moverPlato(${plato.id}, 'abajo')">⬇️</button>
                            <button class="btn-config" onclick="window.abrirEditor(${plato.id})">⚙️</button>
                        </div>
                    </div>
                `;
            });

            HTMLTarjeta += `</div>`; 
            tarjeta.innerHTML = HTMLTarjeta;
            contenedor.appendChild(tarjeta);
        }
    });

    if (contenedor.innerHTML === "") {
        contenedor.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--texto);">No se encontraron elementos que coincidan con los rangos numéricos de las categorías configuradas.</p>`;
    }
}

// --- MOTOR DE REORDENAMIENTO DE PLATOS (FLECHAS) ---
function moverPlato(id, direccion) {
    const indexActual = datosLocales.findIndex(p => p.id === id);
    if (indexActual === -1) return;

    const platoActual = datosLocales[indexActual];
    let categoriaActual = null;
    let maxIdCat = 0;
    let minIdCat = 0;

    for (const cat of ESTRUCTURA) {
        if (cat.sub && cat.sub.length > 0) {
            for (const subcat of cat.sub) {
                const maxId = subcat.max || (subcat.id + 99);
                if (platoActual.id >= subcat.id && platoActual.id <= maxId) {
                    categoriaActual = cat;
                    break;
                }
            }
        } else {
            const maxId = cat.id + (cat.rango || 999);
            if (platoActual.id >= cat.id && platoActual.id <= maxId) {
                categoriaActual = cat;
                break;
            }
        }
        if (categoriaActual) {
            if (cat.sub && cat.sub.length > 0) {
                minIdCat = cat.sub[0].id;
                maxIdCat = cat.sub[cat.sub.length - 1].max || (cat.sub[cat.sub.length - 1].id + 99);
            } else {
                minIdCat = cat.id;
                maxIdCat = cat.id + (cat.rango || 999);
            }
            break;
        }
    }

    const platosFiltrados = datosLocales.filter(p => p.id >= minIdCat && p.id <= maxIdCat);
    const subIndexActual = platosFiltrados.findIndex(p => p.id === id);

    if (direccion === 'arriba' && subIndexActual > 0) {
        const platoAnterior = platosFiltrados[subIndexActual - 1];
        const indexAnteriorEnGlobal = datosLocales.findIndex(p => p.id === platoAnterior.id);
        datosLocales[indexActual] = platoAnterior;
        datosLocales[indexAnteriorEnGlobal] = platoActual;
    } else if (direccion === 'abajo' && subIndexActual < platosFiltrados.length - 1) {
        const platoSiguiente = platosFiltrados[subIndexActual + 1];
        const indexSiguienteEnGlobal = datosLocales.findIndex(p => p.id === platoSiguiente.id);
        datosLocales[indexActual] = platoSiguiente;
        datosLocales[indexAnteriorEnGlobal] = platoActual;
    }

    renderizar();
}

// --- VALIDACIÓN DE PRECIO EN TIEMPO REAL ---
function validarPrecio(input) {
    let valor = input.value;
    valor = valor.replace(/,/g, '.');
    valor = valor.replace(/[^0-9.]/g, '');
    const partes = valor.split('.');
    if (partes.length > 2) {
        valor = partes[0] + '.' + partes.slice(1).join('');
    }
    if (partes[1] && partes[1].length > 2) {
        valor = partes[0] + '.' + partes[1].substring(0, 2);
    }
    input.value = valor;
}

// --- MOTOR DE GENERACIÓN DE MENÚS AGRUPADOS ---
function generarMenuAgrupado() {
    console.log("Menú agrupado generado según ESTRUCTURA.");
    const listaAgrupadaContenedor = document.getElementById('lista-agrupada');
    if (!listaAgrupadaContenedor) return;

    listaAgrupadaContenedor.innerHTML = "";
    
    ESTRUCTURA.forEach(cat => {
        const btnCat = document.createElement('button');
        btnCat.style.cssText = "width:100%; text-align:left; padding:12px; margin-bottom:6px; border:1px solid #ddd; background:#fff; border-radius:8px; font-weight:600; cursor:pointer;";
        btnCat.innerText = `➕ ${cat.name}`;
        btnCat.onclick = () => {
            window.prepararNuevoPlato(cat.id);
        };
        listaAgrupadaContenedor.appendChild(btnCat);
    });
}

// --- CONTROLADOR DE INTERFAZ INTEGRADO ---
const UI_INTERNA = {
    log: (mensaje, tipo = '') => {
        const statusElement = document.getElementById('status-carga');
        if (statusElement) {
            statusElement.innerText = mensaje;
            statusElement.className = ''; 
            if (tipo === 'success') statusElement.classList.add('status-ok');
            if (tipo === 'error') statusElement.classList.add('status-error');
        }
    }
};

// --- MOTOR DE TRADUCCIÓN ---
async function llamarApiTraductor(texto, targetLang) {
    if (!texto) return "";
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

// --- LÓGICA DE CARGA PRINCIPAL DEL SPREADSHEET ---
async function cargar() {
    await esperarDependencias(); 
    inicializarGridAlergenos(); 
    UI_INTERNA.log("⏳ Cargando datos desde Google Sheets...");
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

// --- TRADUCCIONES AUTOMÁTICAS ---
async function ejecutarTraduccionAutomatica() {
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

// --- INTERFACES DE INTERACCIÓN DE USUARIO (MODALES Y BOTONES) ---
function abrirEditor(id) {
    platoEditandoId = id;
    const plato = datosLocales.find(p => p.id === id);
    if (!plato) return;

    esNuevoPlato = false;
    document.getElementById('modal-titulo').innerText = `Editar Elemento (ID: ${id})`;
    document.getElementById('edit-es').value = plato.es || "";
    document.getElementById('edit-precio').value = plato.precio || "0.00";
    document.getElementById('edit-imagen').value = plato.imagen || "";

    const keysLang = Object.keys(IDIOMAS_CONFIG);
    keysLang.forEach(lang => {
        const langLower = lang.toLowerCase();
        const inputNombre = document.getElementById(`edit-${langLower}`);
        if (inputNombre) {
            inputNombre.value = plato[langLower] || "";
        }
        const inputUvas = document.getElementById(`edit-${langLower}-uvas`);
        if (inputUvas) {
            inputUvas.value = plato[`${langLower}-uvas`] || plato[`uvas-${langLower}`] || "";
        }
    });

    // --- CARGAR ALÉRGENOS EN LA INTERFAZ DE BOTONES ---
    alergenosSeleccionadosTemporales = [];
    if (plato.alergenos) {
        // Separa el texto plano por comas, espacios o barras y lo pasa a mayúsculas para emparejar
        const fragmentos = plato.alergenos.toUpperCase().split(/[\s,;|]+/);
        LISTA_ALERGENOS.forEach(al => {
            if (fragmentos.includes(al.id)) {
                alergenosSeleccionadosTemporales.push(al.id);
            }
        });
    }

    // Dibujar los botones con sus respectivos colores asignados
    renderizarBotoneraAlergenos();

    document.getElementById('modal-editor').style.display = "block";
}

function abrirSelector() {
    document.getElementById('modal-selector').style.display = "block";
}

function cerrarModal(id) {
    document.getElementById(id).style.display = "none";
}

function toggleActivo(id) {
    const plato = datosLocales.find(p => p.id === id);
    if (plato) {
        plato.activa = !plato.activa;
        UI_INTERNA.log("Estado modificado localmente. Recuerda guardar cambios.", "success");
        renderizar();
    }
}

// --- CONTROLADOR DE APLICAR CAMBIOS ---
function aplicarCambiosPlato() { 
    const plato = datosLocales.find(p => p.id === platoEditandoId);
    if (plato) {
        plato.es = document.getElementById('edit-es').value;
        let pVal = document.getElementById('edit-precio').value;
        plato.precio = pVal ? parseFloat(pVal).toFixed(2) : "0.00";
        plato.imagen = document.getElementById('edit-imagen').value;

        const keysLang = Object.keys(IDIOMAS_CONFIG);
        keysLang.forEach(lang => {
            const langLower = lang.toLowerCase();
            const inputNombre = document.getElementById(`edit-${langLower}`);
            if (inputNombre) {
                plato[langLower] = inputNombre.value;
            }
            const inputUvas = document.getElementById(`edit-${langLower}-uvas`);
            if (inputUvas) {
                plato[`${langLower}-uvas`] = inputUvas.value;
            }
        });

        // --- SALVAR ALÉRGENOS DESDE LA INTERFAZ DE BOTONES HACIA LA HOJA LOCAL ---
        // Se unen mediante comas respetando el formato plano original en Mayúsculas exigido por tu Script
        plato.alergenos = alergenosSeleccionadosTemporales.join(', ');
    }
    cerrarModal('modal-editor'); 
    renderizar(); 
} 

function enviarAlExcel() { alert("Simulación: Datos sincronizados de vuelta a Google Sheets."); } 
function prepararNuevoPlato(catId) { cerrarModal('modal-selector'); alert(`Listo para añadir en categoría base: ${catId}`); } 
function comprobarRequisitosTraduccion() {}

// --- ASIGNACIONES GLOBALES ---
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
window.validarPrecio = validarPrecio;

// Inicialización
document.addEventListener('DOMContentLoaded', cargar);
