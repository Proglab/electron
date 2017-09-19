const mysql = require('MySQL');

let MySQL = Object.create({
    host: "localhost",
    user: 'root',
    password: null,
    database: 'electron',
    connection: null,
    connect: () => {
        if (this.connection == null)
        {
            this.connection = mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            });
            this.connection.connect((err) => {
                if (err) {
                    console.log('Connexion failed');
                }
            });
        }
        return this;
    },
    query:(sql) => {
        this.connection.query(sql, function(err, rows, fields) {
            if (err) {
                console.log("An error ocurred performing the query.");
                console.log(err);
                return;
            }
            return {rows: rows, fields: fields};
        });
    }
});

module.exports.MySQL = MySQL;