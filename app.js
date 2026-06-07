const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT9rPlxpax2lE0rN97c6Hoy_OxUwREqRb48juEBr9C91ZFY2UvaKgC8JdiRcwDrtBErXFVmFRh0Zr5e/pub?gid=0&single=true&output=csv';
const URL_GEMINI = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

let datosLocales = [];
let platoEditandoId = null;
let esNuevoPlato = false; 
let datosTempNuevo = null; 

// --- LISTA MAESTRA DE ALÉRGENOS ---
const LISTA_ALERGENOS = [
    { id: "gluten", nombre: "Gluten", icono: "🌾" },
    { id: "crustaceos", nombre: "Crustáceos", icono: "🦀" },
    { id: "huevos", nombre: "Huevos", icono: "🥚" },
    { id: "pescado", nombre: "Pescado", icono: "🐟" },
    { id: "cacahuetes", nombre: "Cacahuetes", icono: "🥜" },
    { id: "soja", nombre: "Soja", icono: "🫘" },
    { id: "lacteos", nombre: "Lácteos", icono: "🥛" },
    { id: "frutos_cascara", nombre: "Frutos de Cáscara", icono: "🌰" },
    { id: "apio", nombre: "Apio", icono: "🌱" },
    { id: "mostaza", nombre: "Mostaza", icono: "🏺" },
    { id: "sesamo", nombre: "Sésamo", icono: "🥯" },
    { id: "sulfitos", nombre: "Sulfitos", icono: "🍷" },
    { id: "altramuces", nombre: "Altramuces", icono: "🌼" },
    { id: "moluscos", nombre: "Moluscos", icono: "🦑" }
];

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

// --- INICIALIZADOR DEL GRID DE ALÉRGENOS EN EL DOM ---
function inicializarGridAlergenos() {
    const grid = document.getElementById('alergenos-grid');
    if (!grid) return;
    
    grid.innerHTML = "";
    LISTA_ALERGENOS.forEach(al => {
        const item = document.createElement('label');
        item.style.cssText = "display: flex; align-items: center; gap: 8px; background: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer; font-size: 0.85rem; font-weight: 600;";
        item.innerHTML = `
            <input type="checkbox" id="chk-alergeno-${al.id}" value="${al.id}" style="cursor:pointer;">
            <span>${al.icono} ${al.nombre}</span>
        `;
        grid.appendChild(item);
    });
}

// --- MOTOR DE RENDERIZADO DINÁMICO ---
function renderizar() {
    console.log("Datos listos para renderizar:", datosLocales);
    const contenedor = document.getElementById('editor-dinamico');
    if (!contenedor) return;

    // Limpiamos el contenedor antes de renderizar la lista real
    contenedor.innerHTML = "";

    // Recorremos la estructura maestra declarada en languages.js
    ESTRUCTURA.forEach(cat => {
        // Buscamos si hay platos cargados que correspondan al rango de IDs de esta categoría
        let platosDeCategoria = [];
        
        if (cat.sub && cat.sub.length > 0) {
            // Caso para categorías con subsecciones específicas (como los Vinos o Arroces)
            cat.sub.forEach(subcat => {
                const maxId = subcat.max || (subcat.id + 99);
                const filtrados = datosLocales.filter(p => p.id >= subcat.id && p.id <= maxId);
                platosDeCategoria = platosDeCategoria.concat(filtrados);
            });
        } else {
            // Caso para categorías directas usando su ID base y un rango estándar (como Postres o Cervezas)
            const maxId = cat.id + (cat.rango || 999);
            platosDeCategoria = datosLocales.filter(p => p.id >= cat.id && p.id <= maxId);
        }

        // Si la categoría tiene platos asociados, dibujamos su tarjeta contenedora
        if (platosDeCategoria.length > 0) {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'categoria-tarjeta';

            // Cabecera de la categoría utilizando el nombre mapeado
            let HTMLTarjeta = `
                <div class="categoria-titulo">
                    ${cat.name.toUpperCase()} (${platosDeCategoria.length})
                </div>
                <div class="categoria-cuerpo">
            `;

            // Construcción de la fila/item para cada plato individual de la lista
            platosDeCategoria.forEach((plato, index) => {
                const checkedAttr = plato.activa ? 'checked' : '';
                
                // Deshabilitar flechas si están en los extremos de su propia categoría
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

            HTMLTarjeta += `</div>`; // Cierre de categoria-cuerpo
            tarjeta.innerHTML = HTMLTarjeta;
            contenedor.appendChild(tarjeta);
        }
    });

    // Si tras procesar todo no encontramos elementos que encajen en ESTRUCTURA
    if (contenedor.innerHTML === "") {
        contenedor.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--texto);">No se encontraron elementos que coincidan con los rangos numéricos de las categorías configuradas.</p>`;
    }
}

// --- MOTOR DE REORDENAMIENTO DE PLATOS (FLECHAS) ---
function moverPlato(id, direccion) {
    const indexActual = datosLocales.findIndex(p => p.id === id);
    if (indexActual === -1) return;

    const platoActual = datosLocales[indexActual];

    // Encontrar la categoría actual para mover el plato sólo dentro de sus límites correspondientes
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
            // Mapeamos los límites reales basados en el algoritmo de renderizado
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

    // Filtrar todos los platos pertenecientes a esa categoría que existen en el array global
    const platosFiltrados = datosLocales.filter(p => p.id >= minIdCat && p.id <= maxIdCat);
    const subIndexActual = platosFiltrados.findIndex(p => p.id === id);

    if (direccion === 'arriba' && subIndexActual > 0) {
        const platoAnterior = platosFiltrados[subIndexActual - 1];
        const indexAnteriorEnGlobal = datosLocales.findIndex(p => p.id === platoAnterior.id);
        
        // Intercambio de posiciones en el array maestro
        datosLocales[indexActual] = platoAnterior;
        datosLocales[indexAnteriorEnGlobal] = platoActual;
    } else if (direccion === 'abajo' && subIndexActual < platosFiltrados.length - 1) {
        const platoSiguiente = platosFiltrados[subIndexActual + 1];
        const indexSiguienteEnGlobal = datosLocales.findIndex(p => p.id === platoSiguiente.id);
        
        // Intercambio de posiciones en el array maestro
        datosLocales[indexActual] = platoSiguiente;
        datosLocales[indexAnteriorEnGlobal] = platoActual;
    }

    renderizar();
}

// --- VALIDACIÓN DE PRECIO EN TIEMPO REAL (SOLO NÚMEROS Y 2 DECIMALES) ---
function validarPrecio(input) {
    let valor = input.value;
    
    // Reemplaza comas por puntos para homogeneizar la entrada de decimales
    valor = valor.replace(/,/g, '.');
    
    // Elimina cualquier caracter que no sea un dígito o un punto decimal
    valor = valor.replace(/[^0-9.]/g, '');
    
    // Si hay más de un punto decimal, deja únicamente el primero
    const partes = valor.split('.');
    if (partes.length > 2) {
        valor = partes[0] + '.' + partes.slice(1).join('');
    }
    
    // Restringe a un máximo de 2 dígitos decimales
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
    
    // Rellena de forma dinámica el modal de asignación rápida para cuando se quiera añadir un nuevo plato
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
    inicializarGridAlergenos(); // Crear el grid visual en el modal apenas inicie la app
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

    // Importación dinámica de los campos de idiomas adicionales
    const keysLang = Object.keys(IDIOMAS_CONFIG);
    keysLang.forEach(lang => {
        const langLower = lang.toLowerCase();
        
        // Asignar nombres principales de idiomas
        const inputNombre = document.getElementById(`edit-${langLower}`);
        if (inputNombre) {
            inputNombre.value = plato[langLower] || "";
        }
        
        // Asignar nombres secundarios de detalles/uvas
        const inputUvas = document.getElementById(`edit-${langLower}-uvas`);
        if (inputUvas) {
            inputUvas.value = plato[`${langLower}-uvas`] || plato[`uvas-${langLower}`] || "";
        }
    });

    // --- LEER Y MOSTRAR LOS ALÉRGENOS GUARDADOS ---
    // Desmarcar todos primero
    LISTA_ALERGENOS.forEach(al => {
        const chk = document.getElementById(`chk-alergeno-${al.id}`);
        if (chk) chk.checked = false;
    });

    // Marcar los correspondientes si el plato los posee en su string (separados por coma u otro carácter)
    if (plato.alergenos) {
        const AlergenosPlato = plato.alergenos.toLowerCase().split(/[\s,;|]+/); // Tolera espacios, comas o puntos y coma
        LISTA_ALERGENOS.forEach(al => {
            const chk = document.getElementById(`chk-alergeno-${al.id}`);
            if (chk && AlergenosPlato.includes(al.id.toLowerCase())) {
                chk.checked = true;
            }
        });
    }

    // Abre el modal manipulando el estilo directo de tus CSS
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

        // Guardar dinámicamente todos los idiomas procesados en el modal
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

        // --- RECOPILAR Y GUARDAR LOS ALÉRGENOS SELECCIONADOS ---
        let alergenosSeleccionados = [];
        LISTA_ALERGENOS.forEach(al => {
            const chk = document.getElementById(`chk-alergeno-${al.id}`);
            if (chk && chk.checked) {
                alergenosSeleccionados.push(al.id);
            }
        });
        // Lo unimos con comas para que mantenga el formato plano compatible con tu CSV
        plato.alergenos = alergenosSeleccionados.join(', ');
    }
    cerrarModal('modal-editor'); 
    renderizar(); 
} 
function enviarAlExcel() { alert("Simulación: Datos sincronizados de vuelta a Google Sheets."); } 
function prepararNuevoPlato(catId) { cerrarModal('modal-selector'); alert(`Listo para añadir en categoría base: ${catId}`); } 
function comprobarRequisitosTraduccion() {}

// --- ASIGNACIONES GLOBALES (Para interactuar desde el HTML) ---
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
