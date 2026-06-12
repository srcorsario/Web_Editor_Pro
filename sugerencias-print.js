// =========================================================================
// ARCHIVO: sugerencias-print.js
// MODIFICADO: Sistema de espera automática para asegurar que app.js cargue los datos.
// =========================================================================

(function () {
    'use strict';

    // ... [Mantén el mismo CSS anterior aquí para ahorrar espacio] ...

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

    function cargarCartaCuandoExistanDatos() {
        // VERIFICACIÓN: ¿Existen datos ya cargados por app.js?
        if (typeof datosLocales === 'undefined' || datosLocales.length === 0) {
            // Si no hay datos, esperamos 500ms y volvemos a intentar
            setTimeout(cargarCartaCuandoExistanDatos, 500);
            return;
        }

        const panelContenedor = document.querySelector('.sugerencias-panel');
        if (!panelContenedor) return;

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

    // Inicialización automática
    cargarCartaCuandoExistanDatos();
})();
