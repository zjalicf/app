import { registerWindowsTray, destroyWindowsTray } from "@/tray/windows";
import { isMac, isWindows } from "@/helpers";
import { destroyMacosTray, registerMacosTray } from "@/tray/macos";

export const registerTray = () => {
    if (isWindows) {
        registerWindowsTray();
    }

    if (isMac) {
        registerMacosTray();
    }
};

export const destroyTray = () => {
    if (isWindows) {
        destroyWindowsTray();
    }

    if (isMac) {
        destroyMacosTray();
    }
};