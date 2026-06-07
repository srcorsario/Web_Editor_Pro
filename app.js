// app.js (Web_Editor_Pro)
import { getKeys, saveKey } from './state.js';
import { UI } from './ui.js';

// ... (resto de tu código existente en app.js) ...

// NUEVA FUNCIÓN: Traducción Mágica con Gemini 2.5
export async function realizarTraduccionAutomatica() {
    const keys = getKeys();
    if (keys.length === 0) {
        alert("Primero configura una API Key. Usa saveKey('TU_API_KEY') en la consola.");
        return;
    }

    const btn = document.querySelector('.btn-traductor-magico');
    btn.disabled = true;
    btn.innerText = "Traduciendo...";

    // 1. Obtener datos del DOM del modal
    const nombreES = document.querySelector('input[name="Nombre_ES"]').value;
    
    // Preparar idiomas destino (buscamos inputs de idioma)
    const inputsIdioma = document.querySelectorAll('.input-estandar[data-lang]');
    const idiomasDestino = Array.from(inputsIdioma).map(i => i.getAttribute('data-lang'));

    const prompt = `Actúa como traductor de menús. Traduce el siguiente plato: "${nombreES}".
    Traduce a estos idiomas: ${idiomasDestino.join(', ')}.
    Responde SÓLO con un JSON: {"traducciones": {"EN": "...", "FR": "..."}}`;

    try {
        const URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${keys[0]}`;
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        const texto = data.candidates[0].content.parts[0].text;
        const jsonClean = texto.replace(/```json|```/g, '').trim();
        const resultado = JSON.parse(jsonClean);

        // 2. Inyectar resultados
        Object.entries(resultado.traducciones).forEach(([lang, val]) => {
            const input = document.querySelector(`.input-estandar[data-lang="${lang}"]`);
            if (input) input.value = val;
        });

        UI.log("[OK] Traducción completada.");
    } catch (e) {
        UI.log(`[Error] Fallo en traducción: ${e.message}`);
    } finally {
        btn.disabled = false;
        btn.innerText = "Traductor Mágico";
    }
}

// Asignar evento al botón (asegúrate de que esto se ejecute cuando el modal abre)
document.querySelector('.btn-traductor-magico').addEventListener('click', realizarTraduccionAutomatica);
