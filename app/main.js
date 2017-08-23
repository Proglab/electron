const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const fs = require('fs');

let mainWindow;
let fileOpened;

// Adds debug features like hotkeys for triggering dev tools and reload
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

let File =  Object.create({
    file: null,
    content:null,
    open: () => {
        let files = dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Moka File', extensions: ['md'] }
            ]
        });

        if (!files) { return; }

        this.file = files[0];
        this.content = fs.readFileSync(this.file).toString();
        console.log(this.file);
        return this;
    },
    save: (content) => {
        let fileName = dialog.showSaveDialog(mainWindow, {
            title: 'Save Popsy Output',
            defaultPath: app.getPath('documents'),
            filters: [
                { name: 'Popsy Files', extensions: ['popsy'] }
            ]
        });

        if (!fileName) { return; }

        fs.writeFileSync(fileName, this.content);
    }
});


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
        //fileOpened = File.open();
        console.log('HTML is loaded.');
        //mainWindow.window.webContents.send('file-opened', fileOpened.file, fileOpened.content);
    });

});