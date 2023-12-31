import { ipcMain } from 'electron';
import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';

import MouseMachine from './MouseMachine.class';
import resultParser, { Signal } from './resultParser';
import type TrayManager from './TrayManager.class';
import type { IWindowManager } from './createWindow';

type TDevice = {
    label: string;
    deviceId: string
}

const mouseMachine = new MouseMachine();

export default function (windowManager: IWindowManager, trayManager: TrayManager) {
    // TODO: 开启监视窗口

    // 选择摄像头设备
    ipcMain.on('main:devices', (_, devices: TDevice[]) => {
        if (devices.length === 0) return;
        trayManager.devicesMenuTemplate = devices.map(({ deviceId, label }, index) => ({
            label,
            click: () => {
                windowManager.mainWindow.webContents.send('main:select-device', deviceId);
            },
            type: 'radio',
            checked: index === 0
        }));
    });

    // TODO: 相应控制信号
    ipcMain.on('main:results', (_, results: GestureRecognizerResult) => {
        const resLen = results.gestures.length;
        if (resLen === 0 || resLen > 2) {
            windowManager.maskWindow.hide();
            return;
        }
        windowManager.maskWindow.show();
        const {signal, posList} = resultParser(results);
        console.log(signal, posList);
        switch (signal) {
            case Signal.NULL: break;
            case Signal.ONE:
            case Signal.LEFT:
            case Signal.RIGHT:
            case Signal.GRAB: mouseMachine.handle(signal, posList[0].x, posList[0].y); break;
            case Signal.TWO: break;
        }
        windowManager.maskWindow.webContents.send('mask:render', posList);
    });
}
