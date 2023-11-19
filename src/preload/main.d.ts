import type { ElectronAPI } from '@electron-toolkit/preload';
import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import type { TDeviceInfo } from './main';

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            sendDevices: (devices: TDeviceInfo[]) => void;
            onSelectDevice: (callback: (deviceId: string) => void) => void;
            sendResults: (result: GestureRecognizerResult) => void;
        }
    }
}
