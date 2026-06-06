// --- ui.js ---

export const UI = {
    // Para mostrar mensajes de estado en tu web (ej: "Sincronizando...", "Error:...")
    log: (mensaje) => {
        const statusElement = document.getElementById('status-carga');
        if (statusElement) {
            statusElement.innerText = mensaje;
            // Opcional: darle un estilo según el tipo de mensaje
            statusElement.className = mensaje.includes('Error') ? 'status-error' : 'status-ok';
        }
        console.log(`[UI LOG]: ${mensaje}`);
    },

    // Para gestionar la visibilidad de los modales sin repetir código
    toggleModal: (modalId, display) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = display ? 'block' : 'none';
        }
    },

    // Para bloquear botones durante procesos largos
    setLoadingState: (buttonId, isLoading, text) => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = isLoading;
            btn.innerText = isLoading ? "⏳ " + text : text;
        }
    }
};
