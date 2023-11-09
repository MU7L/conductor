import type { BrowserWindow } from 'electron';
import { ipcHelper } from '@electron-toolkit/utils';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import bot from 'robotjs';
import { detectRatio } from './config';

type TPos = {
    x: number;
    y: number;
}

export default function (win: BrowserWindow) {
    let isMaskShow: boolean = false;
    let pos: TPos = {
        x: 0,
        y: 0
    }
    let isLeftDown: boolean = false;

    const winSize = bot.getScreenSize();

    ipcHelper.on('main:detect 0', () => {
        if (isMaskShow) {
            win.hide();
            isMaskShow = false;
        }
    });

    ipcHelper.on('main:detect 1', (_, gesture: string, landmarks: NormalizedLandmark[]) => {
        if (!isMaskShow) {
            win.show();
            isMaskShow = true;
        }

        // console.log(gesture);

        switch (gesture) {
            case 'Closed_Fist': {
                // 握拳响应屏幕滚动
                break;
            }

            default: {
                // 响应鼠标移动
                pos = convert(landmarks[5]);
                // pos = debounce(pos, 3); // TODO: 防抖
                win.webContents.send('mask:pos', [pos]);
                bot.moveMouse(pos.x * winSize.width, pos.y * winSize.height);

                // 大拇指食指捏合响应点击
                let distance48 = distance(landmarks[4], landmarks[8]);
                if (distance48 <= 0.04) {
                    if (!isLeftDown) {
                        console.log('click');
                        bot.mouseClick('left');
                    }
                    isLeftDown = true;
                } else {
                    isLeftDown = false;
                }

            }
        }

    });

    ipcHelper.on('main:detect 2', (_, landmarks: NormalizedLandmark[][]) => {
        if (!isMaskShow) {
            win.show();
            isMaskShow = true;
        }

        const pos = landmarks
            .map(ls => ls.filter((_, i) => [4, 8, 12, 16, 20].includes(i)))
            .flat()
            .map(l => convert(l));
        win.webContents.send('mask:pos', pos);
    });

    ipcHelper.on('error', (e, msg: string) => {
        console.log(e.sender, msg);
    });
}

/** 由 landmarks 转换得到相对于检测区域的归一化坐标 */
function convert({ x, y }: NormalizedLandmark): TPos {
    let r = (1 - detectRatio) / 2;
    let xx = Math.min(((1 - x) - r) / detectRatio, 1);
    let yy = Math.min((y - r) / detectRatio, 1);
    return { x: xx, y: yy }
}

/** 计算两点距离 */
function distance(l1: NormalizedLandmark, l2: NormalizedLandmark) {
    let sum: number = 0;
    for (let index of ['x', 'y', 'z']) {
        sum += Math.pow((l1[index] - l2[index]), 2);
    }
    return Math.sqrt(sum);
}

/** 防抖 */
// const cache: TPos[] = [];
// const avg: TPos = { x: 0, y: 0 };
// function debounce(next: TPos, frame: number): TPos {
//     let len = cache.length;
//     if (len <= frame) {
//         avg.x = (avg.x * len + next.x) / (len + 1);
//         avg.y = (avg.y * len + next.y) / (len + 1);
//         cache.push(next);
//         return avg;
//     } else {
//         let first = cache.pop();
//         if (!first) return next;
//         avg.x += (next.x - first.x) / frame;
//         avg.y += (next.y - first.y) / frame;
//         cache.push(next);
//         return avg;
//     }

// }
