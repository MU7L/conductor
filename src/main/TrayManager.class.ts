import { app, Tray, Menu, nativeImage } from 'electron';
import type { MenuItemConstructorOptions, MenuItem } from 'electron';
import appIcon from '../../resources/icon.ico?asset';

export type TTemplate = MenuItemConstructorOptions | MenuItem;

const defaultDevicesMenuTemplate: TTemplate[] = [{
    label: '无摄像头'
}];

const defaultCtrlMenuTemplate: TTemplate[] = [{
    label: '退出',
    click() {
        app.quit();
    }
}];

export default class TrayManager {
    private tray: Tray;
    private _windowsMenuTemplate: TTemplate[];
    private _devicesMenuTemplate: TTemplate[];
    private _ctrlMenuTemplate: TTemplate[];

    constructor() {
        const icon = nativeImage.createFromPath(appIcon);
        this.tray = new Tray(icon);
        this.tray.setToolTip('wave your hands!');
        this.tray.setTitle('Conductor');

        this._windowsMenuTemplate = [];
        this._devicesMenuTemplate = defaultDevicesMenuTemplate;
        this._ctrlMenuTemplate = defaultCtrlMenuTemplate;
        this.setContextMenu();
    }

    set windowsMenuTemplate(template: TTemplate[]) {
        this._windowsMenuTemplate = template.length > 0 ? template : defaultDevicesMenuTemplate;
        this.setContextMenu();
    }

    set devicesMenuTemplate(template: TTemplate[]) {
        this._devicesMenuTemplate = template;
        this.setContextMenu();
    }

    private setContextMenu() {
        const contextMenu = Menu.buildFromTemplate([
            ...this._windowsMenuTemplate,
            { type: 'separator' },
            ...this._devicesMenuTemplate,
            { type: 'separator' },
            ...this._ctrlMenuTemplate
        ]);
        this.tray.setContextMenu(contextMenu);
    }
}
