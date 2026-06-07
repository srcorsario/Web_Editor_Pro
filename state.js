// --- state.js ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyDQEGNn8pLpVu-7n4bh6CyzLeKfYeICM0Fbr358SKwVP9rt9yNcc7UV6au2FPMyftiXg/exec';

// Sistema dinámico de API Keys en LocalStorage (Traído del repositorio Idiomas)
function getKeys() {
    const keys = localStorage.getItem('geminiKeys');
    return keys ? JSON.parse(keys) : [];
}

function saveKey(key) {
    const keys = getKeys();
    if (!keys.includes(key)) {
        keys.push(key);
        localStorage.setItem('geminiKeys', JSON.stringify(keys));
    }
}

function deleteKey(key) {
    let keys = getKeys();
    keys = keys.filter(k => k !== key);
    localStorage.setItem('geminiKeys', JSON.stringify(keys));
}

function getWebAppUrl() {
    return WEB_APP_URL;
}
