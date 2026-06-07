// ui.js (Web_Editor_Pro)
export const UI = {
    log: (mensaje) => {
        console.log(`[Editor] ${mensaje}`);
        // Si tienes una consola en el editor, puedes apuntar aquí
    },
    setLoadingState: (buttonId, isLoading, text = "Guardando...") => {
        const btn = document.getElementById(buttonId);
        if (!btn) return;
        btn.disabled = isLoading;
        btn.innerText = isLoading ? text : "Guardar";
    }
};
