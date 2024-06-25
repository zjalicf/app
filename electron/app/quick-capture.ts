import * as path from 'path';
import * as electron from 'electron';
import {
    appWindows,
    createSubWindows,
    setAcreomFocused,
    shouldGiveupControl,
} from './windows';

export const QUICK_CAPTURE_PATH = path.join(__dirname, 'quick-capture');
const recalculatePositionToDisplay = (position: any, from: any, to: any) => {
    const normalizedPosition = {
        x: (position.x - from.bounds.x) / from.bounds.width,
        y: (position.y - from.bounds.y) / from.bounds.height,
    };

    const newPosition = {
        x: Math.floor(to.bounds.x + normalizedPosition.x * to.bounds.width),
        y: Math.floor(to.bounds.y + normalizedPosition.y * to.bounds.height),
    };
    return newPosition;
};

export const showQuickCapture = (source: any) => {
    try {
        const currentUrl = appWindows.main.webContents.getURL();
        if (currentUrl.includes('auth')) return;
    } catch (e) {
        console.log(e);
        return;
    }

    const ARGS = { dev: process.env.NODE_ENV_ELECTRON_VITE };
    if (!appWindows.quickNote || appWindows.quickNote.isDestroyed()) {
        createSubWindows(QUICK_CAPTURE_PATH, ARGS);
    }

    if (process.platform === 'darwin') {
        if (
            appWindows.quickNote.getOpacity() === 1 &&
            appWindows.quickNote.isVisible()
        ) {
            appWindows.quickNote.webContents.send('window-hide');
            appWindows.quickNote.setOpacity(0);
            appWindows.quickNote.setIgnoreMouseEvents(true);
            if (shouldGiveupControl()) {
                electron.Menu.sendActionToFirstResponder('hide:');
            } else {
                appWindows.main.focus();
            }
            setAcreomFocused(false);
            appWindows.main?.webContents.send('track-event', 'Quick Capture', { action: 'Close', source });
            return;
        } else {
            setAcreomFocused(appWindows.main.isFocused());
        }
    } else if (appWindows.quickNote.isVisible()) {
        appWindows.quickNote.hide();
        appWindows.main?.webContents.send('track-event', 'Quick Capture', { action: 'Close', source });
        return;
    }

    const focusScreen = electron.screen.getDisplayNearestPoint(
        electron.screen.getCursorScreenPoint(),
    );

    const winBounds = appWindows.quickNote.getBounds();

    const originalScreen = electron.screen.getDisplayNearestPoint({
        x: winBounds.x,
        y: winBounds.y,
    });

    if (focusScreen.id !== originalScreen.id) {
        const newPosition = recalculatePositionToDisplay(
            { x: winBounds.x, y: winBounds.y },
            originalScreen,
            focusScreen,
        );
        appWindows.quickNote.setPosition(newPosition.x, newPosition.y);
    }
    if (process.platform === 'darwin') {
        if (appWindows.quickNote.isVisible()) {
            appWindows.quickNote.setOpacity(1);
            appWindows.quickNote.setIgnoreMouseEvents(false);
            appWindows.quickNote.show();
            setTimeout(() => {
                appWindows.quickNote.focus();
            }, 200);
        } else {
            appWindows.quickNote.show();
        }
    } else {
        appWindows.quickNote.show();
    }

    appWindows.quickNote.webContents.send('window-show', source);
    appWindows.main.webContents.send('window-show', source);
};
