import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";
import type { GestureRecognizerResult } from "@mediapipe/tasks-vision";

class TaskVision {
    private video: HTMLVideoElement;
    private gestureRecognizer: GestureRecognizer | undefined;
    results: GestureRecognizerResult | undefined;
    private resultHandler: ((res: GestureRecognizerResult) => void)[];
    private lastVideoTime: number;

    constructor(video: HTMLVideoElement) {
        this.video = video;
        this.resultHandler = [];
        this.lastVideoTime = -1;
        this.initGestureRecognizer().catch(err => {
            console.log(err);
            window.electron.ipcRenderer.send('error', 'no gesture recognizer')
        });
    }

    private async initGestureRecognizer() {
        const vision = await FilesetResolver.forVisionTasks('./wasm');
        this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            numHands: 2,
            baseOptions: {
                modelAssetPath: './gesture_recognizer.task',
                delegate: 'GPU'
            },
            runningMode: 'VIDEO'
        });
        console.log(this.gestureRecognizer);
    };

    predictWebcam() {
        // detecting the stream.
        let nowInMs = Date.now();
        if (this.video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = this.video.currentTime;
            this.results = this.gestureRecognizer?.recognizeForVideo(this.video, nowInMs);
            this.handleResult();
        }
        requestAnimationFrame(this.predictWebcam.bind(this));
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

export default TaskVision;