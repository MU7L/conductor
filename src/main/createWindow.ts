import { is } from "@electron-toolkit/utils";
import { BrowserWindow, app } from "electron";
import { join } from "path";

export interface IWindowManager {
    mainWindow: BrowserWindow;
    maskWindow: BrowserWindow;
}

export default function (): IWindowManager {
    return {
        mainWindow: createMainWindow(),
        maskWindow: createMaskWindow()
    }
}

// 检测用窗口 不可见
function createMainWindow() {
    const win = new BrowserWindow({
        show: false,
        webPreferences: {
            preload: join(__dirname, '../preload/main.js'),
            sandbox: false
        }
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/detector');
    } else {
        win.loadFile(join(__dirname, '../renderer/index.html'));
    }

    return win;
}

// 手势控制回显窗口
function createMaskWindow() {
    const win = new BrowserWindow({
        show: false,
        frame: false,
        transparent: true,
        movable: false,
        resizable: false,
        alwaysOnTop: true,
        autoHideMenuBar: true,
        fullscreen: true,
        skipTaskbar: true,
        webPreferences: {
            preload: join(__dirname, '../preload/mask.js'),
            sandbox: false
        }
    });

    win.on('ready-to-show', () => {
        win.show();
    });
    win.on('close', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    win.setIgnoreMouseEvents(true, { forward: true });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        win.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/mask');
    } else {
        win.loadFile(join(__dirname, '../renderer/mask.html'));
    }

    return win;
}

// TODO: 手势检测监视窗口
