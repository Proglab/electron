const fs = require('fs');
const path = require('path');
const params = require('../config/tvafactazzafr');
const azzafr = require('../config/azzafr');

class Treatment {
    constructor() {
        this.CreateKeyAll= azzafr.CreateKeyAll;
        this.IgnoreAnalClosed= azzafr.IgnoreAnalClosed;
        this.DossierSelect= azzafr.DossierSelect;
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


        var sum=0;
        var oldNumPiece = null;

        var dateYear = null;

        var heads = '';
        var lines = '';


        $.each(text, function(index, value ) {

            if (!$.isNumeric(value.Compte))
            {
                sum=0;

                if (i > 0)
                {
                    body += "Sales:\r\n{\r\n";
                    body += heads;
                    body += lines;
                    body += "\r\n}\r\n";
                    heads = '';
                    lines = '';
                }
                console.log(headTemplate);

                const dateStr = value.Date.replace('/', '-').replace('/', '-').replace('2017', '17');
                const dateEchStr = value.DateEcheance.replace('/', '-').replace('/', '-').replace('2017', '17');

                console.log(dateEchStr);

                const date = dateStr.split('-');
                if (dateYear == null)
                {
                    var d = value.Date.replace('/', '-').replace('/', '-').split('-');
                    dateYear = d[2];
                }


                let head =  headTemplate.replace('[[JrnlID]]', value.Libelle.indexOf("AVOIR") == 0 ? 'FV1' : 'FV4');
                head =  head.replace('[[DocType]]', 1);
                head =  head.replace('[[DocNumber]]', value.NumPiece.replace('FF', '10').replace('AF', '11'));

                var index = value.CompteTiers.indexOf('_');


                console.log('head');
                console.log(value);
                var len = value.CompteTiers.length;


                head =  head.replace('[[CustID]]', value.CompteTiers.substring(index+1, len));
                head =  head.replace('[[Comment]]', value.Libelle);
                head =  head.replace('[[PeriodID]]', parseInt(date[1]));
                head =  head.replace('[[DateDoc]]',dateStr);
                head =  head.replace('[[DateDue]]', dateEchStr == '' ? dateStr : dateEchStr);
                head =  head.replace('[[Piece]]', '');
                head =  head.replace('[[CrcyDoc]]', "EUR");
                head =  head.replace('[[AmountCrcyDoc]]', value.Credit == '0' ? parseFloat(value.Debit.replace(',', '.')).toFixed(2) : parseFloat(value.Credit.replace(',', '.')).toFixed(2));
                heads += head;
            }
            else
            {
                console.log('line');
                console.log(value);

                if (value.Compte.substr(0, 1) == 4)
                {
                    return true;
                }

                let FlagDC = value.Debit == 0 ? 'C' : 'D';
                let VATCode = params[value.Compte].tva;
                let GnrlID = params[value.Compte].facture;

                let tva = 0;
                if (FlagDC == 'C')
                {
                    tva = parseFloat(value.Credit.replace(',', '.'))*VATCode;
                    tva = Math.trunc(parseFloat(tva))/100;
                }
                else
                {
                    tva = parseFloat(value.Debit.replace(',', '.'))*VATCode;
                    tva = Math.trunc(parseFloat(tva))/100;
                }

                let line =  lineTemplate.replace('[[GnrlID]]', GnrlID);
                line =  line.replace('[[AnalID]]', '');
                line =  line.replace('[[VATCode]]', VATCode);
                line =  line.replace('[[Comment]]', value.Libelle);
                line =  line.replace('[[FlagDC]]', FlagDC);
                line =  line.replace('[[CrcyID]]', 'EUR');
                line =  line.replace('[[AmountCrcy]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyDoc]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyBase]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountVATCrcyDoc]]', tva);
                line =  line.replace('[[AnalRecordTag]]', '');
                line =  line.replace('[[AnalQuantity]]', '0');
                line =  line.replace('[[AnalPercent]]', '0.00');
                lines += line;

            }
            i++;
        });

        body += "Sales:\r\n{\r\n";
        body += heads;
        body += lines;
        body += "\r\n}\r\n";
        console.log('Transformation ending...');


        console.log('dateYear' + dateYear);

        var aactingselect = dateYear - 2012;
        this.template = this.template.replace('[[AcctingSelect]]', aactingselect < 10 ? '0'+aactingselect : aactingselect);

        return this.template+body;
    }


}

module.exports.Treatment = new Treatment();