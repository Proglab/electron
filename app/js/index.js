const electron = require('electron');
const ipc = electron.ipcRenderer;

let File;

ipc.on('file-opened', function (event, args) {
    console.log('Open file');
    console.log(args.file);
    console.log(args.content);
});

ipc.on('update-available', function (event, args) {
    window.location.replace("update.html#v${app.getVersion()");
});

$('#azza').click(() => {
    $('#azza').addClass( "active" );
    $('#izzy').removeClass( "active" );
    $('#ozze').removeClass( "active" );
});

$('#izzy').click(() => {
    $('#izzy').addClass( "active" );
    $('#azza').removeClass( "active" );
    $('#ozze').removeClass( "active" );
});

$('#ozze').click(() => {
    $('#ozze').addClass( "active" );
    $('#azza').removeClass( "active" );
    $('#izzy').removeClass( "active" );
});

$('#file').click(() => {
    ipc.send('open-file');
});