const electron = require('electron');
const app = electron.app;

let mainWindow;

// Adds debug features like hotkeys for triggering dev tools and reload
const Window = require('./class/Window').Window;


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
        //mainWindow.window.webContents.openDevTools();
        console.log('HTML is loaded.');
    });

});