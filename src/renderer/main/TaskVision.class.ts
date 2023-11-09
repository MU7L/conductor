import { GestureRecognizer, FilesetResolver, GestureRecognizerResult } from "@mediapipe/tasks-vision";

class TaskVision {
    private gestureRecognizer: GestureRecognizer | undefined;
    results: GestureRecognizerResult | undefined;
    private resultHandler: ((res: GestureRecognizerResult) => void)[];
    private lastVideoTime: number;

    constructor() {
        this.resultHandler = [];
        this.lastVideoTime = -1;
        this.initGestureRecognizer().catch(err => {
            console.log(err);
            window.electron.ipcRenderer.send('error', 'no gesture recognizer')
        });
    }

    private async initGestureRecognizer() {
        const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');
        // const vision = await FilesetResolver.forVisionTasks('@mediapipe/tasks-vision/wasm');
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

    predictWebcam(video: HTMLVideoElement) {
        // detecting the stream.
        let nowInMs = Date.now();
        if (video.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = video.currentTime;
            this.results = this.gestureRecognizer?.recognizeForVideo(video, nowInMs);
            this.handleResult();
        }
        requestAnimationFrame(() => this.predictWebcam(video));
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