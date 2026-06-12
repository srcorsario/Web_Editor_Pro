// =========================================================================
// ARCHIVO: sugerencias-print.js
// MODIFICADO: Clasificación por ID (12000-12399 Entrantes, 12400-12899 Principales, 12900-12999 Postres).
// MODIFICADO: Logo ampliado.
// =========================================================================

(function () {
    'use strict';

    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');

        .sugerencias-panel {
            background: #ffffff !important;
            color: #333333 !important;
            padding: 50px 60px !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            margin: 15px auto !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            font-family: 'Montserrat', sans-serif !important;
        }

        .sugerencias-header-layout {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 50px !important;
            width: 100% !important;
        }

        /* LOGO AMPLIADO */
        .sugerencias-logo-rg {
            width: 240px !important; 
            height: auto !important;
            object-fit: contain !important;
        }

        .sugerencias-title-es { font-family: 'Montserrat', sans-serif !important; font-weight: 300 !important; font-size: 2.4rem !important; color: #e05a2b !important; line-height: 0.95 !important; text-transform: uppercase !important; margin: 0 !important; }
        .sugerencias-title-en { font-family: 'Montserrat', sans-serif !important; font-weight: 300 !important; font-size: 1.8rem !important; color: #0d5c63 !important; line-height: 0.95 !important; text-transform: uppercase !important; margin-top: 8px !important; }

        .sugerencias-body-menu { flex-grow: 1 !important; display: flex !important; flex-direction: column !important; gap: 35px !important; }

        .sugerencias-categoria-titulo { font-size: 0.9rem !important; font-weight: 700 !important; color: #d97706 !important; text-transform: uppercase !important; letter-spacing: 1.5px !important; border-bottom: 2px solid #334155 !important; padding-bottom: 8px !important; margin-bottom: 20px !important; }

        .sugerencias-item-plato { display: flex !important; align-items: baseline !important; margin-bottom: 22px !important; page-break-inside: avoid !important; }
        .sugerencias-item-textos { flex: 0 0 auto !important; max-width: 80% !important; }
        .sugerencias-plato-es { font-size: 1rem !important; font-weight: 600 !important; color: #1e293b !important; }
        .sugerencias-plato-en { font-size: 0.85rem !important; color: #64748b !important; font-style: italic !important; }
        .sugerencias-item-puntos { flex: 1 !important; border-bottom: 1.5px dotted #cbd5e1 !important; margin: 0 12px !important; position: relative !important; top: -3px !important; }
        .sugerencias-item-precio { font-size: 1rem !important; font-weight: 700 !important; }

        .sugerencias-footer-layout { display: flex !important; justify-content: space-between !important; align-items: flex-end !important; margin-top: 40px !important; padding-top: 20px !important; border-top: 1px solid #e2e8f0 !important; }
        .sugerencias-info-legal { font-size: 0.75rem !important; color: #64748b !important; max-width: 65% !important; }
        .sugerencias-qr-box { width: 130px !important; height: 130px !important; }

        @media print { @page { size: A4 portrait; margin: 0; } body > :not(.sugerencias-panel) { display: none !important; } }
    `;
    document.head.appendChild(stylePrint);

    function renderizarBloque(titulo, lista) {
        if (!lista || lista.length === 0) return '';
        return `
            <div class="sugerencias-categoria-block">
                <div class="sugerencias-categoria-titulo">${titulo}</div>
                ${lista.map(p => `
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">${desglosarNombre(p.es).nombre}</div>
                            <div class="sugerencias-plato-en">${desglosarNombre(p.en).nombre}</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">${p.precio}€</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function inicializarPestañaSugerenciasA4() {
        const panelContenedor = document.querySelector('.sugerencias-panel');
        if (!panelContenedor || typeof datosLocales === 'undefined') return;

        // Filtrado por rangos de ID como acordamos
        const activos = datosLocales.filter(p => p.activa);
        const entrantes = activos.filter(p => p.id >= 12000 && p.id <= 12399);
        const principales = activos.filter(p => p.id >= 12400 && p.id <= 12899);
        const postres = activos.filter(p => p.id >= 12900 && p.id <= 12999);
        const vinos = activos.filter(p => p.id >= 13000);

        panelContenedor.innerHTML = `
            <div class="sugerencias-header-layout">
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">SUGERENCIAS<br>DEL CHEF</div>
                    <div class="sugerencias-title-en">CHEF'S<br>SUGGESTIONS</div>
                </div>
                <img src="logo RG_REST.png" alt="Logo" class="sugerencias-logo-rg" onerror="this.style.display='none';">
            </div>

            <div class="sugerencias-body-menu">
                ${renderizarBloque('Entrantes / Starters', entrantes)}
                ${renderizarBloque('Platos Principales / Main Courses', principales)}
                ${renderizarBloque('Postres / Desserts', postres)}
                ${renderizarBloque('Vinos Recomendados / Recommended Wines', vinos)}
            </div>

            <div class="sugerencias-footer-layout">
                <div class="sugerencias-info-legal">
                    ⚠️ Si usted tiene algún tipo de alergia alimentaria, por favor comuníquelo a nuestro personal.
                </div>
                <div class="sugerencias-qr-box">
                    <img src="qr-code.png" alt="QR" class="sugerencias-qr-element" onerror="this.style.display='none';">
                </div>
            </div>
        `;
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicializarPestañaSugerenciasA4);
    else inicializarPestañaSugerenciasA4();
})();
