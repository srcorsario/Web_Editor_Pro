// state.js
export const STATE = {
    // Aquí puedes mantener otros estados de la App
};

export function getKeys() {
    const keys = localStorage.getItem('geminiKeys');
    return keys ? JSON.parse(keys) : [];
}

export function saveKey(key) {
    const keys = getKeys();
    if (!keys.includes(key) && key.trim() !== "") {
        keys.push(key.trim());
        localStorage.setItem('geminiKeys', JSON.stringify(keys));
    }
}
