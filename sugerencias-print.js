(function () {
    'use strict';

    // ... (Mantén el mismo CSS que definimos anteriormente) ...

    function cargarCarta() {
        if (typeof datosLocales === 'undefined') { setTimeout(cargarCarta, 500); return; }

        const contenedor = document.querySelector('.sugerencias-panel');
        if (!contenedor) return;

        // Filtramos sobre la lista ya ordenada por el usuario en el app.js
        const activos = datosLocales.filter(p => p.activa);
        
        const entrantes = activos.filter(p => p.id >= 12000 && p.id <= 12399);
        const principales = activos.filter(p => p.id >= 12400 && p.id <= 12899);
        const postres = activos.filter(p => p.id >= 12900 && p.id <= 12999 && p.id !== 12990);
        // El 12990 se incluye explícitamente en vinos
        const vinosSugerencia = activos.filter(p => p.id === 12990 || desglosarNombre(p.es).nombre.toLowerCase().includes('vino'));

        // Construcción del HTML
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
