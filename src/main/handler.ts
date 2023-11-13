import type { BrowserWindow } from 'electron';
import { ipcHelper } from '@electron-toolkit/utils';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { getScreenSize } from 'robotjs';
import { detectRatio } from './config';
import MouseMachine, { Signal } from './MouseMachine.class';

interface IPos {
    x: number;
    y: number;
}

const winSize = getScreenSize();

const mouseMachine = new MouseMachine();

export default function (win: BrowserWindow) {
    ipcHelper.on('main:detect', (_, signal: Signal, landmarks: NormalizedLandmark[]) => {
        const posList = landmarks.map(convert).map(pos => ({
            x: Math.round(pos.x * winSize.width),
            y: Math.round(pos.y * winSize.height)
        }));
        switch (signal) {
            case Signal.NULL: {
                break;
            }
            case Signal.TWO: {
                break;
            }
            default: {
                const { x, y } = posList[0];
                mouseMachine.handle(signal, x, y);
            }
        }
    });

    ipcHelper.on('error', (e, msg: string) => {
        console.log(e.sender, msg);
    });
}

/** 由 landmarks 转换得到相对于检测区域的归一化坐标 */
function convert({ x, y }: NormalizedLandmark): IPos {
    let r = (1 - detectRatio) / 2;
    let xx = Math.min(((1 - x) - r) / detectRatio, 1);
    let yy = Math.min((y - r) / detectRatio, 1);
    return { x: xx, y: yy }
}
