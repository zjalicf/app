import {globalShortcut} from "electron";
import {showQuickCapture} from "./quick-capture";

export const registerQuickCaptureShortcut = (shortcut, enabled, prev) => {


    const newShortcut = shortcut.replace('meta', 'CommandOrControl');

    if (prev.length && globalShortcut.isRegistered(prev)) {
        globalShortcut.unregister(prev);
    }

    globalShortcut.register(newShortcut, () => {
        if (enabled()) {
            showQuickCapture('Shortcut');
        }
    });
}