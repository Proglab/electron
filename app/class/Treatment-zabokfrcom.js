const fs = require('fs');
const path = require('path');
const params = require('../config/tvacom');
const zabokfrcom = require('../config/zabokfrcom');

class Treatment {
    constructor() {
        this.CreateKeyAll= zabokfrcom.CreateKeyAll;
        this.IgnoreAnalClosed= zabokfrcom.IgnoreAnalClosed;
        this.DossierSelect= zabokfrcom.DossierSelect;
        this.AcctingSelect= zabokfrcom.AcctingSelect;
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

        var name = '';
        var lastname = '';

        var lines = '';
        var heads = '';


        $.each(text, function(index, value ) {

            if (name == '')
            {
                name = value.Libelle.substr(11, value.Libelle.length);
                lastname = name;
                console.log('init ' + name);

            }
            else
            {
                let totalchar = value.Libelle.length;
                let namechar = name.length;
                name = value.Libelle.substr(totalchar - namechar, namechar);
            }

            if (name != lastname)
            {
                body += "Purchases:\r\n{\r\n" + heads + lines + "\r\n}\r\n";
                lines = '';

                console.log('TOTAL' + sum);
                //total
                name = '';

                sum = 0;

            }

            const dateStr = value.Date;
            const date = dateStr.split('/');



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
            else if (i < 9999)
            {
                num = i;
            }

            if (value.CompteGeneral != '')
            {
                //traitement
                let FlagDC = value.Debit == 0 ? 'C' : 'D';
                let VATCode = '0';
                let GnrlID = value.Compte;

                sum = FlagDC == 'C' ? parseFloat(sum) - parseFloat(parseFloat(value.Credit.replace(',', '.')).toFixed(2)) : parseFloat(sum) + parseFloat(parseFloat(value.Debit.replace(',', '.')).toFixed(2));

                let line =  lineTemplate.replace('[[GnrlID]]', GnrlID);
                line =  line.replace('[[AnalID]]', '');
                line =  line.replace('[[VATCode]]', VATCode);
                line =  line.replace('[[Comment]]', 'NCOM' + ' ' + parseInt(date[1]) + '/' + parseInt(date[2]));
                line =  line.replace('[[FlagDC]]', FlagDC);
                line =  line.replace('[[CrcyID]]', 'EUR');
                line =  line.replace('[[AmountCrcy]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyDoc]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyBase]]', FlagDC == 'C' ? parseFloat(value.Credit.replace(',', '.')).toFixed(2) : parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountVATCrcyDoc]]', FlagDC == 'C' ? (Math.round(parseFloat(value.Credit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2) :  (Math.round(parseFloat(value.Debit.replace(',', '.')*VATCode/100)*100)/100).toFixed(2));
                line =  line.replace('[[AnalRecordTag]]', '');
                line =  line.replace('[[AnalQuantity]]', '0');
                line =  line.replace('[[AnalPercent]]', '0.00');
                lines += line;

            }
            else
            {


                let head =  headTemplate.replace('[[JrnlID]]', 'PRE');
                head =  head.replace('[[DocType]]', 1);
                head =  head.replace('[[DocNumber]]', date[1] + num);
                head =  head.replace('[[SuppID]]', value.Compte.replace('AZ_', ''));
                head =  head.replace('[[Comment]]', 'NCOM' + ' ' + parseInt(date[1]) + '/' + parseInt(date[2]));
                head =  head.replace('[[PeriodID]]', parseInt(date[1]));
                head =  head.replace('[[DateDoc]]',dateStr+' 00:00:00');
                head =  head.replace('[[DateDue]]', dateStr+' 00:00:00');
                head =  head.replace('[[Piece]]', '');
                head =  head.replace('[[CrcyDoc]]', "EUR");
                head =  head.replace('[[AmountCrcyDoc]]', parseFloat(sum).toFixed(2));

                heads = head;
            }

            lastname = name;

            i++;
        });
        console.log('Transformation ending...');
        return this.template+body;
    }


}

module.exports.Treatment = new Treatment();