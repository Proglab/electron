const electron = require('electron');
const ipc = electron.ipcRenderer;
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const File = require('../class/File').File;

ipc.on('file-opened', function (event, args) {
    let records = parse(args.content, {delimiter: ';',columns: true});
    console.log(records);
    let society = $('#society .active').attr('id');
    console.log(society);
    const Treatment = require('../class/Treatment-'+society).Treatment;
    const contents = Treatment.treat(records);
    fs.writeFileSync('myfile.txt', contents, 'utf-8');
    File.window = args.window;
    File.save(contents);
    $("#myModal").modal('hide');
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