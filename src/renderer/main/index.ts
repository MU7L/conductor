import TaskVision from "./TaskVision.class";

const config: MediaTrackConstraints = {
    deviceId: '',
    facingMode: 'user'
}

// dom
const video = document.createElement('video');

// task vision
const taskVision = new TaskVision(video);

// TODO: 向主进程输出
taskVision.addResultHandler(res => window.api.sendResults(res));

// 切换设备
window.api.onSelectDevice((deviceId: string) => {
    taskVision.stop();
    config.deviceId = deviceId;
    run();
})

main();

async function main() {
    const devices = await enumerateDevices();
    if (devices.length === 0) {
        new Notification('Error', {
            body: '没有找到摄像头'
        });
        return;
    }
    window.api.sendDevices(devices);
    // device[0] 为默认设备
    config.deviceId = devices[0].deviceId;
    run();
}

// 运行
async function run() {
    try {
        const stream = await getUserMedia();
        if (stream) {
            video.srcObject = stream;
            video.play();
            taskVision.start();
        } else throw new Error('获取视频流失败');
    } catch (error) {
        new Notification('Error', {
            body: String(error)
        });
    }
}

/** 获取全部摄像头 */
async function enumerateDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
            deviceId: device.deviceId,
            label: device.label
        }));
}

/** 获取视频流 */
async function getUserMedia() {
    return await navigator.mediaDevices.getUserMedia({
        video: config
    });
}
