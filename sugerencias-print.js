// =========================================================================
// ARCHIVO: sugerencias-print.js (NUEVO COMPONENTE MODULAR DE IMPRESIÓN A4)
// MODIFICADO: Sistema de Renderizado de la pestaña "Sugerencias del día" 
// Objetivo: Adaptación quirúrgica estilo Roland Garros para impresión A4.
// =========================================================================

(function () {
    'use strict';

    // NUEVO: Estilos CSS inyectados de forma aislada dedicados exclusivamente a la maquetación A4 y Media Query de impresión
    const stylePrint = document.createElement('style');
    stylePrint.innerHTML = `
        /* Estilos en pantalla para la previsualización fidedigna */
        .sugerencias-panel {
            background: #ffffff !important;
            color: #2c3e50 !important;
            padding: 45px 55px !important;
            max-width: 210mm !important; /* Ancho proporcional exacto A4 */
            min-height: 297mm !important; /* Alto proporcional exacto A4 */
            margin: 0 auto !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            border: 1px solid #ddd !important;
            position: relative !important;
            font-family: 'Montserrat', sans-serif !important;
        }

        .sugerencias-top-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            margin-bottom: 25px !important;
        }

        .sugerencias-titulo-dia {
            font-size: 1.4rem !important;
            font-weight: 700 !important;
            color: #2c3e50 !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
            line-height: 1.3 !important;
        }

        .sugerencias-logo-img {
            width: 140px !important;
            height: auto !important;
            object-fit: contain !important;
        }

        .sugerencias-subheader {
            text-align: center !important;
            margin-bottom: 35px !important;
            border-bottom: 3px solid #e67e22 !important; /* Color primario de acento */
            padding-bottom: 20px !important;
        }

        .sugerencias-header-img {
            width: 100% !important;
            max-width: 550px !important;
            height: auto !important;
            display: inline-block !important;
        }

        .sugerencias-contenido-platos {
            flex-grow: 1 !important;
        }

        .sugerencias-seccion {
            margin-bottom: 35px !important;
        }

        .sugerencias-seccion-titulo {
            font-size: 1.15rem !important;
            font-weight: 700 !important;
            color: #e67e22 !important;
            text-transform: uppercase !important;
            margin-bottom: 20px !important;
            letter-spacing: 1.5px !important;
            border-left: 4px solid #e67e22 !important;
            padding-left: 10px !important;
        }

        .sugerencias-plato {
            display: flex !important;
            align-items: baseline !important;
            margin-bottom: 18px !important;
            page-break-inside: avoid !important;
        }

        .sugerencias-plato-nombres {
            flex: 0 0 auto !important;
            max-width: 80% !important;
        }

        .sugerencias-nombre-es {
            font-weight: 600 !important;
            color: #2c3e50 !important;
            font-size: 1.05rem !important;
        }

        .sugerencias-nombre-en {
            font-size: 0.85rem !important;
            color: #7f8c8d !important;
            font-style: italic !important;
            margin-top: 3px !important;
        }

        .sugerencias-puntos {
            flex: 1 !important;
            border-bottom: 2px dotted #b2bec3 !important;
            margin: 0 12px !important;
            position: relative !important;
            top: -4px !important;
        }

        .sugerencias-precio {
            flex: 0 0 auto !important;
            font-weight: 700 !important;
            color: #2c3e50 !important;
            font-size: 1.1rem !important;
        }

        .sugerencias-separador {
            height: 1px !important;
            margin: 35px 0 !important;
            background: linear-gradient(to right, transparent, #e67e22, transparent) !important;
        }

        .sugerencias-footer {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-end !important;
            margin-top: 40px !important;
            padding-top: 25px !important;
            border-top: 1px solid #dfe6e9 !important;
        }

        .sugerencias-aviso {
            flex: 1 !important;
            font-size: 0.8rem !important;
            color: #636e72 !important;
            line-height: 1.6 !important;
            padding-right: 35px !important;
        }

        .sugerencias-qr {
            width: 130px !important;
            height: 130px !important;
            background: #ffffff !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex-shrink: 0 !important;
        }

        .sugerencias-qr-img {
            width: 100% !important;
            height: 100% !important;
            object-fit: contain !important;
        }

        /* Botón exclusivo para disparar la impresión de la hoja */
        .btn-imprimir-a4 {
            display: block;
            margin: 20px auto;
            padding: 12px 30px;
            background-color: #2c3e50;
            color: #ffffff;
            font-family: 'Montserrat', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.2s;
            text-transform: uppercase;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
        }
        .btn-imprimir-a4:hover {
            background-color: #e67e22;
        }

        /* =========================================================================
           ⚡ CRÍTICO: REGLAS DIRECTAS DE CONFIGURACIÓN DE IMPRESIÓN PARA EL FORMATO A4
           ========================================================================= */
        @media print {
            @page {
                size: A4 portrait;
                margin: 0mm; /* El margen está controlado internamente por el padding del contenedor */
            }
            
            /* Ocultar absolutamente toda la interfaz web, cabeceras, menús e inputs */
            body *, 
            #app-version, 
            .header-admin, 
            .tabs-container, 
            .pro-panel, 
            .btn-guardar-main, 
            .btn-add-float,
            .btn-imprimir-a4 {
                display: none !important;
            }

            /* Forzar visualización única del contenedor de sugerencias en A4 exacto */
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
                padding: 20mm !important; /* Margen estandarizado de impresión A4 */
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                page-break-after: avoid !important;
                page-break-before: avoid !important;
            }
        }
    `;
    document.head.appendChild(stylePrint);

    // NUEVO: Renderizador Inteligente y defensivo del DOM para la pestaña de Sugerencias del Día
    function renderTabSugerenciasA4() {
        const panelContenedor = document.querySelector('.sugerencias-panel');
        if (!panelContenedor) return; // Manejo defensivo del DOM

        // NUEVO: Bloque de Inyección Estructural con las imágenes solicitadas incorporadas de manera elegante
        panelContenedor.innerHTML = `
            <div class="sugerencias-top-row">
                <h2 class="sugerencias-titulo-dia" id="sugerencia-fecha-titulo">
                    SUGERENCIAS DEL DIA<br>
                    <span style="font-size: 0.95rem; font-weight: 400; color: #7f8c8d;" id="sugerencia-fecha-dinamica"></span>
                </h2>
                <img src="RG_REST.png" alt="Logo RG Rest" class="sugerencias-logo-img" onerror="this.style.display='none';">
            </div>

            <div class="sugerencias-subheader">
                <img src="negro.png" alt="Cabecera Carta" class="sugerencias-header-img" onerror="this.style.display='none';">
            </div>

            <div class="sugerencias-contenido-platos">
                
                <div class="sugerencias-seccion">
                    <div class="sugerencias-seccion-titulo">Entrantes / Starters</div>
                    
                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <div class="sugerencias-nombre-es">Jamón Ibérico de Bellota con Pan de Cristal</div>
                            <div class="sugerencias-nombre-en">Acorn-fed Iberian Ham with Crispy Crystal Bread</div>
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">28,50€</div>
                    </div>

                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <div class="sugerencias-nombre-es">Croquetas Artesanas de la Casa (Variadas)</div>
                            <div class="sugerencias-nombre-en">Homemade Artisanal Croquettes Selection</div>
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">14,00€</div>
                    </div>
                </div>

                <div class="sugerencias-separador"></div>

                <div class="sugerencias-seccion">
                    <div class="sugerencias-seccion-titulo">Principales / Main Courses</div>
                    
                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <div class="sugerencias-nombre-es">Rodaballo Salvaje a la Brasa con Verduras de Temporada</div>
                            <div class="sugerencias-nombre-en">Wild Grilled Turbot served with Seasonal Vegetables</div>
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">32,00€</div>
                    </div>

                    <div class="sugerencias-plato">
                        <div class="sugerencias-plato-nombres">
                            <div class="sugerencias-nombre-es">Solomillo de Buey Maduro con Reducción de Oporto</div>
                            <div class="sugerencias-nombre-en">Aged Beef Tenderloin with Port Wine Reduction</div>
                        </div>
                        <div class="sugerencias-puntos"></div>
                        <div class="sugerencias-precio">29,50€</div>
                    </div>
                </div>

            </div>

            <div class="sugerencias-footer">
                <div class="sugerencias-aviso">
                    *De acuerdo con el Reglamento (UE) Nº 1169/2011, disponemos de la información detallada sobre alérgenos en nuestra carta general. Por favor, consulte a nuestro personal si padece alguna intolerancia alimentaria.<br>
                    <span style="font-weight: 600; margin-top: 5px; display: inline-block;">Roland Garros Restaurant &copy; 2026</span>
                </div>
                <div class="sugerencias-qr">
                    <img src="qr-code.png" alt="Carta Digital QR" class="sugerencias-qr-img" onerror="this.parentNode.innerHTML='[QR CODE]';">
                </div>
            </div>
        `;

        // NUEVO: Inserción de la fecha actual en tiempo real de forma elegante en el encabezado
        const fechaEl = document.getElementById('sugerencia-fecha-dinamica');
        if (fechaEl) {
            const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            fechaEl.innerText = new Date().toLocaleDateString('es-ES', opcionesFecha);
        }

        // NUEVO: Inyección del disparador de impresión físico para el formato A4
        if (!document.getElementById('btnDisparadorImpresion')) {
            const btnPrint = document.createElement('button');
            btnPrint.id = 'btnDisparadorImpresion';
            btnPrint.className = 'btn-imprimir-a4';
            btnPrint.innerText = '🖨️ Imprimir Carta en A4';
            btnPrint.onclick = function () {
                window.print();
            };
            panelContenedor.parentNode.insertBefore(btnPrint, panelContenedor.nextSibling);
        }
    }

    // NUEVO: Enganche seguro al ciclo de carga del árbol DOM sin sobreescribir listeners globales antiguos
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderTabSugerenciasA4);
    } else {
        renderTabSugerenciasA4();
    }

})();
