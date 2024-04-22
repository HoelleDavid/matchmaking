require("dotenv").config();
const session = require("express-session");
const mysql = require("mysql2");
const MySQLStore = require('express-mysql-session')(session);


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
        if(process.env.initializeTables){
            UserModel.createSchema().catch((err) => {`Failed to initialize Table on Database\n${err}`});
            UserPrivilegeModel.createSchema().catch((err) => {`Failed to initialize Table on Database\n${err}`});
        }
        console.log('MySQLStore ready');
    }
).catch(
    error => {
        // Something went wrong.
        console.error(error);
    }
);


///========SQL-Masks========


var UserModel = {}
UserModel.createSchema = () =>{
    const q = "CREATE TABLE User(username varchar(255) NOT NULL UNIQUE PRIMARY KEY, hash varchar(255) NOT NULL,salt varchar(255) NOT NULL);"
    return connection.promise().query(q)
}
UserModel.findByUsername = (username) => {
    const q = `SELECT username,hash,salt FROM User WHERE username = '${username}' LIMIT 1;`
    return connection.promise().query(q).then(
        (sqlRes) => { return sqlRes[0]}
	);
}
UserModel.register = (username,hash,salt) => {
    const q = `INSERT INTO User(username,hash,salt) VALUES ('${username}','${hash}','${salt}');`
    return connection.promise().query(q)
};
UserModel.delete = (username) => {
    const q = `DELETE FROM User WHERE username = '${username}';`
    return connection.promise().query(q)
}


var UserPrivilegeModel = {}
UserPrivilegeModel.createSchema = () => {
    const q = "CREATE TABLE ServerUser(username varchar(255) NOT NULL UNIQUE PRIMARY KEY);"
    return connection.promise().query(q)
}
UserPrivilegeModel.isServerUser = (username) => {
    const q = `SELECT * FROM ServerUser WHERE username ='${username}' LIMIT 1;`
    return connection.promise().query(q).then(
        (sqlRes) => sqlRes[0].length !== 0
    );

    
}
UserPrivilegeModel.setServerUser = (username) => {
    const q = `INSERT INTO ServerUser(username) VALUES ('${username}');`
    return connection.promise().query(q).catch((err) => {})
};
UserPrivilegeModel.revokeServerUser = (username) => {
    const q = `DELETE FROM ServerUser where username=('${username}');`
    return connection.promise().query(q)
};

module.exports = {sessionStore,connection,UserModel,UserPrivilegeModel}
