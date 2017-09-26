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

$('.treatment').click((event) => {
    $('.treatment').removeClass( "active" );
    $(event.currentTarget).addClass( "active" );
});

$('#file').click(() => {
    $('#myModal').on('shown.bs.modal', function (e) {
        ipc.send('open-file');
    })
    $("#myModal").modal();
});