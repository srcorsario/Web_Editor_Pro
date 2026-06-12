// =========================================================================
// ARCHIVO: sugerencias-print.js (COMPONENTE INTEGRAL DE IMPRESIÓN A4)
// MODIFICADO: Adaptación tipográfica exacta de la cabecera corporativa.
// Reemplazo de banners antiguos por textos nativos estilizados en alta definición.
// Fix: Colores, familias de fuentes y maquetación fiel al diseño original.
// =========================================================================

(function () {
    'use strict';

    // MODIFICADO: Inclusión de los pesos finos (300) y estilos de color exactos de la imagen institucional
    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap');

        /* Contenedor principal de la pestaña de sugerencias estilo folio A4 blanco limpio */
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

        /* Cabecera superior alineada con logotipo lateral */
        .sugerencias-header-layout {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            margin-bottom: 35px !important;
            width: 100% !important;
        }

        /* NUEVO: Contenedor del título tipográfico de sugerencias */
        .sugerencias-brand-title-group {
            display: flex !important;
            flex-direction: column !important;
            gap: 12px !important;
        }

        /* NUEVO: Estilo exacto para SUGERENCIAS DEL CHEF (Líneas 1 y 2) */
        .sugerencias-title-es {
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 300 !important; /* Trazo fino elegante */
            font-size: 2.15rem !important;
            color: #e05a2b !important; /* Color Naranja/Terracota exacto de la imagen */
            line-height: 0.95 !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        /* NUEVO: Estilo exacto para CHEF'S SUGGESTIONS (Líneas 3 y 4) */
        .sugerencias-title-en {
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 300 !important; /* Trazo fino elegante */
            font-size: 1.7rem !important;
            color: #0d5c63 !important; /* Color Azul Verdoso/Marino exacto de la imagen */
            line-height: 0.95 !important;
            letter-spacing: 0.5px !important;
            text-transform: uppercase !important;
            margin-top: 4px !important;
            padding: 0 !important;
        }

        /* Ubicación explícita y forzada del logo RG en la esquina superior derecha */
        .sugerencias-logo-rg {
            width: 75px !important;
            height: auto !important;
            object-fit: contain !important;
            margin-left: auto !important; 
        }

        /* Cuerpo de listados */
        .sugerencias-body-menu {
            flex-grow: 1 !important;
            display: flex !important;
            flex-direction: column !important;
        }

        .sugerencias-categoria-block {
            margin-bottom: 25px !important;
        }

        /* Títulos de sección: Naranja Corporativo */
        .sugerencias-categoria-titulo {
            font-size: 0.85rem !important;
            font-weight: 700 !important;
            color: #d97706 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            border-bottom: 2px solid #334155 !important;
            padding-bottom: 6px !important;
            margin-bottom: 16px !important;
        }

        .sugerencias-categoria-block:nth-child(2) .sugerencias-categoria-titulo {
            border-bottom: 2px solid #d97706 !important;
        }

        /* Estructura de filas de platos individuales */
        .sugerencias-item-plato {
            display: flex !important;
            align-items: baseline !important;
            margin-bottom: 14px !important;
            page-break-inside: avoid !important;
        }

        .sugerencias-item-textos {
            flex: 0 0 auto !important;
            max-width: 78% !important;
        }

        .sugerencias-plato-es {
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            color: #1e293b !important;
            line-height: 1.3 !important;
        }

        .sugerencias-plato-en {
            font-size: 0.75rem !important;
            color: #64748b !important;
            font-style: italic !important;
            margin-top: 2px !important;
        }

        /* Puntos de guía suspensivos dinámicos hacia el precio */
        .sugerencias-item-puntos {
            flex: 1 !important;
            border-bottom: 1.5px dotted #cbd5e1 !important;
            margin: 0 10px !important;
            position: relative !important;
            top: -3px !important;
        }

        .sugerencias-item-precio {
            flex: 0 0 auto !important;
            font-size: 0.9rem !important;
            font-weight: 700 !important;
            color: #0f172a !important;
        }

        /* Sección de pie de página de la hoja */
        .sugerencias-footer-layout {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 30px !important;
            padding-top: 15px !important;
            border-top: 1px solid #f1f5f9 !important;
            width: 100% !important;
        }

        .sugerencias-info-legal {
            font-size: 0.65rem !important;
            color: #64748b !important;
            line-height: 1.5 !important;
            max-width: 75% !important;
        }

        .sugerencias-info-legal span {
            color: #d97706 !important;
            margin-right: 4px !important;
        }

        /* Ubicación explícita y forzada del QR en la esquina inferior derecha */
        .sugerencias-qr-box {
            width: 65px !important;
            height: 65px !important;
            flex-shrink: 0 !important;
            margin-left: auto !important;
        }

        .sugerencias-qr-element {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
        }

        /* Botón de acción para el gestor en pantalla */
        .btn-imprimir-sugerencias {
            display: block;
            margin: 20px auto;
            padding: 10px 24px;
            background-color: #d97706;
            color: #ffffff;
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
            font-size: 0.85rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s;
            text-transform: uppercase;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .btn-imprimir-sugerencias:hover {
            opacity: 0.9;
        }

        /* Modificaciones del comportamiento nativo del motor de impresión */
        @media print {
            @page {
                size: A4 portrait;
                margin: 0;
            }
            
            body > :not(.sugerencias-panel):not(#btnDisparadorImpresionA4),
            #app-version, 
            .header-admin, 
            .tabs-container, 
            .pro-panel, 
            .btn-guardar-main, 
            .btn-add-float,
            .btn-imprimir-sugerencias {
                display: none !important;
            }

            html, body {
                background: #ffffff !important;
                margin: 0 !important;
                padding: 0 !important;
                height: 100% !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            .sugerencias-panel {
                display: flex !important;
                width: 210mm !important;
                height: 297mm !important;
                padding: 15mm 20mm !important;
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
            }
        }
    `;
    document.head.appendChild(stylePrint);

    // Generador dinámico defensivo del DOM
    function inicializarPestañaSugerenciasA4() {
        const panelContenedor = document.querySelector('.sugerencias-panel');
        if (!panelContenedor) return; // Validación defensiva preventiva

        // MODIFICADO: Maquetación limpia inyectando los títulos vectoriales nativos en lugar de la imagen estática removida
        panelContenedor.innerHTML = `
            <div class="sugerencias-header-layout">
                <div class="sugerencias-brand-title-group">
                    <div class="sugerencias-title-es">
                        SUGERENCIAS<br>DEL CHEF
                    </div>
                    <div class="sugerencias-title-en">
                        CHEF'S<br>SUGGESTIONS
                    </div>
                </div>
                <img src="RG_REST.png" alt="Roland Garros Restaurant" class="sugerencias-logo-rg" onerror="this.style.display='none';">
            </div>

            <div class="sugerencias-body-menu">
                
                <div class="sugerencias-categoria-block">
                    <div class="sugerencias-categoria-titulo">Entrantes & Sugerencias / Starters & Suggestions</div>
                    
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
                            <div class="sugerencias-plato-es">Tagliata de calamar al horno Josper con ratatouille y espuma de albahaca</div>
                            <div class="sugerencias-plato-en">Tagliata of Josper-roasted squid with ratatouille and basil foam</div>
                        </div>
                        <div class="sugerencias-item-puntos"></div>
                        <div class="sugerencias-item-precio">18.50€</div>
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
                </div>

                <div class="sugerencias-categoria-block">
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
                    <span>⚠️</span> Si usted tiene algún tipo de alergia alimentaria, por favor comuníquelo a nuestro personal.<br>
                    <span style="color:#64748b !important; font-style:italic;">If you have any food allergies, please inform our staff.</span>
                </div>
                <div class="sugerencias-qr-box">
                    <img src="qr-code.png" alt="Código QR Menú" class="sugerencias-qr-element" onerror="this.style.display='none';">
                </div>
            </div>
        `;

        // Generación e inyección del botón de impresión interactivo
        if (!document.getElementById('btnDisparadorImpresionA4')) {
            const btnPrint = document.createElement('button');
            btnPrint.id = 'btnDisparadorImpresionA4';
            btnPrint.className = 'btn-imprimir-sugerencias';
            btnPrint.innerText = '🖨️ Imprimir Carta en Formato A4';
            btnPrint.onclick = function () {
                window.print();
            };
            panelContenedor.parentNode.insertBefore(btnPrint, panelContenedor.nextSibling);
        }
    }

    // Ejecución segura dependiendo del ciclo de vida del árbol DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarPestañaSugerenciasA4);
    } else {
        inicializarPestañaSugerenciasA4();
    }

})();
