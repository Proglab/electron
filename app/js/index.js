const electron = require('electron');
const ipc = electron.ipcRenderer;
const parse = require('csv-parse/lib/sync');

ipc.on('file-opened', function (event, args) {
    let records = parse(args.content, {delimiter: ';',columns: true});
    console.log(records);
    let society = $('#society .active').attr('id');
    console.log(society);
    Treatment = require('../class/Treatment-'+society).Treatment;
    Treatment.treat('hello');
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
    $('#myModal').on('shown.bs.modal', function (e) {
        ipc.send('open-file');
    })
    $("#myModal").modal();
});