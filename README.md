# Conductor - 基于手势识别控制鼠标的软件系统

## 环境依赖

- Node.js v18.18.0
- Python 3.11.1
- MSVC

## 部署

``` powershell
npm i
npm run dev
```

## 实现功能

| 编号 | 手势识别               | 鼠标控制         | 进度             | 更新时间   |
| ---- | ---------------------- | ---------------- | ---------------- | ---------- |
| 1    | 检测手部移动           | 响应鼠标移动     | 完成，待优化     | 2023/09/21 |
| 2    | 检测“左键单击”手势     | 响应鼠标左键单击 | 基本完成，开发中 | 2023/09/21 |
| 3    | 检测“左键双击”手势     | 响应鼠标左键双击 |                  |            |
| 4    | 检测“右键单击”手势     | 响应鼠标右键单击 |                  |            |
| 5    | 检测“滚轮滑动”手势     | 响应滚轮滑动     |                  |            |
| 6    | 增强鼠标位置的视觉效果 | /                | 完成，待优化     | 2023/11/07 |

## 技术选型

### 使用 [MediaPipe](https://developers.google.cn/mediapipe/solutions/vision/gesture_recognizer) 实现手势识别

MediaPipe 是一款由 Google Research 开发并开源的多媒体机器学习模型应用框架，MediaPipe 解决方案提供了一套库和工具，可帮助在应用程序中快速应用人工智能 （AI） 和机器学习 （ML） 技术。

通过读取 `navigator.mediaDevices.getUserMedia()` 的视频流并进行检测，实时返回一组检测结果。结果接口如下：

``` typescript
/** 手势识别返回结果接口 */
interface GestureRecognizerResult {
    /** 手部标识 */
    landmarks: NormalizedLandmark[][];
    /** 手 */
    handedness: Category[][];
    /** 手势 */
    gestures: Category[][];
}

/**
 * 归一化表示 3D 空间中具有 x、y、z 坐标的点
 * x 和 y 分别通过图像宽度和高度归一化为 [0.0, 1.0]
 * z 表示距离手腕深度。值越小，地标离相机越近。z 的大小使用与 x 大致相同的比例
 */
interface NormalizedLandmark {
    x: number;
    y: number;
    z: number;
}

/** 分类 */
interface Category {
    /** 置信度 */
    score: number;
    /** 相应标签文件中类别的索引 */
    index: number;
    /** 分类名称，默认为空 */
    categoryName: string;
}
```

其中 `landmarks` 对应下图：// 算法思路

![hand-landmarks](https://developers.google.cn/static/mediapipe/images/solutions/hand-landmarks.png)

### 使用 [Robot.js](http://robotjs.io/) 实现鼠标控制

### 使用 [Electron](https://www.electronjs.org/zh/) 实现应用整体框架和进程通信

### 使用 [electron-vite](https://cn.electron-vite.org/) 框架完成整体工程搭建

## 目录结构

```
conductor
├─out # 输出目录
├─src
│  ├─main     # 主进程
│  ├─preload  # 预加载脚本
│  └─renderer # 渲染进程
├─.gitignore
├─electron-builder.yml    # Electron 构建配置文件
├─electron.vite.config.ts # vite 打包配置文件
├─package.json
├─README.md
└─tsconfig.json
```

## 问题记录

1. 项目搭建

   由于 Electron 项目的特殊性，渲染进程不能直接调用 Node.js 环境下的 npm 包，不便于导入 MediaPipe 等相关模块，需要引入 [Vite](https://cn.vitejs.dev/) 构建工具。本项目中使用 [electron-vite](https://cn.electron-vite.org/) 构建工具可以快速构建整合了 TypeScript， Electron 和 Vite 的项目框架。

2. MediaPipe 在 TypeScript 环境下缺少类型定义

   修改 `tsconfig.json` ，设置 `"moduleResolution": "Node"` 。

3. Robot.js 安装失败

   Robot.js 在下载后会自动构建，需要 Python 和 Visual Studio 环境。参见：[安装robot.js踩坑记录【含出坑指南】_nodejs 12安装robot.js_云云的云的博客-CSDN博客](https://blog.csdn.net/Cloud1209/article/details/120390880)

   如果仍然无法构建，引入 `electron-rebuilder` 进行构建。安装 `electron-builder` 依赖后，可以增加 npm 指令：`"rebuild": "electron-rebuild"` ，运行 `npm run rebuild` 。参考：[Node 原生模块 | Electron (electronjs.org)](https://www.electronjs.org/zh/docs/latest/tutorial/using-native-node-modules)

4. Robot.js 在 TypeScript 环境下导入报错“没有默认导出”

   修改 `tsconfig.json` ，设置 `"allowSyntheticDefaultImports": true` 。

5. 通过 Electron `screen.getPrimaryDisplay().workAreaSize` 和 Robot.js `robot.getScreenSize()` 获取的屏幕大小不相等

   暂未查明原因。经测试后者数据准确。

6. 项目构建打包时 Robot.js 出错

   由于 Node.js 在使用 C/C++ 扩展时只能构建成为 `CommonJS` 的模块，不能用于 Vite，同时无法用于动态加载的场景，此处只能用 `external` 选项排除 `C/C++` 模块构建。参见：[C/C++ Addons | Electron⚡️Vite (electron-vite.github.io)](https://electron-vite.github.io/guide/cpp-addons.html)。更换框架后未出现改问题。
   
7. 识别窗口最小化或不可见时识别模块不工作

   `requestAnimationFrame` 是一个用于动画循环的API，它会在浏览器刷新前调用指定的回调函数，以便更新动画。根据浏览器的规范，当浏览器窗口变为不可见时，动画应该被暂停，因此 `requestAnimationFrame` 也不会执行回调。

   在浏览器不可见时执行动画可能会导致性能问题和浪费资源，因此暂停动画是一个好的实践。

   同时注意到，`setInterval` 等延时函数在 Electron 中触发时间有误。参考：[electron 窗口隐藏后 setTimeout setInterval 等延时函数出现执行间隔与定义好的延时时间出现巨大差距的问题-CSDN博客](https://blog.csdn.net/qq_15801963/article/details/115871793)

   综上，最终选择 timers 库实现延时回调。

## 版本更新

### 2023/09/21

- 完成项目原型
- 完成文档
- 基本实现功能1

### 2023/11/07

- 项目由 [Electron⚡️Vite (electron-vite.github.io)](https://electron-vite.github.io) 框架迁移到 [electron-vite](https://cn.electron-vite.org/) 

- 实现多进程，分别处理检测识别和结果反馈

- 完成大部分重构，部分实现面向对象开发

  问题：

  1. 鼠标漂移
  2. 检测出背景中的不希望被检测到的手

