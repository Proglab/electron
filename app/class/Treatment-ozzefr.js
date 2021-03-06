const fs = require('fs');
const path = require('path');
const params = require('../config/tvafactozzefr');
const ozzefr = require('../config/ozzefr');

class Treatment {
    constructor() {
        this.CreateKeyAll= ozzefr.CreateKeyAll;
        this.IgnoreAnalClosed= ozzefr.IgnoreAnalClosed;
        this.DossierSelect= ozzefr.DossierSelect;
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

        $.each(text, function(index, value ) {

            if (!$.isNumeric(value.Compte))
            {
                if (i!=0 && value.NumPiece != oldNumPiece)
                {
                    body = body.replace('[[AmountCrcyDoc]]', parseFloat(sum).toFixed(2));
                    sum=0;
                }
                oldNumPiece = value.NumPiece;

                if (i > 0)
                {
                    body += "\r\n}\r\n";
                }
                console.log(headTemplate);
                body += "Sales:\r\n{\r\n";

                const dateStr = value.Date.replace('/', '-').replace('/', '-').replace('2017', '17');
                const dateEchStr = value.DateEcheance.replace('/', '-').replace('/', '-').replace('2017', '17');

                console.log(dateEchStr);

                const date = dateStr.split('-');
                if (dateYear == null)
                {
                    var d = value.Date.replace('/', '-').replace('/', '-').split('-');
                    dateYear = d[2];
                }


                let head =  headTemplate.replace('[[JrnlID]]', value.Libelle.indexOf("AVOIR") == 0 ? 'FV5' : 'FV4');
                head =  head.replace('[[DocType]]', 1);
                head =  head.replace('[[DocNumber]]', value.NumPiece.replace('FF', '10').replace('AF', '20'));
                head =  head.replace('[[CustID]]', value.CompteTiers.replace('AZ_', ''));
                head =  head.replace('[[Comment]]', value.Libelle);
                head =  head.replace('[[PeriodID]]', parseInt(date[1]));
                head =  head.replace('[[DateDoc]]',dateStr+' 00:00:00');
                head =  head.replace('[[DateDue]]', dateEchStr == '' ? dateStr +' 00:00:00' : dateEchStr + ' 00:00:00');
                head =  head.replace('[[Piece]]', '');
                head =  head.replace('[[CrcyDoc]]', "EUR");
                //head =  head.replace('[[AmountCrcyDoc]]', parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                body += head;
            }
            else
            {
                if (value.Compte.substr(0, 1) == 4)
                {
                    return true;
                }

                let FlagDC = value.Debit == 0 ? 'C' : 'D';
                let VATCode = params[value.Compte].tva;
                let GnrlID = params[value.Compte].facture;

                sum = FlagDC == 'C' ? parseFloat(sum) + parseFloat(parseFloat(value.Credit.replace(',', '.')).toFixed(2)) : parseFloat(sum) + parseFloat(parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                sum = FlagDC == 'C' ? parseFloat(sum) + parseFloat(Math.round(parseFloat(value.Credit.replace(',', '.')*VATCode/100)*100)/100) : parseFloat(sum) + parseFloat(Math.round(parseFloat(value.Debit.replace(',', '.')*VATCode/100)*100)/100);

                let line =  lineTemplate.replace('[[GnrlID]]', GnrlID);
                line =  line.replace('[[AnalID]]', '');
                line =  line.replace('[[VATCode]]', VATCode);
                line =  line.replace('[[Comment]]', value.Libelle);
                line =  line.replace('[[FlagDC]]', FlagDC);
                line =  line.replace('[[CrcyID]]', 'EUR');
                line =  line.replace('[[AmountCrcy]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyDoc]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyBase]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountVATCrcyDoc]]', FlagDC == 'C' ? (Math.round(parseFloat(value.Credit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2) :  (Math.round(parseFloat(value.Debit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2));
                line =  line.replace('[[AnalRecordTag]]', '');
                line =  line.replace('[[AnalQuantity]]', '0');
                line =  line.replace('[[AnalPercent]]', '0.00');
                body += line;

            }
            i++;
        });
        body = body.replace('[[AmountCrcyDoc]]', parseFloat(sum).toFixed(2));
        body += '}';
        console.log('Transformation ending...');

        var aactingselect = dateYear - 2002;
        this.template = this.template.replace('[[AcctingSelect]]', aactingselect < 10 ? '0'+aactingselect : aactingselect);
        return this.template+body;
    }


}

module.exports.Treatment = new Treatment();