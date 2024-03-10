
const {SQLServerUser,SQLServerPassword,SQLServerIP,SQLServerPORT}= require("./globals");

let mysql = require('mysql2');
let connection = null;
function connectDatabase(){
    connection = mysql.createConnection(
        {
            host: SQLServerIP,
            port: SQLServerPORT,
            user: SQLServerUser,
            password: SQLServerPassword,
            database: "matchmaking",
        }
    );
    console.log(connection);
    connection.connect( err => {
        if(err){
            throw new Error(`Failed to connect to MYSQL database at ${SQLServerUser}@${SQLServerIP}:${SQLServerPORT}`)
        };
        //console.log("Connected to MYSQl DB\n\n\n");
        //console.log(connection.);
    });
    
}

function SQLQuery(statement){
    //console.log(connection);
    //console.log(connection.query(statement));
}



module.exports = {connectDatabase,SQLQuery}