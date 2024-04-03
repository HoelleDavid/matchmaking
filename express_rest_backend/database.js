require("dotenv").config();
const session = require("express-session");
const mysql = require("mysql2");
const MySQLStore = require('express-mysql-session')(session);

const _createUserTableQuery = "CREATE TABLE User(username varchar(255) NOT NULL UNIQUE PRIMARY KEY, hash varchar(255) NOT NULL,salt varchar(255) NOT NULL);"
const _createServerUserTableQuary = "CREATE TABLE ServerUser(username varchar(255) NOT NULL UNIQUE PRIMARY KEY);"
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
    connection.promise().query(_createUserTableQuery).catch((err) => {`Failed to initialize Table on Database\n${err}`});
    connection.promise().query(_createServerUserTableQuary).catch((err) => {`Failed to initialize Table on Database\n${err}`});
}



///========SQL-Masks========


var UserModel = {}
UserModel.findByUsername = (username) => {
    const q = `SELECT username,hash,salt FROM User WHERE username = '${username}' LIMIT 1;`
    //console.log(q)
    return connection.promise().query(q).then(
        (sqlRes) => { return sqlRes[0]}
	);

    
}
UserModel.register = (username,hash,salt) => {
    const q = `INSERT INTO User(username,hash,salt) VALUES ('${username}','${hash}','${salt}');`
    //console.log(q)
    return connection.promise().query(q)
};


var UserPrivilegeModel = {}
UserPrivilegeModel.isServerUser = (username) => {
    const q = `SELECT * FROM ServerUser WHERE username ='${username}' LIMIT 1;`
    //console.log(q)
    return connection.promise().query(q).then(
        (sqlRes) => { return sqlRes[0][0] != undefined}
	).catch(
        (err) => {return false;}
    );

    
}
UserPrivilegeModel.setServerUser = (username) => {
    const q = `INSERT INTO ServerUser(username) VALUES ('${username}');`
    //console.log(q)
    return connection.promise().query(q)
};
UserPrivilegeModel.revokeServerUser = (username) => {
    const q = `DELETE FROM ServerUser where username=('${username}');`
    //console.log(q)
    return connection.promise().query(q)
};

module.exports = {sessionStore,connection,UserModel,UserPrivilegeModel}
