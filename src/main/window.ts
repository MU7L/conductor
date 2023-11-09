import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app, screen } from "electron";
import { join } from "path";
import { detectRatio } from "./config";

export default function () {
    let mainWindow: BrowserWindow;
    let maskWindow: BrowserWindow;

    // main window
    mainWindow = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    });

    mainWindow.on('ready-to-show', () => {
        const {width, height} = screen.getPrimaryDisplay().workAreaSize
        mainWindow.webContents.send('main:size', detectRatio, height / width);
        mainWindow.show();
    });
    mainWindow.on('close', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    // mask
    maskWindow = new BrowserWindow({
        show: false,
        frame: false,
        transparent: true,
        movable: false,
        resizable: false,
        alwaysOnTop: true,
        fullscreen: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        maskWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/mask.html');
    } else {
        maskWindow.loadFile(join(__dirname, '../renderer/mask.html'));
    }

    maskWindow.setIgnoreMouseEvents(true, { forward: true });

    return [mainWindow, maskWindow];
}
