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

const detectRatio: number = 0.7
const pinchThreshold: number = 0.04; // 当距离小于阈值时，认为是pinch

export interface IReport {
    signal: Signal;
    posList: TPos[];
}

// TODO
export default function ({ gestures, landmarks }: GestureRecognizerResult): IReport {
    const resLen = gestures.length;
    switch (resLen) {

        // 单手
        case 1: {
            const signal = handleOneHandSignal(gestures[0][0].categoryName, landmarks[0]);
            return {
                signal,
                posList: [{
                    ...convert(landmarks[0][5], detectRatio),
                    isActive: signal !== Signal.ONE
                }]
            }
        }

        // 双手
        case 2: return {
            signal: Signal.TWO,
            posList: landmarks
                .map(lms => lms.filter((_, i) => [4, 8, 12, 16, 20].includes(i)))
                .flat()
                .map(lm => ({
                    ...convert(lm, detectRatio),
                    isActive: false
                }))
        }

        // 没有手
        default: return {
            signal: Signal.NULL,
            posList: []
        }
    }
}

function handleOneHandSignal(categoryName: string, landmarks: NormalizedLandmark[]): Exclude<Signal, Signal.NULL | Signal.TWO> {
    if (categoryName === 'Closed_Fist') return Signal.GRAB;
    const distance0408 = getDistance(landmarks[4], landmarks[8]);
    const distance0412 = getDistance(landmarks[4], landmarks[12]);
    if (distance0408 <= pinchThreshold) return Signal.LEFT;
    else if (distance0412 <= pinchThreshold) return Signal.RIGHT;
    else return Signal.ONE;
}

function handleTwoHandActive(lm: NormalizedLandmark): boolean {
    return true;
}

/** 由 landmarks 转换得到相对于检测区域的归一化坐标 */
function convert(raw: NormalizedLandmark, radio: number): Omit<TPos, 'isActive'> {
    const r = (1 - radio) / 2;
    return {
        x: Math.min(((1 - raw.x) - r) / radio, 1),
        y: Math.min((raw.y - r) / radio, 1)
    }
}

/** 获取两点距离 */
function getDistance(lm1: NormalizedLandmark, lm2: NormalizedLandmark): number {
    const dx = lm1.x - lm2.x;
    const dy = lm1.y - lm2.y;
    const dz = lm1.z - lm2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
