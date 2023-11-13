import robot from 'robotjs';

export const enum Signal {
    NULL, ONE, LEFT, RIGHT, GRAB, TWO
}

type OneSignal = Exclude<Signal, Signal.NULL | Signal.TWO>;

// 状态
class MouseState {
    private mm: MouseMachine;
    constructor(mm: MouseMachine) {
        this.mm = mm;
    }
    enter(): void {}
    handle() {
        this.mm.move();
    }
    exit(): void {}
}

class OneMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
}

class LeftMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
    enter(): void {
        robot.mouseToggle('down', 'left');
    }
    exit(): void {
        robot.mouseToggle('up', 'left');
    }
}

class RightMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
    enter(): void {
        robot.mouseToggle('down', 'right');
    }
    exit(): void {
        robot.mouseToggle('up', 'right');
    }
}

class GrabMouseState extends MouseState {
    constructor(mm: MouseMachine) {
        super(mm);
    }
}

// 鼠标状态机
export default class MouseMachine {
    private x: number;
    private y: number;

    private state: MouseState;
    private oneMouseState: MouseState;
    private leftMouseState: MouseState;
    private rightMouseState: MouseState;
    private grabMouseState: MouseState;

    private eventMap: Map<MouseState, Map<OneSignal, MouseState>>;

    constructor() {
        this.oneMouseState = new OneMouseState(this);
        this.leftMouseState = new LeftMouseState(this);
        this.rightMouseState = new RightMouseState(this);
        this.grabMouseState = new GrabMouseState(this);

        this.x = 0;
        this.y = 0;
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
