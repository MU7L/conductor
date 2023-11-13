import type { GestureRecognizerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";

/** 发送每一次检测结果 */

const enum Signal {
    NULL, ONE, LEFT, RIGHT, GRAB, TWO
}

interface IReport {
    signal: Signal;
    posList: NormalizedLandmark[];
}

// 当距离小于阈值时，认为是pinch
const pinchThreshold: number = 0.04;

function createReport(results: GestureRecognizerResult): IReport {
    const { landmarks, gestures } = results;
    
    if (gestures.length === 1) {
        const posList: NormalizedLandmark[] = [landmarks[0][5]];
        console.log(gestures);

        // GRAB
        if (gestures[0][0].categoryName === 'Closed_Fist') {
            return {
                signal: Signal.GRAB,
                posList
            }
        }

        const distance48 = distance(landmarks[0][4], landmarks[0][8]);
        const distance412 = distance(landmarks[0][4], landmarks[0][12]);
        
        // LEFT
        if (distance48 <= pinchThreshold) {
            return {
                signal: Signal.LEFT,
                posList
            }
        }

        // RIGHT
        if (distance412 <= pinchThreshold) {
            return {
                signal: Signal.RIGHT,
                posList
            }
        }

        // ONE
        return {
            signal: Signal.ONE,
            posList
        }
    }

    // TWO
    // TODO: 怎么检测点击
    if (gestures.length === 2) {
        return {
            signal: Signal.TWO,
            posList: landmarks
                .map(lm => lm.filter((_, i) => [4, 8, 12, 16, 20].includes(i)))
                .flat()
        }
    }

    // NULL
    return {
        signal: Signal.NULL,
        posList: []
    }
}

export default function outputHandler(results: GestureRecognizerResult) {
    const report = createReport(results);
    window.electron.ipcRenderer.send('main:detect', report.signal, report.posList);
}

/** 计算两点距离 */
function distance(l1: NormalizedLandmark, l2: NormalizedLandmark): number {
    return Math.sqrt(Math.pow(l1.x - l2.x, 2) + Math.pow(l1.y - l2.y, 2) + Math.pow(l1.z - l2.z, 2));
}