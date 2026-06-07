// --- state.js ---
const API_KEYS = [
    "TU_PRIMERA_API_KEY_AQUI",
    "TU_SEGUNDA_API_KEY_AQUI" 
];

// Endpoint oficial de Google Apps Script para persistencia multidireccional (A-AA)
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyDQEGNn8pLpVu-7n4bh6CyzLeKfYeICM0Fbr358SKwVP9rt9yNcc7UV6au2FPMyftiXg/exec';

function getKeys() {
    return API_KEYS;
}

function getWebAppUrl() {
    return WEB_APP_URL;
}
