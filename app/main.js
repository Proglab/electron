const isDev = require('electron-is-dev');
const {autoUpdater} = require("electron-updater");
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;

let mainWindow;

// Adds debug features like hotkeys for triggering dev tools and reload
const Window = require('./class/Window').Window;
const File = require('./class/File').File;
const Tools = require('./class/Tools').Tools;


// Prevent window being garbage collected


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
    if (!isDev) {
        autoUpdater.checkForUpdates();
    }
    console.log('The application is ready.');
    mainWindow = Window.create(800,600);

    mainWindow.window.webContents.on('did-finish-load', () => {
        console.log(File);
        console.log('HTML is loaded.');
    });

});

ipc.on('open-file', function (event) {
    File.window = mainWindow;
    let file = File.open();
    event.sender.send('file-opened', {file: file.file, content: file.content});
});

function sendStatusToWindow(text) {
    log.info(text);
    mainWindow.window.webContents.send('message', text);
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
    mainWindow.window.webContents.send('update-available');
})
autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater.'+err);
})
autoUpdater.on('download-progress', (progressObj) => {

    sendStatusToWindow(Math.round(progressObj.percent)+'%');

    mainWindow.window.webContents.send('download-progress', {
        'bytesPerSecond': Tools.FileConvertSize(progressObj.bytesPerSecond),
        'percentValue' : Math.round(progressObj.percent),
        'percent' : Math.round(progressObj.percent)+'%',
        'transferred' : Tools.FileConvertSize(progressObj.transferred),
        'total' : Tools.FileConvertSize(progressObj.total)
    });
})
autoUpdater.on('update-downloaded', (info) => {
    setTimeout(function() {
        autoUpdater.quitAndInstall();
    }, 1000)
});
