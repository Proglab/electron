const electron = require('electron');
const app = electron.app;
const dialog = electron.dialog;
const fs = require('fs');

let File =  Object.create({
    file: null,
    content:null,
    window:null,
    open: () => {
        let files = dialog.showOpenDialog(this.window, {
            properties: ['openFile'],
            filters: [
                { name: 'Moka File', extensions: ['md'] }
            ]
        });

        if (!files) { return; }

        this.file = files[0];
        this.content = fs.readFileSync(this.file).toString();
        return this;
    },
    save: (content) => {
        let fileName = dialog.showSaveDialog(this.window, {
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
module.exports.File = File;