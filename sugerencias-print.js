(function () {
    'use strict';

    // Inyectamos los estilos necesarios
    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        
        .sugerencias-panel { 
            background: #ffffff !important; 
            padding: 50px !important; 
            width: 210mm !important; 
            min-height: 297mm !important; 
            margin: 0 auto !important; 
            font-family: 'Montserrat', sans-serif !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
        }

        .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 40px !important; }
        .sugerencias-brand-title-group { display: flex !important; flex-direction: column !important; gap: 5px !important; }
        .sugerencias-title-es { font-weight: 300 !important; font-size: 2.2rem !important; color: #e05a2b !important; text-transform: uppercase !important; margin:0 !important; }
        .sugerencias-title-en { font-weight: 300 !important; font-size: 1.6rem !important; color: #0d5c63 !important; text-transform: uppercase !important; margin:0 !important; }
        .sugerencias-logo-img { width: 220px !important; height: auto !important; }
        
        .sugerencias-body { flex: 1 !important; }
        .sugerencias-seccion { margin-bottom: 25px !important; }
        .sugerencias-seccion-titulo { font-size: 0.9rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; margin-bottom: 15px !important; text-transform: uppercase !important; }
        
        .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 12px !important; }
        .sugerencias-plato-nombres { flex: 1 !important; display: flex !important; flex-direction: column !important; }
        .sugerencias-nombre-es { font-size: 0.95rem !important; font-weight: 600 !important; color: #1e293b !important; }
        .sugerencias-nombre-en { font-size: 0.8rem !important; color: #64748b !important; font-style: italic !important; }
        .sugerencias-puntos { flex: 1 !important; border-bottom: 1px dotted #94a3b8 !important; margin: 0 10px !important; height: 1px !important; }
        .sugerencias-precio { font-size: 0.95rem !important; font-weight: 700 !important; }
        
        /* Footer fijado al final */
        .sugerencias-footer { margin-top: auto !important; border-top: 1px solid #e2e8f0 !important; padding-top: 20px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
        .sugerencias-aviso { font-size: 0.75rem !important; color: #64748b !important; max-width: 70% !important; }
        .sugerencias-qr-img { width: 80px !important; height: 80px !important; }
    `;
    document.head.appendChild(stylePrint);

    function renderizar() {
        // Validación de datos
        if (typeof datosLocales === 'undefined' || !Array.isArray(datosLocales)) {
            setTimeout(renderizar, 300);
            return;
        }

        const panel = document.querySelector('.sugerencias-panel');
        if (!panel) return;

        const activos = datosLocales.filter(p => p.activa);
        const entrantes = activos.filter(p => p.id >= 12000 && p.id <= 12399);
        const principales = activos.filter(p => p.id >= 12400 && p.id <= 12899);
        const postres = activos.filter(p => p.id >= 12900 && p.id <= 12999 && p.id !== 12990);
        const vinos = activos.filter(p => p.id === 12990 || desglosarNombre(p.es).nombre.toLowerCase().includes('vino'));

        const renderCat = (titulo, lista) => {
            if (lista.length === 0) return '';
            return `
                <div class="sugerencias-seccion">
                    <div class="sugerencias-seccion-titulo">${titulo}</div>
                    ${lista.map(p => `
                        <div class="sugerencias-plato">
                            <div class="sugerencias-plato-nombres">
                                <span class="sugerencias-nombre-es">${desglosarNombre(p.es).nombre}</span>
                                <span class="sugerencias-nombre-en">${desglosarNombre(p.en).nombre}</span>
                            </div>
                            <div class="sugerencias-puntos"></div>
                            <div class="sugerencias-precio">${p.precio}€</div>
                        </div>
                    `).join('')}
                </div>`;
        };

        panel.innerHTML = `
            <div class="sugerencias-header-layout">
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">SUGERENCIAS DEL CHEF</div>
                    <div class="sugerencias-title-en">CHEF'S SUGGESTIONS</div>
                </div>
                <img src="logo RG_REST.png" class="sugerencias-logo-img">
            </div>
            <div class="sugerencias-body">
                ${renderCat('Entrantes / Starters', entrantes)}
                ${renderCat('Platos Principales / Main Courses', principales)}
                ${renderCat('Postres / Desserts', postres)}
                ${renderCat('Vinos Recomendados / Recommended Wines', vinos)}
            </div>
            <div class="sugerencias-footer">
                <div class="sugerencias-aviso">
                    ⚠️ Si usted tiene algún tipo de alergia alimentaria, por favor comuníquelo a nuestro personal.<br>
                    If you have any food allergies, please inform our staff.
                </div>
                <img src="qr-code.png" class="sugerencias-qr-img">
            </div>
        `;
    }

    renderizar();
})();
