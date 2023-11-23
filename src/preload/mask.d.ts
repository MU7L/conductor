import type { ElectronAPI } from '@electron-toolkit/preload';
import type { TPos } from './mask';

declare global {
    interface Window {
        electron: ElectronAPI
        api: {
            onRender: (callback: (posList: TPos[]) => void) => void
        }
    }
}
