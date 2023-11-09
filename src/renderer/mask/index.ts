import SpotLight from "./SpotLight.class";

window.addEventListener('DOMContentLoaded', () => {
    const config = {
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: 0.5,
        r: 50,
    }

    // ipc
    type tPos = {
        x: number;
        y: number
    }
    window.electron.ipcRenderer.on('mask:pos', (_, pos: tPos[]) => {
        spotLight.pos = pos.map((p: tPos) => ({
            x: p.x * config.width,
            y: p.y * config.height
        }));;
    });

    // dom
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        window.electron.ipcRenderer.send('error', 'no canvas');
        return;
    }
    canvas.width = config.width;
    canvas.height = config.height;

    // render
    const spotLight = new SpotLight(canvas, {
        transparent: config.transparent,
        radius: config.r
    });
    spotLight.render();
});
