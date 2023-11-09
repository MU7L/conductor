export interface IPos {
    x: number;
    y: number;
}

export interface ISpotLightConfig {
    transparent: number;
    radius: number;
}

class SpotLight {
    private _pos: IPos[];
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null;
    private config: ISpotLightConfig;

    constructor(canvas: HTMLCanvasElement, config: ISpotLightConfig) {
        this._pos = [];
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
    }

    public set pos(v : IPos[]) {
        this._pos = v;
    }

    private drawMask() {
        if (!this.ctx) return;
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.config.transparent})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    private drawClip() {
        this._pos.forEach(({ x, y }) => {
            if (!this.ctx) return;
            // console.log(x, y);
            
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.config.radius, 0, 2 * Math.PI, true);
            this.ctx.closePath();
            this.ctx.clip();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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