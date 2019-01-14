const fs = require('fs');
const path = require('path');
const params = require('../config/tvacom');
const ozzebecom = require('../config/ozzebecom');

class Treatment {
    constructor() {
        this.CreateKeyAll= ozzebecom.CreateKeyAll;
        this.IgnoreAnalClosed= ozzebecom.IgnoreAnalClosed;
        this.DossierSelect= ozzebecom.DossierSelect;
        this.AcctingSelect= ozzebecom.AcctingSelect;
    }

    treat(text) {
        console.log('Transformation starting...');
        let dir = path.join(__dirname, '../fileTemplates', 'template.txt');
        let txtTransformed = fs.readFileSync(dir).toString();
        txtTransformed = txtTransformed.replace('[[CreateKeyAll]]', this.CreateKeyAll);
        txtTransformed = txtTransformed.replace('[[IgnoreAnalClosed]]', this.IgnoreAnalClosed);
        txtTransformed = txtTransformed.replace('[[DossierSelect]]', this.DossierSelect);
        txtTransformed = txtTransformed.replace('[[AcctingSelect]]', this.AcctingSelect);
        this.template = txtTransformed;


        dir = path.join(__dirname, '../fileTemplates', 'headcom.txt');
        var headTemplate = fs.readFileSync(dir).toString();

        dir = path.join(__dirname, '../fileTemplates', 'line.txt');
        var lineTemplate = fs.readFileSync(dir).toString();

        var body = '';

        var i = 0;


        var sum=0;
        var oldNumPiece = null;
        var num = '';


        $.each(text, function(index, value ) {
            if (i < 9)
            {
                num = '000' + i;
            }
            else if (i < 99)
            {
                num = '00' + i;
            }
            else if (i < 999)
            {
                num = '0' + i;
            }

            const dateStr = value.Date;
            const date = dateStr.split('/');


            if (value.CompteGeneral == '613222')
            {
                if (i > 0)
                {
                    body += "\r\n}\r\n";
                }
                console.log(headTemplate);
                body += "Purchases:\r\n{\r\n";

                let head =  headTemplate.replace('[[JrnlID]]', 'PRE');
                head =  head.replace('[[DocType]]', 1);
                head =  head.replace('[[Comment]]', 'NCOM' + ' ' + parseInt(date[1]) + '/' + parseInt(date[2]));
                head =  head.replace('[[PeriodID]]', parseInt(date[1]));
                head =  head.replace('[[DateDoc]]',dateStr+' 00:00:00');
                head =  head.replace('[[DateDue]]', dateStr+' 00:00:00');
                head =  head.replace('[[Piece]]', '');
                head =  head.replace('[[CrcyDoc]]', "EUR");
                head =  head.replace('[[AmountCrcyDoc]]', parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                body += head;
                oldNumPiece = value.Compte;

            }
            else if (value.CompteGeneral != '')
            {
                if (value.Libelle.substr(0, 17) == 'Urssaf Entreprise')
                {
                    return true;
                }

                let FlagDC = value.Debit == 0 ? 'D' : 'C';

                console.log(value.Compte);

                let VATCode = '0';


                let GnrlID = value.Compte;

                sum = FlagDC == 'C' ? parseFloat(sum) + parseFloat(parseFloat(value.Credit.replace(',', '.')).toFixed(2)) : parseFloat(sum) + parseFloat(parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                sum = FlagDC == 'C' ? parseFloat(sum) + parseFloat(Math.round(parseFloat(value.Credit.replace(',', '.')*VATCode/100)*100)/100) : parseFloat(sum) + parseFloat(Math.round(parseFloat(value.Debit.replace(',', '.')*VATCode/100)*100)/100);

                let line =  lineTemplate.replace('[[GnrlID]]', oldNumPiece);
                line =  line.replace('[[AnalID]]', '');
                line =  line.replace('[[VATCode]]', VATCode);
                line =  line.replace('[[Comment]]', 'NCOM' + ' ' + parseInt(date[1]) + '/' + parseInt(date[2]));
                line =  line.replace('[[FlagDC]]', FlagDC);
                line =  line.replace('[[CrcyID]]', 'EUR');
                line =  line.replace('[[AmountCrcy]]', FlagDC == 'D' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyDoc]]', FlagDC == 'D' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyBase]]', FlagDC == 'D' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountVATCrcyDoc]]', FlagDC == 'D' ? (Math.round(parseFloat(value.Credit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2) :  (Math.round(parseFloat(value.Debit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2));
                line =  line.replace('[[AnalRecordTag]]', '');
                line =  line.replace('[[AnalQuantity]]', '0');
                line =  line.replace('[[AnalPercent]]', '0.00');
                body += line;

                oldNumPiece = value.Compte;
            }
            else
            {
                const dateStr = value.Date.replace('/', '-').replace('/', '-').replace('2017', '17');
                const date = dateStr.split('-');
                body =  body.replace('[[DocNumber]]', date[1] + num);


                if (value.CompteTiers == '')
                {
                    return true;
                }

                body = body.replace('[[SuppID]]', value.Compte.replace('AZ_', ''));


                let FlagDC = value.Debit == 0 ? 'D' : 'C';

                console.log(value.Compte);

                let VATCode = '0';
                let GnrlID = value.Compte;

                sum = FlagDC == 'C' ? parseFloat(sum) + parseFloat(parseFloat(value.Credit.replace(',', '.')).toFixed(2)) : parseFloat(sum) + parseFloat(parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                sum = FlagDC == 'C' ? parseFloat(sum) + parseFloat(Math.round(parseFloat(value.Credit.replace(',', '.')*VATCode/100)*100)/100) : parseFloat(sum) + parseFloat(Math.round(parseFloat(value.Debit.replace(',', '.')*VATCode/100)*100)/100);

                let line =  lineTemplate.replace('[[GnrlID]]', oldNumPiece);
                line =  line.replace('[[AnalID]]', '');
                line =  line.replace('[[VATCode]]', VATCode);
                line =  line.replace('[[Comment]]', 'NCOM' + ' ' + parseInt(date[1]) + '/' + parseInt(date[2]));
                line =  line.replace('[[FlagDC]]', FlagDC);
                line =  line.replace('[[CrcyID]]', 'EUR');
                line =  line.replace('[[AmountCrcy]]', FlagDC == 'D' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyDoc]]', FlagDC == 'D' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyBase]]', FlagDC == 'D' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountVATCrcyDoc]]', FlagDC == 'D' ? (Math.round(parseFloat(value.Credit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2) :  (Math.round(parseFloat(value.Debit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2));
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
        return this.template+body;
    }


}

module.exports.Treatment = new Treatment();