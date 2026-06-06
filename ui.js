// --- ui.js ---
export const UI = {
    log: (mensaje) => {
        const statusElement = document.getElementById('status-carga');
        if (statusElement) {
            statusElement.innerText = mensaje;
            statusElement.className = mensaje.includes('Error') ? 'status-error' : 'status-ok';
        }
        console.log(`[UI LOG]: ${mensaje}`);
    },

    setLoadingState: (buttonId, isLoading, text) => {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.disabled = isLoading;
            btn.innerText = isLoading ? "⏳ " + text : text;
        }
    }
};
