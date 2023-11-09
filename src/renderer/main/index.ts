/// <reference types="electron-vite/node" />

import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';
import TaskVision from './TaskVision.class';
import ResultRenderer, { IArea } from './ResultRenderer.class';

window.addEventListener('DOMContentLoaded', () => {
    const config: {
        win: IArea;
        area: IArea;
    } = {
        win: { // win size
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight
        },
        area: { // detect area size
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        }
    }

    window.electron.ipcRenderer.on('main:size', (_, ratio: number, hw: number) => {
        config.area.width = config.win.width * ratio;
        config.area.height = config.area.width * hw;
        config.area.x = (config.win.width - config.area.width) / 2;
        config.area.y = (config.win.height - config.area.height) / 2;
    });

    // dom
    const video = document.querySelector('video');
    if (!video) {
        window.electron.ipcRenderer.send('error', 'no video');
        return;
    };
    video.width = config.win.width;
    video.height = config.win.height;

    const canvas = document.querySelector('canvas');
    if (!canvas) {
        window.electron.ipcRenderer.send('error', 'no canvas');
        return;
    };
    canvas.width = config.win.width;
    canvas.height = config.win.height;

    // task vision
    const resultRenderer = new ResultRenderer(canvas);
    const taskVision = new TaskVision();

    // gui
    taskVision.addResultHandler((results: GestureRecognizerResult) => {
        resultRenderer.renderLandmarks(results.landmarks);
        resultRenderer.renderDetectArea(config.area);
    });

    // output
    taskVision.addResultHandler((results: GestureRecognizerResult) => {       
        const { gestures, landmarks } = results;
        if (gestures.length === 0) {
            window.electron.ipcRenderer.send('main:detect 0');
        } else if (gestures.length === 1) {
            window.electron.ipcRenderer.send('main:detect 1', gestures[0][0].categoryName, landmarks[0]);
        } else {
            window.electron.ipcRenderer.send('main:detect 2', landmarks);
        }
    });

    // main function
    function main() {
        navigator.mediaDevices.getUserMedia({
            video: {
                width: config.win.width,
                height: config.win.height
            }
        }).then(stream => {
            if (!video) throw new Error('no video');
            video.addEventListener('loadeddata', () => taskVision.predictWebcam(video));
            video.srcObject = stream;
        }).catch(err => {
            window.electron.ipcRenderer.send('error', err);
        });
    }
    main();
});