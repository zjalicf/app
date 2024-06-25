export function isElectron(): boolean {
    try {
        return window.hasOwnProperty('electron');
    } catch (err) {
        return false;
    }
}

export function isWorker(): boolean {
    try {
        return !window.hasOwnProperty('name');
    } catch (err) {
        return true;
    }
}
