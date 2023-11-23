export interface IPos {
    x: number;
    y: number;
    isActive: boolean;
}

const spotLightConfig = {
    transparent: 0.5,
    radius: 30
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
        this.ctx.fillStyle = `rgba(0, 0, 0, ${spotLightConfig.transparent})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }

    private drawClip() {
        if (!this.ctx) return;
        const _ctx = this.ctx;
        this._pos.forEach(({ x, y }) => {           
            _ctx.save();
            _ctx.beginPath();
            _ctx.arc(x, y, spotLightConfig.radius, 0, 2 * Math.PI, true);
            _ctx.closePath();
            _ctx.clip();
            _ctx.clearRect(x - spotLightConfig.radius, y - spotLightConfig.radius, spotLightConfig.radius * 2, spotLightConfig.radius * 2);
            _ctx.restore();
        });
    }

    private drawActive() {
        if (!this.ctx) return;
        const _ctx = this.ctx;
        this._pos
            .filter(({ isActive }) => isActive)
            .forEach(({ x, y }) => {
                _ctx.save();
                _ctx.beginPath();
                _ctx.arc(x, y, spotLightConfig.radius, 0, 2 * Math.PI, true);
                _ctx.closePath();
                _ctx.strokeStyle = 'white';
                _ctx.stroke();
                _ctx.restore();
            });
    }

    render() {
        console.log('render');
        
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawMask();
        this.drawClip();
        this.drawActive();
        requestAnimationFrame(this.render.bind(this));
    }
}

export default SpotLight;