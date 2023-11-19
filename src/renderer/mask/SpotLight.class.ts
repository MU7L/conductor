export interface IPos {
    x: number;
    y: number;
    isActive: boolean;
}

const spotLightConfig = {
    transparent: 0.5,
    clipRadius: 50,
    activeRadius: 60
}

class SpotLight {
    private _pos: IPos[];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;

    constructor(canvas: HTMLCanvasElement) {
        this._pos = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    set pos(v: IPos[]) {
        this._pos = v;
    }

    private drawMask() {
        if (!this.ctx) return;
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = `rgba(0, 0, 0, ${spotLightConfig.transparent})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    private drawClip() {
        this._pos.forEach(({ x, y }) => {
            if (!this.ctx) return;
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x, y, spotLightConfig.clipRadius, 0, 2 * Math.PI, true);
            this.ctx.closePath();
            this.ctx.clip();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();
        });
    }

    private drawActive() {
        this._pos
            .filter(({ isActive }) => isActive)
            .forEach(({ x, y }) => {
                if (!this.ctx) return;
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.arc(x, y, spotLightConfig.activeRadius, 0, 2 * Math.PI, true);
                this.ctx.closePath();
                this.ctx.fillStyle = 'white';
                this.ctx.stroke();
                this.ctx.restore();
            });
    }

    render() {
        this.drawMask();
        this.drawClip();
        requestAnimationFrame(this.render.bind(this));
    }
}

export default SpotLight;