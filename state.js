// --- state.js ---
// MODIFICADO: Nueva URL del Web App Script
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby4kd15keNe7KaX5vGNeUQEPX1MRoWMMe8OUlgkLFUYjI16oWoIsHhl-RVm6sdDnmxjNg/exec';

// Sistema dinámico de API Keys en LocalStorage
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
