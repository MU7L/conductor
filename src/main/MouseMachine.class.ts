import robot from 'robotjs';

export const enum Signal {
    NULL, ONE, LEFT, RIGHT, GRAB, TWO
}

type OneSignal = Exclude<Signal, Signal.NULL | Signal.TWO>;

const windowSize = robot.getScreenSize();

// 鼠标状态机
export default class MouseMachine {
    private cacheSize: number;
    private cacheX: number[];
    private cacheY: number[];

    private state: MouseState;
    private oneMouseState: MouseState;
    private leftMouseState: MouseState;
    private rightMouseState: MouseState;
    private grabMouseState: MouseState;

    private eventMap: Map<MouseState, Map<OneSignal, MouseState>>;

    constructor(cacheSize: number = 3) {
        this.oneMouseState = new OneMouseState(this);
        this.leftMouseState = new LeftMouseState(this);
        this.rightMouseState = new RightMouseState(this);
        this.grabMouseState = new GrabMouseState(this);

        this.cacheSize = cacheSize;
        this.cacheX = [];
        this.cacheY = [];
        this.state = this.oneMouseState;
        this.eventMap = new Map<MouseState, Map<OneSignal, MouseState>>([
            [this.oneMouseState, new Map<OneSignal, MouseState>([
                [Signal.LEFT, this.leftMouseState],
                [Signal.RIGHT, this.rightMouseState],
                [Signal.GRAB, this.grabMouseState]
            ])],
            [this.leftMouseState, new Map<OneSignal, MouseState>([
                [Signal.ONE, this.oneMouseState]
            ])],
            [this.rightMouseState, new Map<OneSignal, MouseState>([
                [Signal.ONE, this.oneMouseState]
            ])],
            [this.grabMouseState, new Map<OneSignal, MouseState>([
                [Signal.ONE, this.oneMouseState]
            ])],
        ]);
    }

    set x(x: number) {
        this.cacheX.push(x * windowSize.width);
        if (this.cacheX.length > this.cacheSize) {
            this.cacheX.shift();
        }
    }

    set y(y: number) {
        this.cacheY.push(y * windowSize.height);
        if (this.cacheY.length > this.cacheSize) {
            this.cacheY.shift();
        }
    }

    get x(): number {
        return this.cacheX.reduce((a, b) => a + b, 0) / this.cacheX.length;
    }

    get y(): number {
        return this.cacheY.reduce((a, b) => a + b, 0) / this.cacheY.length;
    }
    
    handle(signal: OneSignal, x: number, y: number): void {
        this.transition(signal);
        this.x = x;
        this.y = y;
        this.state.handle();
    }

    transition(signal: OneSignal): void {
        const nextState = this.eventMap.get(this.state)?.get(signal);
        if (nextState && nextState!== this.state) {
            this.state.exit();
            this.state = nextState;
            this.state.enter();
        }
    }

    move() {
        robot.moveMouse(this.x, this.y);
    }
}

// 状态
class MouseState {
    private mm: MouseMachine;
    constructor(mm: MouseMachine) {
        this.mm = mm;
    }
    enter(): void {
        console.log('enter');
    }
    handle() {
        this.mm.move();
    }
    exit(): void {
        console.log('exit');
    }
}

class OneMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
    enter(): void {
        console.log('one enter');
    }
    exit(): void {
        console.log('one exit');
    }
}

class LeftMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
    enter(): void {
        robot.mouseToggle('down', 'left');
        console.log('left enter');
    }
    exit(): void {
        robot.mouseToggle('up', 'left');
        console.log('left exit');
    }
}

class RightMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
    enter(): void {
        robot.mouseToggle('down', 'right');
        console.log('right enter');
    }
    exit(): void {
        robot.mouseToggle('up', 'right');
        console.log('right exit');
    }
}

class GrabMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
    enter(): void {
        console.log('grab enter');
    }
    exit(): void {
        console.log('grab exit');
    }
}
