const fs = require('fs');
const path = require('path');
const params = require('../config/tvafactazzafr');
const azzafr = require('../config/azzafr');

class Treatment {
    constructor() {
        this.CreateKeyAll = azzafr.CreateKeyAll;
        this.IgnoreAnalClosed = azzafr.IgnoreAnalClosed;
        this.DossierSelect = azzafr.DossierSelect;
    }

    treat(text) {
        console.log('Transformation starting...');
        let dir = path.join(__dirname, '../fileTemplates', 'template.txt');
        let txtTransformed = fs.readFileSync(dir).toString();
        txtTransformed = txtTransformed.replace('[[CreateKeyAll]]', this.CreateKeyAll);
        txtTransformed = txtTransformed.replace('[[IgnoreAnalClosed]]', this.IgnoreAnalClosed);
        txtTransformed = txtTransformed.replace('[[DossierSelect]]', this.DossierSelect);
        this.template = txtTransformed;

        dir = path.join(__dirname, '../fileTemplates', 'head.txt');
        var headTemplate = fs.readFileSync(dir).toString();

        dir = path.join(__dirname, '../fileTemplates', 'line.txt');
        var lineTemplate = fs.readFileSync(dir).toString();

        var body = '';

        var i = 0;
        var k = 0;


        var sum = 0;

        var dateYear = null;

        var lines = '';


        var linesData = [];
        var nbrLinesData = linesData.length;

        var j = 0;


        $.each(text, function (index, value) {

            var d = value.Date.replace('/', '-').replace('/', '-').split('-');
            dateYear = d[2];

            if (!$.isNumeric(value.Compte)) {
                sum = 0;

                if (i > 0) {
                    nbrLinesData++;
                    j = 0;

                }

                var len = value.CompteTiers.length;
                const dateStr = value.Date.replace('/', '-').replace('/', '-');
                const date = dateStr.split('-');
                const dateEchStr = value.DateEcheance.replace('/', '-').replace('/', '-');
                if (typeof linesData[nbrLinesData] === 'undefined') {
                    var cust = value.CompteTiers.indexOf('_');
                    linesData[nbrLinesData] = [];
                    linesData[nbrLinesData]['head'] = [];
                    linesData[nbrLinesData]['head']['JrnlID'] = value.Libelle.indexOf("AVOIR") == 0 ? 'FV1' : 'FV4';
                    linesData[nbrLinesData]['head']['CustID'] = value.CompteTiers.substring(cust + 1, len);
                    linesData[nbrLinesData]['head']['DocType'] = 1;
                    linesData[nbrLinesData]['head']['DocNumber'] = value.NumPiece.replace('FF', '10').replace('AF', '11');
                    linesData[nbrLinesData]['head']['Comment'] = value.Libelle;
                    linesData[nbrLinesData]['head']['PeriodID'] = parseInt(date[1]);
                    linesData[nbrLinesData]['head']['DateDoc'] = dateStr;
                    linesData[nbrLinesData]['head']['Piece'] = '';
                    linesData[nbrLinesData]['head']['CrcyDoc'] = 'EUR';
                    linesData[nbrLinesData]['head']['DateDue'] = dateEchStr == '' ? dateStr : dateEchStr;
                    linesData[nbrLinesData]['head']['AmountCrcyDoc'] = value.Credit == '0' ? parseFloat(value.Debit.replace(',', '.')) : parseFloat(value.Credit.replace(',', '.'));
                    linesData[nbrLinesData]['lines'] = [];
                }

                linesData[nbrLinesData]['somme1'] = 0;
                linesData[nbrLinesData]['somme2'] = 0;

            } else {
                if (value.Compte.substr(0, 1) == 4) {
                    return true;
                }

                let FlagDC = value.Debit == 0 ? 'C' : 'D';
                let VATCode = params[value.Compte].tva;
                let GnrlID = params[value.Compte].facture;

                let tva = 0;
                let tva1 = 0;
                let tva2 = 0;
                if (FlagDC == 'C') {
                    tva = parseFloat(value.Credit.replace(',', '.')) * VATCode;
                    tva1 = Math.trunc(parseFloat(tva)) / 100;
                    tva2 = Math.round(parseFloat(tva)) / 100;
                } else {
                    tva = parseFloat(value.Debit.replace(',', '.')) * VATCode;
                    tva1 = Math.trunc(parseFloat(tva)) / 100;
                    tva2 = Math.round(parseFloat(tva)) / 100;
                }

                var s = FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2);

                linesData[nbrLinesData]['lines'][j] = [];
                linesData[nbrLinesData]['lines'][j]['GnrlID'] = GnrlID;
                linesData[nbrLinesData]['lines'][j]['AnalID'] = '';
                linesData[nbrLinesData]['lines'][j]['VATCode'] = VATCode;
                linesData[nbrLinesData]['lines'][j]['Comment'] = value.Libelle;
                linesData[nbrLinesData]['lines'][j]['FlagDC'] = FlagDC;
                linesData[nbrLinesData]['lines'][j]['CrcyID'] = 'EUR';
                linesData[nbrLinesData]['lines'][j]['AmountCrcy'] = s;
                linesData[nbrLinesData]['lines'][j]['AmountCrcyDoc'] = s;
                linesData[nbrLinesData]['lines'][j]['AmountCrcyBase'] = s;
                linesData[nbrLinesData]['lines'][j]['AnalRecordTag'] = '';
                linesData[nbrLinesData]['lines'][j]['AnalQuantity'] = '0';
                linesData[nbrLinesData]['lines'][j]['AnalPercent'] = '0.00';

                if (tva1 == tva2) {
                    linesData[nbrLinesData]['lines'][j]['AmountVATCrcyDoc'] = tva1;
                } else {
                    linesData[nbrLinesData]['lines'][j]['AmountVATCrcyDoc'] = null;

                    linesData[nbrLinesData]['lines'][j]['tva1'] = tva1;
                    linesData[nbrLinesData]['lines'][j]['tva2'] = tva2;
                }


                linesData[nbrLinesData]['somme1'] = parseFloat(tva1) + parseFloat(s) + parseFloat(linesData[nbrLinesData]['somme1']);
                linesData[nbrLinesData]['somme2'] = parseFloat(tva2) + parseFloat(s) + parseFloat(linesData[nbrLinesData]['somme2']);

                j++;

            }
            i++;
        });

        var i = 0;
        $.each(linesData, function (index, line) {

            linesData[i]['somme1'] = parseFloat(linesData[i]['somme1']) * 100;
            linesData[i]['somme2'] = parseFloat(linesData[i]['somme2']) * 100;

            linesData[i]['somme1'] = Math.trunc(linesData[i]['somme1']) / 100;
            linesData[i]['somme2'] = Math.round(linesData[i]['somme2']) / 100;


            if (linesData[i]['head']['AmountCrcyDoc'] == linesData[i]['somme1']) {
                var j = 0;
                $.each(linesData[i]['lines'], function (index, line) {
                    if (linesData[i]['lines'][j]['AmountVATCrcyDoc'] == null) {
                        linesData[i]['lines'][j]['AmountVATCrcyDoc'] = linesData[i]['lines'][j]['tva1'];
                    }
                    j++;
                });
            }

            if (linesData[i]['head']['AmountCrcyDoc'] == linesData[i]['somme2']) {
                var j = 0;
                $.each(linesData[i]['lines'], function (index, line) {
                    if (linesData[i]['lines'][j]['AmountVATCrcyDoc'] == null) {
                        linesData[i]['lines'][j]['AmountVATCrcyDoc'] = linesData[i]['lines'][j]['tva2'];
                    }
                    j++;
                });

            }

            if (linesData[i]['head']['AmountCrcyDoc'] != linesData[i]['somme2'] && linesData[i]['head']['AmountCrcyDoc'] != linesData[i]['somme1']) {
                k++;
                var cust = linesData[i]['somme2'].toString().indexOf('.');

                console.log('AmountCrcyDoc');
                console.log(linesData[i]['head']['AmountCrcyDoc']);
                console.log('somme1');
                console.log(linesData[i]['somme1']);
                console.log('somme2');
                console.log(linesData[i]['somme2']);
                console.log('Comment');
                console.log(linesData[i]['head']['Comment']);
                var j = 0;
                $.each(linesData[i]['lines'], function (index, line) {
                    if (linesData[i]['lines'][j]['AmountVATCrcyDoc'] == null) {
                        linesData[i]['lines'][j]['AmountVATCrcyDoc'] = linesData[i]['lines'][j]['tva2'];
                    }
                    j++;
                });

                var diff = linesData[i]['head']['AmountCrcyDoc'] - parseFloat(linesData[i]['somme2'].toString().substring(0, cust + 3));
                diff = Math.round(diff*100) / 100;

                console.log('Différences');
                console.log(diff);
                console.log(linesData[i]['lines']);

                var b = linesData[i]['lines'].length - 1;
                linesData[i]['lines'][b]['AmountVATCrcyDoc'] = Math.round((linesData[i]['lines'][b]['AmountVATCrcyDoc'] + diff)*100)/ 100;
                console.log('--------------');
            }
            i++;
        });

        $.each(linesData, function (index, line) {

            let head = headTemplate.replace('[[JrnlID]]', line['head']['JrnlID']);
            head = head.replace('[[DocType]]', line['head']['DocType']);
            head = head.replace('[[DocNumber]]', line['head']['DocNumber']);
            head = head.replace('[[CustID]]', line['head']['CustID']);
            head = head.replace('[[Comment]]', line['head']['Comment']);
            head = head.replace('[[PeriodID]]', line['head']['PeriodID']);
            head = head.replace('[[DateDoc]]', line['head']['DateDoc']);
            head = head.replace('[[DateDue]]', line['head']['DateDue']);
            head = head.replace('[[Piece]]', line['head']['Piece']);
            head = head.replace('[[CrcyDoc]]', line['head']['CrcyDoc']);
            head = head.replace('[[AmountCrcyDoc]]', line['head']['AmountCrcyDoc']);

            let lines = '';

            $.each(line['lines'], function (ind, lin) {
                let lineTxt = lineTemplate.replace('[[GnrlID]]', lin['GnrlID']);
                lineTxt = lineTxt.replace('[[AnalID]]', '');
                lineTxt = lineTxt.replace('[[VATCode]]', lin['VATCode']);
                lineTxt = lineTxt.replace('[[Comment]]', lin['Comment']);
                lineTxt = lineTxt.replace('[[FlagDC]]', lin['FlagDC']);
                lineTxt = lineTxt.replace('[[CrcyID]]', lin['CrcyID']);
                lineTxt = lineTxt.replace('[[AmountCrcy]]', lin['AmountCrcy']);
                lineTxt = lineTxt.replace('[[AmountCrcyDoc]]', lin['AmountCrcyDoc']);
                lineTxt = lineTxt.replace('[[AmountCrcyBase]]', lin['AmountCrcyBase']);
                lineTxt = lineTxt.replace('[[AmountVATCrcyDoc]]', lin['AmountVATCrcyDoc']);
                lineTxt = lineTxt.replace('[[AnalRecordTag]]', '');
                lineTxt = lineTxt.replace('[[AnalQuantity]]', '0');
                lineTxt = lineTxt.replace('[[AnalPercent]]', '0.00');
                lines += lineTxt;

            });

            body += "Sales:\r\n{\r\n";
            body += head;
            body += lines;
            body += "\r\n}\r\n";

        });

        console.log(k+'/'+i);

        var aactingselect = dateYear - 2012;
        this.template = this.template.replace('[[AcctingSelect]]', aactingselect < 10 ? '0' + aactingselect : aactingselect);

        return this.template + body;
    }


}

module.exports.Treatment = new Treatment();