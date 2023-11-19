import SpotLight, { IPos } from './SpotLight.class';

window.addEventListener('DOMContentLoaded', () => {
    // dom
    const canvas = document.querySelector('canvas');
    if (!canvas) {
        new Notification('Error', {
            body: 'canvas not found'
        });
        return;
    };
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const spotLight = new SpotLight(canvas);
    spotLight.render();

    window.api.onRender((posList: IPos[]) => {
        spotLight.pos = posList;
    });
});