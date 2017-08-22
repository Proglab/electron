const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
// Adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();
let Window =  Object.create({
    window: null,
    create: (width, height) => {
        this.window = new BrowserWindow({
            width: width,
            height: height
        });

        this.window.loadURL(`file://${__dirname}/view/index.html`);
        this.window.on('closed', function() {
            this.window = null;
        });
        return this;
    }
});


// Prevent window being garbage collected
let mainWindow;

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = Window.create(800,600);
    }
});

app.on('ready', () => {
    mainWindow = Window.create(800,600);
});