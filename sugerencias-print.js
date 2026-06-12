(function () {
    'use strict';

    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        
        .sugerencias-panel { background: #ffffff !important; padding: 50px !important; max-width: 210mm !important; margin: auto !important; font-family: 'Montserrat', sans-serif !important; }
        
        /* Cabecera Completa */
        .sugerencias-header-layout { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 40px !important; }
        .sugerencias-brand-title-group { display: flex !important; flex-direction: column !important; gap: 8px !important; }
        .sugerencias-title-es { font-weight: 300 !important; font-size: 2.2rem !important; color: #e05a2b !important; line-height: 1 !important; text-transform: uppercase !important; }
        .sugerencias-title-en { font-weight: 300 !important; font-size: 1.6rem !important; color: #0d5c63 !important; line-height: 1 !important; text-transform: uppercase !important; }
        .sugerencias-logo-img { width: 280px !important; height: auto !important; }
        
        /* Secciones y Platos */
        .sugerencias-seccion { margin-bottom: 30px !important; }
        .sugerencias-seccion-titulo { font-size: 0.9rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; padding-bottom: 5px !important; margin-bottom: 15px !important; text-transform: uppercase !important; }
        
        .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 12px !important; }
        .sugerencias-plato-nombres { display: flex !important; flex-direction: column !important; }
        .sugerencias-nombre-es { font-size: 0.95rem !important; font-weight: 600 !important; color: #1e293b !important; }
        .sugerencias-nombre-en { font-size: 0.8rem !important; color: #64748b !important; font-style: italic !important; }
        .sugerencias-puntos { flex: 1 !important; border-bottom: 1px dotted #94a3b8 !important; margin: 0 10px !important; position: relative !important; top: -5px !important; }
        .sugerencias-precio { font-size: 0.95rem !important; font-weight: 700 !important; color: #1e293b !important; }
        
        /* Footer Completo */
        .sugerencias-footer { margin-top: 50px !important; border-top: 1px solid #e2e8f0 !important; padding-top: 20px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
        .sugerencias-aviso { font-size: 0.8rem !important; color: #64748b !important; line-height: 1.4 !important; max-width: 70% !important; }
        .sugerencias-qr-img { width: 120px !important; height: auto !important; }
    `;
    document.head.appendChild(stylePrint);

    function cargarCarta() {
        if (typeof datosLocales === 'undefined') { setTimeout(cargarCarta, 500); return; }

        const contenedor = document.querySelector('.sugerencias-panel');
        if (!contenedor) return;

        const platosSugerencias = datosLocales.filter(p => p.activa && p.id >= 12000 && p.id <= 12999);
        
        const entrantes = platosSugerencias.filter(p => p.id >= 12000 && p.id <= 12399);
        const principales = platosSugerencias.filter(p => p.id >= 12400 && p.id <= 12899);
        const postres = platosSugerencias.filter(p => p.id >= 12900 && p.id <= 12999 && p.id !== 12990);
        const vinosSugerencia = platosSugerencias.filter(p => p.id === 12990 || desglosarNombre(p.es).nombre.toLowerCase().includes('vino'));

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
        html += renderCat('Vinos Recomendados / Recommended Wines', vinosSugerencia);

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

    cargarCarta();
})();
