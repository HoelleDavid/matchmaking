require("dotenv").config();
const session = require("express-session");
const mysql = require("mysql2");
const MySQLStore = require('express-mysql-session')(session);

//server config hidden in /.env file
const mysql_options = {
	host: process.env.SQLServerIP,
	port: process.env.SQLServerPORT,
	user: process.env.SQLServerUser,
	password: process.env.SQLServerPassword,
	database: process.env.SQLServerSchema
};

// connect with a mysql database
const connection = mysql.createConnection(mysql_options)
//@export: create session store object for express session 
const sessionStore = new MySQLStore({},connection);

//
sessionStore.onReady().then(
    () => {
        // MySQL session store ready for use.
        if(process.env.initializeTables == "true"){
            UserModel.createSchema()//`Failed to initialize Table on Database\n${err}`
            UserPrivilegeModel.createSchema()//`Failed to initialize Table on Database\n${err}`
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
    const q = "CREATE TABLE User(username varchar(255) NOT NULL UNIQUE PRIMARY KEY, hash varchar(255) NOT NULL,salt varchar(255) NOT NULL,privilege TINYINT NOT NULL);"
    return connection.promise().query(q)
}
UserModel.dropSchema = () =>{
    const q = "DROP TABLE User;"
    return connection.promise().query(q)
}
UserModel.findByUsername = (username) => {
    const q = `SELECT username,hash,salt FROM User WHERE username = '${username}' LIMIT 1;`
    return connection.promise().query(q).then(
        (sqlRes) => { return sqlRes[0]}
	);
}
UserModel.register = (username,hash,salt,privilege = 1) => {
    const q = `INSERT INTO User(username,hash,salt,privilege) VALUES ('${username}','${hash}','${salt}','${privilege}');`
    return connection.promise().query(q)
};
UserModel.delete = (username) => {
    const q = `DELETE FROM User WHERE username = '${username}';`
    return connection.promise().query(q)
}
UserModel.getPrivilege = (username) => {
    const q = `SELECT privilege FROM User WHERE username ='${username}' LIMIT 1;`
    return connection.promise().query(q).then(
        (sqlRes) => sqlRes[0][0].privilege
    );
}
UserModel.setPrivilege = (username,privilege) => {
    const q = `UPDATE User(username,hash,salt,privilege) SET privilege='${privilege}' WHERE  SET username='${username}');`
    return connection.promise().query(q)
};
module.exports = {sessionStore,UserModel}
