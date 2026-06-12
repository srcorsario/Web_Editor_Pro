// =========================================================================
// ARCHIVO: sugerencias-print.js
// RESTAURADO: Diseño fiel al original, logo grande y filtrado estricto.
// =========================================================================

(function () {
    'use strict';

    // CSS con el diseño original preservado
    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');
        
        .sugerencias-panel { background: #ffffff !important; padding: 50px !important; max-width: 210mm !important; margin: auto !important; font-family: 'Montserrat', sans-serif !important; }
        .sugerencias-top-row { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 20px !important; }
        .sugerencias-titulo-dia { font-size: 2rem !important; color: #333 !important; text-transform: uppercase !important; }
        
        /* Logo ampliado */
        .sugerencias-logo-img { width: 280px !important; height: auto !important; }
        
        .sugerencias-subheader { margin-bottom: 40px !important; text-align: center !important; }
        .sugerencias-header-img { width: 100% !important; max-width: 600px !important; height: auto !important; }
        
        .sugerencias-seccion { margin-bottom: 30px !important; }
        .sugerencias-seccion-titulo { font-size: 1.1rem !important; font-weight: 700 !important; color: #d97706 !important; border-bottom: 2px solid #334155 !important; padding-bottom: 5px !important; margin-bottom: 15px !important; text-transform: uppercase !important; }
        
        .sugerencias-plato { display: flex !important; align-items: baseline !important; margin-bottom: 15px !important; }
        .sugerencias-plato-nombres { flex: 1 !important; }
        .sugerencias-nombre-es { font-size: 1rem !important; font-weight: 600 !important; color: #1e293b !important; }
        .sugerencias-nombre-en { font-size: 0.85rem !important; color: #64748b !important; font-style: italic !important; }
        .sugerencias-puntos { flex: 1 !important; border-bottom: 1px dotted #94a3b8 !important; margin: 0 10px !important; }
        .sugerencias-precio { font-size: 1rem !important; font-weight: 700 !important; }
        
        .sugerencias-footer { margin-top: 50px !important; border-top: 1px solid #e2e8f0 !important; padding-top: 20px !important; display: flex !important; justify-content: space-between !important; align-items: center !important; }
        .sugerencias-aviso { font-size: 0.8rem !important; color: #64748b !important; }
        .sugerencias-qr-img { width: 120px !important; }
    `;
    document.head.appendChild(stylePrint);

    function cargarCarta() {
        if (typeof datosLocales === 'undefined' || datosLocales.length === 0) {
            setTimeout(cargarCarta, 500);
            return;
        }

        const contenedor = document.querySelector('.sugerencias-panel');
        if (!contenedor) return;

        // FILTRADO ESTRICTO: Solo IDs de Sugerencias (12000-12999)
        // Esto evita que aparezca la lista general de vinos o platos principales
        const platosSugerencias = datosLocales.filter(p => p.activa && p.id >= 12000 && p.id <= 12999);
        
        const entrantes = platosSugerencias.filter(p => p.id >= 12000 && p.id <= 12399);
        const principales = platosSugerencias.filter(p => p.id >= 12400 && p.id <= 12899);
        const postres = platosSugerencias.filter(p => p.id >= 12900 && p.id <= 12999);
        const vinosSugerencia = platosSugerencias.filter(p => desglosarNombre(p.es).nombre.toLowerCase().includes('vino'));

        // Reconstrucción del HTML fiel al original
        let html = `
            <div class="sugerencias-top-row">
                <h2 class="sugerencias-titulo-dia">Sugerencias del día</h2>
                <img src="logo RG_REST.png" class="sugerencias-logo-img" alt="Logo">
            </div>
            <div class="sugerencias-subheader">
                <img src="https://z-cdn-media.chatglm.cn/files/ea3128c5-540d-482e-adee-1ecbc193dd9c.png" class="sugerencias-header-img">
            </div>
        `;

        const renderCat = (titulo, lista) => {
            if (lista.length === 0) return '';
            let h = `<div class="sugerencias-seccion"><div class="sugerencias-seccion-titulo">${titulo}</div>`;
            lista.forEach(p => {
                h += `<div class="sugerencias-plato">
                    <div class="sugerencias-plato-nombres">
                        <div class="sugerencias-nombre-es">${desglosarNombre(p.es).nombre}</div>
                        <div class="sugerencias-nombre-en">${desglosarNombre(p.en).nombre}</div>
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
                <div class="sugerencias-aviso">⚠️ Si tiene alguna alergia, por favor comuníquelo a nuestro personal.</div>
                <img src="qr-code.png" class="sugerencias-qr-img">
            </div>
        `;

        contenedor.innerHTML = html;
    }

    cargarCarta();
})();
