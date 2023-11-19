import type { GestureRecognizerResult, NormalizedLandmark } from '@mediapipe/tasks-vision';

export const enum Signal {
    NULL, ONE, LEFT, RIGHT, GRAB, TWO
}

// 归一化
type TPos = {
    x: number;
    y: number;
    isActive: boolean;
}

const detectRatio = 0.7
const pinchThreshold: number = 0.04; // 当距离小于阈值时，认为是pinch

export interface IReport {
    signal: Signal;
    posList: TPos[];
}

// TODO
export default function (results: GestureRecognizerResult): IReport {
    // 无手
    const report: IReport = {
        signal: Signal.NULL,
        posList: []
    }

    const resLen = results.gestures.length;
    switch (resLen) {

        // 单手
        case 1: {
            // TODO
            
            break;
        }

        // 双手
        case 2: {
            report.signal = Signal.TWO;
            report.posList = results.landmarks
                .flat()
                .map(lm => {
                    const pos = convert(lm, detectRatio);
                    const isActive = isLMActive(lm);
                    return { ...pos, isActive }
                })
            break;
        }
    }
    return report;
}

/** 由 landmarks 转换得到相对于检测区域的归一化坐标 */
function convert(raw: NormalizedLandmark, radio: number): Omit<TPos, 'isActive'> {
    const r = (1 - radio) / 2;
    return {
        x: Math.min(((1 - raw.x) - r) / radio, 1),
        y: Math.min((raw.y - r) / radio, 1)
    }
}

/** 由手指弯曲程度判断是否有效 */
// TODO
function isLMActive(lm: NormalizedLandmark): boolean {
    return true;
}