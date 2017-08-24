const electron = require('electron');
const app = electron.app;
const ipc = electron.ipcMain;

let mainWindow;

// Adds debug features like hotkeys for triggering dev tools and reload
const Window = require('./class/Window').Window;
const File = require('./class/File').File;


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