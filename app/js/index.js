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

$('#azzabe').click(() => {
    $('#azzabe').addClass( "active" );
    $('#azzafr').removeClass( "active" );
    $('#ozzebe').removeClass( "active" );
    $('#ozzefr').removeClass( "active" );
});

$('#azzafr').click(() => {
    $('#azzabe').removeClass( "active" );
    $('#azzafr').addClass( "active" );
    $('#ozzebe').removeClass( "active" );
    $('#ozzefr').removeClass( "active" );
});

$('#ozzebe').click(() => {
    $('#azzabe').removeClass( "active" );
    $('#azzafr').removeClass( "active" );
    $('#ozzebe').addClass( "active" );
    $('#ozzefr').removeClass( "active" );
});

$('#ozzefr').click(() => {
    $('#azzabe').removeClass( "active" );
    $('#azzafr').removeClass( "active" );
    $('#ozzebe').removeClass( "active" );
    $('#ozzefr').addClass( "active" );
});

$('#file').click(() => {
    ipc.send('open-file');
});