(function () {
    'use strict';

    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        
        /* Contenedor A4 */
        .sugerencias-panel { 
            background: #ffffff !important; 
            padding: 40px !important; 
            width: 210mm !important; 
            min-height: 297mm !important; 
            margin: 0 auto !important; 
            font-family: 'Montserrat', sans-serif !important;
            box-sizing: border-box !important;
        }
        
        .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 40px !important; }
        .sugerencias-brand-title-group { display: flex !important; flex-direction: column !important; gap: 5px !important; }
        .sugerencias-title-es { font-weight: 300 !important; font-size: 2.2rem !important; color: #e05a2b !important; text-transform: uppercase !important; margin:0 !important; }
        .sugerencias-title-en { font-weight: 300 !important; font-size: 1.6rem !important; color: #0d5c63 !important; text-transform: uppercase !important; margin:0 !important; }
        
        /* Logo con tamaño controlado */
        .sugerencias-logo-img { width: 220px !important; height: auto !important; }
        
        .sugerencias-seccion { margin-bottom: 25px !important; }
        .sugerencias-seccion-titulo { font-size: 0.9rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; margin-bottom: 15px !important; text-transform: uppercase !important; }
        
        .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 12px !important; width: 100% !important; }
        
        /* MODIFICADO: El contenedor de nombres toma el espacio que necesita y cede el sobrante a los puntos */
        .sugerencias-plato-nombres { 
            flex: 0 1 auto !important; 
            max-width: 80% !important;
            display: flex !important; 
            flex-direction: column !important; 
        }
        
        .sugerencias-nombre-es { font-size: 0.95rem !important; font-weight: 600 !important; color: #1e293b !important; }
        .sugerencias-nombre-en { font-size: 0.8rem !important; color: #64748b !important; font-style: italic !important; }
        
        /* MODIFICADO: Los puntos ocupan únicamente el espacio que dejan los nombres */
        .sugerencias-puntos { 
            flex: 1 !important; 
            border-bottom: 1px dotted #94a3b8 !important; 
            margin: 0 10px !important; 
            height: 1px !important; 
        }
        
        .sugerencias-precio { font-size: 0.95rem !important; font-weight: 700 !important; flex-shrink: 0 !important; }
        
        /* Footer con QR controlado */
        .sugerencias-footer { margin-top: auto !important; border-top: 1px solid #e2e8f0 !important; padding-top: 20px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
        .sugerencias-aviso { font-size: 0.75rem !important; color: #64748b !important; max-width: 60% !important; }
        .sugerencias-qr-img { width: 80px !important; height: 80px !important; object-fit: contain !important; }
        
        @media print { body { -webkit-print-color-adjust: exact !important; } }
    `;
    document.head.appendChild(stylePrint);

    function cargarCarta() {
        // MODIFICADO: Verificar si los datos han sido cargados mirando el indicador de estado del sistema
        const statusCarga = document.getElementById('status-carga');
        const isLoaded = statusCarga && statusCarga.innerText.includes('✅');

        // MODIFICADO: Si los datos no existen, o están vacíos y aún no termina la carga, reintentar en 500ms
        if (typeof datosLocales === 'undefined' || (datosLocales.length === 0 && !isLoaded)) { 
            setTimeout(cargarCarta, 500); 
            return; 
        }
        
        const contenedor = document.querySelector('.sugerencias-panel');
        if (!contenedor) return;

        // MODIFICADO: Restringir estrictamente el filtrado a IDs de Sugerencias (12000-12999)
        const activosSugerencias = datosLocales.filter(p => p.activa && p.id >= 12000 && p.id <= 12999);

        let entrantes = [];
        let principales = [];
        let postres = [];
        let vinos = [];

        // MODIFICADO: Clasificación inteligente basada en rangos de ID para evitar falsos positivos con la palabra "vino"
        activosSugerencias.forEach(p => {
            const id = p.id;
            const nombreEs = desglosarNombre(p.es).nombre.toLowerCase();
            
            // 1. El ID especial 12990 va a vinos, o si contiene "vino" pero NO es "copa" ni "vinagreta" (para evitar el salpicón)
            if (id === 12990 || (nombreEs.includes('vino') && !nombreEs.includes('copa') && !nombreEs.includes('vinagreta'))) {
                vinos.push(p);
            } 
            // 2. Rango de Entrantes y Croquetas
            else if (id >= 12100 && id <= 12399) {
                entrantes.push(p);
            } 
            // 3. Rango de Principales
            else if (id >= 12400 && id <= 12899) {
                principales.push(p);
            } 
            // 4. Rango de Postres
            else if (id >= 12900 && id <= 12999) {
                postres.push(p);
            } 
            // 5. Fallback para IDs entre 12000-12099
            else {
                entrantes.push(p);
            }
        });

        let html = `
            <div class="sugerencias-header-layout">
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">SUGERENCIAS DEL CHEF</div>
                    <div class="sugerencias-title-en">CHEF'S SUGGESTIONS</div>
                </div>
                <img src="logo RG_REST.png" class="sugerencias-logo-img">
            </div>
        `;

        const renderCat = (titulo, lista) => {
            if (lista.length === 0) return '';
            let h = `<div class="sugerencias-seccion"><div class="sugerencias-seccion-titulo">${titulo}</div>`;
            lista.forEach(p => {
                h += `
                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <span class="sugerencias-nombre-es">${desglosarNombre(p.es).nombre}</span>
                            <span class="sugerencias-nombre-en">${desglosarNombre(p.en).nombre}</span>
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">${p.precio}€</div>
                    </div>`;
            });
            return h + `</div>`;
        };

        html += renderCat('Entrantes / Starters', entrantes);
        html += renderCat('Platos Principales / Main Courses', principales);
        html += renderCat('Postres / Desserts', postres);
        html += renderCat('Vinos Recomendados / Recommended Wines', vinos);

        html += `
            <div class="sugerencias-footer">
                <div class="sugerencias-aviso">
                    ⚠️ Si usted tiene algún tipo de alergia alimentaria, por favor comuníquelo a nuestro personal.<br>
                    If you have any food allergies, please inform our staff.
                </div>
                <img src="qr-code.png" class="sugerencias-qr-img" alt="QR Menu">
            </div>
        `;
        
        contenedor.innerHTML = html;
    }

    // NUEVO: Sobrescribir la función global de app.js para que index.html ejecute esta (la A4) al cambiar de pestaña
    window.renderizarSugerencias = cargarCarta;

    cargarCarta();
})();
