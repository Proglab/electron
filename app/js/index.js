const electron = require('electron');
const ipc = electron.ipcRenderer;

ipc.on('file-opened', function (event, file, content) {
    console.log('Open file');
    console.log(file);
    console.log(content);
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