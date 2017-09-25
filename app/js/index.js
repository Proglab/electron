const electron = require('electron');
const remote = electron.remote;
var dialog = remote.dialog;
const ipc = electron.ipcRenderer;
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const shell = electron.shell;
const path = require('path');

ipc.on('file-opened', function (event, args) {
    let records = parse(args.content, {delimiter: ';',columns: true});
    console.log(records);
    let society = $('#society .active').attr('id');
    console.log(society);
    let Treatment = require('../class/Treatment-'+society).Treatment;


    console.log(Treatment);


    const contents = Treatment.treat(records);
    const date = new Date();
    const dir = './';
    const filename = society+'_'+date.getYear()+'-'+ date.getMonth()+'-'+ date.getDay()+ '_'+ date.getHours()+'-'+ date.getMinutes()+'.txt';


    console.log('Saving Popsy file');
    dialog.showSaveDialog(remote.getCurrentWindow(), {
        title: 'Enregistrez le fichier Popsy',
        defaultPath: filename,
        filters: [
            {name: 'Fichier Popsy', extensions: ['txt']}
        ]
    }, function (fileName) {
        console.log('callback');
        console.log(fileName);

        if (fileName === undefined) return;
        fs.writeFile(fileName, contents, 'utf8', function (err) {
            if (err)
                return console.log(err);
            shell.openExternal(path.dirname(fileName));
            $("#myModal").modal('hide');
        });

    });




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