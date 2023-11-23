import SpotLight, { IPos } from './SpotLight.class';

window.addEventListener('DOMContentLoaded', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // dom
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        new Notification('Error', {
            body: 'canvas not found'
        });
        return;
    };
    canvas.width = width;
    canvas.height = height;

    const spotLight = new SpotLight(canvas);
    spotLight.render();

    window.api.onRender((posList: IPos[]) => {
        spotLight.pos = posList.map(({ x, y, isActive }) => ({
            x: x * width,
            y: y * height,
            isActive
        }));
    });
});