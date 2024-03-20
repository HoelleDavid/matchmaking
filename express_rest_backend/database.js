require("dotenv").config();
const session = require("express-session");
const mysql = require("mysql2");
const MySQLStore = require('express-mysql-session')(session);

const {SQLServerUser,SQLServerPassword,SQLServerIP,SQLServerPORT}= require("./globals");
const _createUserSchemaQuery = "CREATE TABLE User(username varchar(255),hash varchar(255),salt varchar(255));"


const mysql_options = {
	host: process.env.SQLServerIP,
	port: process.env.SQLServerPORT,
	user: process.env.SQLServerUser,
	password: process.env.SQLServerPassword,
	database: process.env.SQLServerSchema
};

const connection = mysql.createConnection(mysql_options)

const sessionStore = new MySQLStore({},connection);


// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(
    () => {
        // MySQL session store ready for use.
        console.log('MySQLStore ready');
    }
).catch(
    error => {
        // Something went wrong.
        console.error(error);
    }
);

if(process.env.initializeTables){
    connection.query(_createUserSchemaQuery);
}
module.exports = {sessionStore,connection}
