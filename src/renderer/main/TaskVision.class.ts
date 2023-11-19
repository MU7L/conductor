import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import { setInterval, clearInterval } from "timers";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";

const wasmPath = './wasm';
const modelAssetPath = './gesture_recognizer.task';
const fps = 30;

export default class TaskVision {
    private video: HTMLVideoElement;
    private gestureRecognizer: GestureRecognizer | undefined;
    results: GestureRecognizerResult | undefined;
    private resultHandler: ((res: GestureRecognizerResult) => void)[];
    private lastVideoTime: number;
    private timer: NodeJS.Timeout | undefined;

    constructor(video: HTMLVideoElement) {
        this.video = video;
        this.resultHandler = [];
        this.lastVideoTime = -1;
        this.createGestureRecognizer().catch(err => {
            new Notification('Error', {
                body: String(err)
            });
        });
    }

    private async createGestureRecognizer() {
        const vision = await FilesetResolver.forVisionTasks(wasmPath);
        this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            numHands: 2,
            baseOptions: {
                modelAssetPath,
                delegate: 'GPU'
            },
            runningMode: 'VIDEO'
        });
    };

    start() {
        this.timer = setInterval(this.predictWebcam.bind(this), 1000 / fps);
    }

    stop() {
        if (this.timer) clearInterval(this.timer);
    }

    private predictWebcam() {
        if (this.video.currentTime === this.lastVideoTime) return;
        this.lastVideoTime = this.video.currentTime;
        this.results = this.gestureRecognizer?.recognizeForVideo(this.video, Date.now());
        if (this.results) this.handleResult();
    }

    addResultHandler(handler: (res: GestureRecognizerResult) => void) {
        this.resultHandler.push(handler);
    }

    private handleResult() {
        this.resultHandler.forEach(h => {
            if (this.results) h(this.results);
        });
    }
}
