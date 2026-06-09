// ui.js (Web_Editor_Pro)
// MODIFICADO: Importación estricta del lector de estado local para nutrir el componente UI portado
import { getKeys } from './state.js';

export const UI = {
    log: (mensaje) => {
        console.log(`[Editor] ${mensaje}`);
        // Si tienes una consola en el editor, puedes apuntar aquí
        
        // NUEVO: Integración defensiva para volcar logs visuales al contenedor de estado nativo del editor si se encuentra presente
        const statusCarga = document.getElementById('status-carga');
        if (statusCarga) {
            statusCarga.innerText = mensaje;
        }
    },
    setLoadingState: (buttonId, isLoading, text = "Guardando...") => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        btn.disabled = isLoading;
        btn.innerText = isLoading ? text : "Guardar";
    },
    
    // NUEVO: Patrón de renderizado optimizado y enmascaramiento seguro de API Keys portado del repositorio secundario
    actualizarListaKeys: (selectorElemento = '.select-keys') => {
        // Manejo defensivo del DOM: búsqueda adaptativa por clase o identificador alternativo
        const selectEl = document.querySelector(selectorElemento) || document.getElementById('selectKeys');
        if (!selectEl) return;
        
        const keys = getKeys();
        if (keys.length === 0) {
            selectEl.innerHTML = '<option value="">No hay API Keys cargadas</option>';
            selectEl.disabled = true;
            return;
        }

        selectEl.disabled = false;
        selectEl.innerHTML = keys.map((k, i) => {
            // Enmascaramiento seguro para evitar la exposición visual de tokens completos
            const resumida = k.length > 10 ? `${k.substring(0, 6)}...${k.substring(k.length - 4)}` : k;
            return `<option value="${k}">Key ${i + 1}: ${resumida}</option>`;
        }).join('');
    }
};
