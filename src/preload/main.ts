import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { setInterval, clearInterval } from "timers";
import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';

// Custom APIs for renderer
export type TDeviceInfo = {
    label: string;
    deviceId: string;
}
const api = {
    setInterval: (callback: () => void, delay: number) => {
        return setInterval(callback, delay);
    },
    clearInterval: (id: NodeJS.Timeout) => {
        clearInterval(id);
    },
    sendDevices: (devices: TDeviceInfo[]) => {
        ipcRenderer.send('main:devices', devices);
    },
    onSelectDevice: (callback: (deviceId: string) => void) => {
        ipcRenderer.on('main:select-device', (_, deviceId: string) => callback(deviceId));
    },
    sendResults: (results: GestureRecognizerResult) => {
        ipcRenderer.send('main:results', results);
    }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
