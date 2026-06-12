// =========================================================================
// ARCHIVO: sugerencias-print.js (COMPONENTE INTEGRAL DE IMPRESIÓN A4)
// MODIFICADO: Restaurada la estructura vertical fluida.
// MODIFICADO: Optimización de espacios para evitar amontonamiento.
// =========================================================================

(function () {
    'use strict';

    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');

        .sugerencias-panel {
            background: #ffffff !important;
            color: #333333 !important;
            padding: 40px 50px !important;
            max-width: 210mm !important;
            min-height: 297mm !important;
            margin: 15px auto !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important;
            position: relative !important;
            font-family: 'Montserrat', sans-serif !important;
        }

        .sugerencias-header-layout {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 40px !important;
            width: 100% !important;
        }

        .sugerencias-brand-title-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
        }

        .sugerencias-title-es {
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 300 !important;
            font-size: 2.15rem !important;
            color: #e05a2b !important;
            line-height: 0.95 !important;
            text-transform: uppercase !important;
            margin: 0 !important;
        }

        .sugerencias-title-en {
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 300 !important;
            font-size: 1.7rem !important;
            color: #0d5c63 !important;
            line-height: 0.95 !important;
            text-transform: uppercase !important;
            margin-top: 4px !important;
        }

        .sugerencias-logo-rg {
            width: 180px !important;
            height: auto !important;
            object-fit: contain !important;
        }

        .sugerencias-body-menu {
            flex-grow: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 30px !important; /* MODIFICADO: Espacio uniforme entre categorías */
        }

        /* MODIFICADO: Eliminado Grid, vuelta al flujo normal con márgenes amplios */
        .sugerencias-categoria-block {
            margin-bottom: 10px !important;
        }

        /* Sección de vinos al fondo */
        .sugerencias-vinos-bottom {
            margin-top: auto !important;
            margin-bottom: 20px !important;
        }

        .sugerencias-categoria-titulo {
            font-size: 0.85rem !important;
            font-weight: 700 !important;
            color: #d97706 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            border-bottom: 2px solid #334155 !important;
            padding-bottom: 6px !important;
            margin-bottom: 20px !important; /* Más aire bajo el título */
        }

        .sugerencias-item-plato {
            display: flex !important;
            align-items: baseline !important;
            margin-bottom: 20px !important; /* Más aire entre platos */
            page-break-inside: avoid !important;
        }

        .sugerencias-item-textos {
            flex: 0 0 auto !important;
            max-width: 80% !important;
        }

        .sugerencias-plato-es {
            font-size: 0.95rem !important;
            font-weight: 600 !important;
            color: #1e293b !important;
        }

        .sugerencias-plato-en {
            font-size: 0.8rem !important;
            color: #64748b !important;
            font-style: italic !important;
        }

        .sugerencias-item-puntos {
            flex: 1 !important;
            border-bottom: 1.5px dotted #cbd5e1 !important;
            margin: 0 10px !important;
            position: relative !important;
            top: -3px !important;
        }

        .sugerencias-item-precio {
            font-size: 0.95rem !important;
            font-weight: 700 !important;
        }

        .sugerencias-footer-layout {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 20px !important;
            padding-top: 15px !important;
            border-top: 1px solid #f1f5f9 !important;
        }

        .sugerencias-info-legal {
            font-size: 0.7rem !important;
            color: #64748b !important;
            max-width: 60% !important;
        }

        .sugerencias-qr-box {
            width: 120px !important;
            height: 120px !important;
        }

        .sugerencias-qr-element {
            width: 100% !important;
            height: 100% !important;
        }

        .btn-imprimir-sugerencias {
            display: block;
            margin: 20px auto;
            padding: 10px 24px;
            background-color: #d97706;
            color: #ffffff;
            font-weight: 700;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
        }

        @media print {
            @page { size: A4 portrait; margin: 0; }
            body > :not(.sugerencias-panel):not(#btnDisparadorImpresionA4) { display: none !important; }
            .sugerencias-panel { border: none !important; box-shadow: none !important; }
        }
    `;
    document.head.appendChild(stylePrint);

    function inicializarPestañaSugerenciasA4() {
        const panelContenedor = document.querySelector('.sugerencias-panel');
        if (!panelContenedor) return;

        panelContenedor.innerHTML = `
            <div class="sugerencias-header-layout">
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">SUGERENCIAS<br>DEL CHEF</div>
                    <div class="sugerencias-title-en">CHEF'S<br>SUGGESTIONS</div>
                </div>
                <img src="logo RG_REST.png" alt="Roland Garros Restaurant" class="sugerencias-logo-rg" onerror="this.style.display='none';">
            </div>

            <div class="sugerencias-body-menu">
                
                <div class="sugerencias-categoria-block">
                    <div class="sugerencias-categoria-titulo">Entrantes / Starters</div>
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">Surtido de croquetas: 2 Pollo - 2 Jamón Ibérico - 2 Setas</div>
                            <div class="sugerencias-plato-en">Assortment of Croquettes: 2 Chicken - 2 Iberian Ham - 2 Mushroom</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">14.50€</div>
                    </div>
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">Surtido de Croquetas Vegetarianas: 6 Setas</div>
                            <div class="sugerencias-plato-en">Vegetarian Croquette Assortment: 6 Mushrooms</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">14.50€</div>
                    </div>
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">Flor de alcachofas al horno Josper con salsa tonnato</div>
                            <div class="sugerencias-plato-en">Charcoal-grilled artichoke with tonnato sauce</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">18.50€</div>
                    </div>
                </div>

                <div class="sugerencias-categoria-block">
                    <div class="sugerencias-categoria-titulo">Platos Principales / Main Courses</div>
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">Arroz meloso de cigala</div>
                            <div class="sugerencias-plato-en">Meloso Rice of Norway Lobster</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">22.00€</div>
                    </div>
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">Entrecot trinchado con patata frita, encurtidos con rúcula y queso parmesano</div>
                            <div class="sugerencias-plato-en">Sliced Entrecote with French fries, pickles, rocket, and Parmesan</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">29.00€</div>
                    </div>
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">Tagliata de calamar al horno Josper con ratatouille y espuma de albahaca</div>
                            <div class="sugerencias-plato-en">Tagliata of Josper-roasted squid with ratatouille and basil foam</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">18.50€</div>
                    </div>
                </div>

                <div class="sugerencias-categoria-block sugerencias-vinos-bottom">
                    <div class="sugerencias-categoria-titulo">Vinos Recomendados / Recommended Wines</div>
                    <div class="sugerencias-item-plato">
                        <div class="sugerencias-item-textos">
                            <div class="sugerencias-plato-es">Vino Tinto - EL TENISTA (D.O.P. Jumilla)</div>
                            <div class="sugerencias-plato-en">EL TENISTA (D.O.P. Jumilla)</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">56.00€</div>
                    </div>
                </div>

            </div>

            <div class="sugerencias-footer-layout">
                <div class="sugerencias-info-legal">
                    <span>⚠️</span> Si usted tiene algún tipo de alergia alimentaria, por favor comuníquelo a nuestro personal.
                </div>
                <div class="sugerencias-qr-box">
                    <img src="qr-code.png" alt="QR" class="sugerencias-qr-element" onerror="this.style.display='none';">
                </div>
            </div>
        `;

        if (!document.getElementById('btnDisparadorImpresionA4')) {
            const btnPrint = document.createElement('button');
            btnPrint.id = 'btnDisparadorImpresionA4';
            btnPrint.className = 'btn-imprimir-sugerencias';
            btnPrint.innerText = '🖨️ Imprimir Carta';
            btnPrint.onclick = () => window.print();
            panelContenedor.parentNode.insertBefore(btnPrint, panelContenedor.nextSibling);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarPestañaSugerenciasA4);
    } else {
        inicializarPestañaSugerenciasA4();
    }
})();
