const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

let Window =  Object.create({
    window: null,
    create: (width, height) => {
        this.window = new BrowserWindow({
            width: width,
            height: height
        });

        this.window.loadURL(`file://${__dirname}/../view/index.html`);

        this.window.on('closed', function() {
            this.window = null;
            mainWindow = null;
        });
        return this;
    }
});
module.exports.Window = Window;