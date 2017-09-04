const fs = require('fs');
const path = require('path');


class Treatment {
    constructor() {
        this.CreateKeyAll= 'Y';
        this.IgnoreAnalClosed= 'Y';
        this.DossierSelect= '0312';
        this.AcctingSelect= '15';
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


        dir = path.join(__dirname, '../fileTemplates', 'head.txt');
        var headTemplate = fs.readFileSync(dir).toString();

        dir = path.join(__dirname, '../fileTemplates', 'line.txt');
        var lineTemplate = fs.readFileSync(dir).toString();

        var body = '';

        var i = 0;
        $.each(text, function( index, value ) {
            if (!$.isNumeric(value.Compte))
            {
                if (i > 0)
                {
                    body += "}\r\n";
                }
                console.log(headTemplate);
                body += "Sales:\r\n{\r\n";

                let head =  headTemplate.replace('[[JrnlID]]', value.Journal);
                head =  head.replace('[[DocType]]', 1);
                head =  head.replace('[[DocNumber]]', 'fix');
                head =  head.replace('[[CustID]]', value.CompteTiers.replace('AZ_', ''));
                head =  head.replace('[[Comment]]', value.Libelle);
                head =  head.replace('[[PeriodID]]', 'fix');
                head =  head.replace('[[DateDoc]]',value.Date+' 00:00:00');
                head =  head.replace('[[DateDue]]', value.DateEcheance+' 00:00:00');
                head =  head.replace('[[Piece]]', '');
                head =  head.replace('[[CrcyDoc]]', "EUR");
                head =  head.replace('[[AmountCrcyDoc]]', parseFloat(value.Debit.replace(',', '.')).toFixed(2));
                body += head;
            }
            else
            {
                let line =  lineTemplate.replace('[[GnrlID]]', value.Compte);
                line =  line.replace('[[AnalID]]', '');
                line =  line.replace('[[VATCode]]', '21');
                line =  line.replace('[[Comment]]', value.Libelle);
                line =  line.replace('[[FlagDC]]', '1');
                line =  line.replace('[[CrcyID]]', 'EUR');
                line =  line.replace('[[AmountCrcy]]', parseFloat(value.Credit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyDoc]]', parseFloat(value.Credit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountCrcyBase]]', parseFloat(value.Credit.replace(',', '.')).toFixed(2));
                line =  line.replace('[[AmountVATCrcyDoc]]', parseFloat(value.Credit.replace(',', '.')*21/100).toFixed(2));
                line =  line.replace('[[AnalRecordTag]]', '');
                line =  line.replace('[[AnalQuantity]]', '0');
                line =  line.replace('[[AnalPercent]]', '0.00');
                body += line;

            }
            i++;
        });
        body += '}';
        console.log('Transformation ending...');
        return this.template+body;
    }


}

module.exports.Treatment = new Treatment();