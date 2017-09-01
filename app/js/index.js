const electron = require('electron');
const ipc = electron.ipcRenderer;
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const shell = electron.shell;

ipc.on('file-opened', function (event, args) {
    let records = parse(args.content, {delimiter: ';',columns: true});
    console.log(records);
    let society = $('#society .active').attr('id');
    console.log(society);
    const Treatment = require('../class/Treatment-'+society).Treatment;
    const contents = Treatment.treat(records);
    const date = new Date();
    const dir = __dirname + '/../files/';
    const filename = society+'_'+date.getYear()+'-'+ date.getMonth()+'-'+ date.getDay()+ '_'+ date.getHours()+'-'+ date.getMinutes()+'.txt';


    fs.writeFile(dir + filename, contents, 'utf8', function (err) {
        if (err)
            return console.log(err);
        console.log(contents);
        const filename = society+'.txt';
        console.log(dir + filename);
        shell.openExternal(dir);
        $("#myModal").modal('hide');
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