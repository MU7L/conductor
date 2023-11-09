import { DrawingUtils, NormalizedLandmark, GestureRecognizer } from "@mediapipe/tasks-vision";

export interface IArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

class ResultRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private drawingUtils: DrawingUtils | undefined;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        if (this.ctx) this.drawingUtils = new DrawingUtils(this.ctx);
    }

    renderLandmarks(landmarks: NormalizedLandmark[][]) {
        if (!this.ctx) return;
        if (!landmarks) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        for (const lm of landmarks) {
            // line
            this.drawingUtils?.drawConnectors(
                lm,
                GestureRecognizer.HAND_CONNECTIONS,
                {
                    color: "#00FF00",
                    lineWidth: 5
                }
            );
            // node
            this.drawingUtils?.drawLandmarks(
                lm,
                {
                    color: "#FF0000",
                    lineWidth: 2
                }
            );
        }
        this.ctx.restore();
    }

    renderDetectArea(area: IArea) {
        if (!this.ctx) return;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(area.x, area.y, area.width, area.height);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.restore();
    }
}

export default ResultRenderer;