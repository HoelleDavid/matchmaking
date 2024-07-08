require("dotenv").config();
const session = require("express-session");
const mysql = require("mysql2");
const MySQLStore = require('express-mysql-session')(session);

const { generateHashSalt } = require("./crypt")

//server config hidden in /.env file
const mysql_options = {
	host: process.env.SQLServerIP,
	port: process.env.SQLServerPORT,
	user: process.env.SQLServerUser,
	password: process.env.SQLServerPassword,
	database: process.env.SQLServerSchema
}
// connect with a mysql database
const connection = mysql.createConnection(mysql_options)
//@export: create session store object for express session 
const session_store = new MySQLStore(mysql_options,connection)


session_store.onReady().then( // MySQL session store ready for use.
    () => console.log('MySQLStore ready')     
).then(
    () => {
        var reset_actions = []
        // Check if env tells us to reset database tables and admin credentials
        if(process.env.resetTables != "true")
            reset_actions += [
                UserModel.dropSchema(),
                MatchModel.dropSchema(),
                UserModel.createSchema(),
                MatchModel.createSchema()
            ]
        if(process.env.resetAdmin == "true"){
            const hash_salt = generateHashSalt(process.env.adminPassword)
            reset_actions += [
                UserModel.delete(process.env.adminUsername),
                UserModel.register(process.env.adminUsername,hash_salt.hash,hash_salt.salt,3)
            ]
        }
        Promise.all(reset_actions).then(
            () => console.warn("completed reset actions from .env")
        ).catch(
            err => {console.warn(`failed reset actions from .env ${err}`)}
        )
    }
).catch( //fatal errors in session store creation
    error => console.error(error)
)


///========SQL-Masks========

//      Users
var UserModel = {}
UserModel.createSchema = () =>{
    const q = "CREATE TABLE User(username varchar(255) NOT NULL UNIQUE PRIMARY KEY, hash varchar(255) NOT NULL,salt varchar(255) NOT NULL,privilege TINYINT NOT NULL,rating INT NOT NULL);"
    return connection.promise().query(q)
}
UserModel.dropSchema = () =>{
    const q = "DROP TABLE User;"
    return connection.promise().query(q)
}
UserModel.findByUsername = (username) => {
    const q = `SELECT username,hash,salt,privilege,rating FROM User WHERE username = '${username}' LIMIT 1;`
    return connection.promise().query(q).then(
        sqlRes => sqlRes[0][0]
	)
}
UserModel.register = (username,hash,salt,privilege = 1,rating = 1000) => {
    const q = `INSERT INTO User(username,hash,salt,privilege,rating) VALUES ('${username}','${hash}','${salt}','${privilege}','${rating}');`
    return connection.promise().query(q)
}
UserModel.delete = (username) => {
    const q = `DELETE FROM User WHERE username = '${username}';`
    return connection.promise().query(q)
}
UserModel.getPrivilege = (username) => {
    const q = `SELECT privilege FROM User WHERE username ='${username}' LIMIT 1;`
    return connection.promise().query(q).then(
        (sqlRes) => sqlRes[0][0].privilege
    )
}
UserModel.setPrivilege = (username,privilege) => {
    const q = `UPDATE User SET privilege='${privilege}' WHERE username='${username}';`
    return connection.promise().query(q)
};
UserModel.getRating = (username) => {
    const q = `SELECT rating FROM User WHERE username ='${username}' LIMIT 1;`
    return connection.promise().query(q).then(
        (sqlRes) => sqlRes[0][0].rating
    );
}
UserModel.setRating = (username,rating) => {
    const q = `UPDATE User SET rating='${rating}' WHERE username='${username}';`
    return connection.promise().query(q)
};



//      Matches
var MatchModel = {}
MatchModel.createSchema = () =>{
    const q = "CREATE TABLE MatchHistory(match_id INT AUTO_INCREMENT PRIMARY KEY, host varchar(255) NOT NULL, players TEXT, start DATETIME DEFAULT NULL,end DATETIME,result TEXT);"
    return connection.promise().query(q)
}
MatchModel.dropSchema = () =>{
    const q = "DROP TABLE MatchHistory;"
    return connection.promise().query(q)
}
MatchModel.getById = (match_id) => { 
    const q = `SELECT * FROM MatchHistory WHERE match_id= '${match_id}';`
    return connection.promise().query(q).then(
        (sqlRes) => sqlRes[0][0]
    )
}
MatchModel.addMatch = (host_username) => { 
    const q = `INSERT INTO MatchHistory(host) VALUES ('${host_username}');`
    return connection.promise().query(q).then(res => res[0]["insertId"])
}
MatchModel.setPlayers = (match_id,players) => {
    const q = `UPDATE MatchHistory SET start = NOW(), players='${players}' WHERE match_id='${match_id}';`
    return connection.promise().query(q)
}
MatchModel.getWaitingMatches = () => {
    const q = `SELECT * FROM MatchHistory WHERE start IS NULL;`
    return connection.promise().query(q).then(
        (sqlRes) => console.log(sqlRes[0])
    );
}
MatchModel.getRunningMatches = () => {
    const q = `SELECT * FROM MatchHistory WHERE end IS NULL AND start IS NOT NULL;`
    return connection.promise().query(q).then(
        (sqlRes) => console.log(sqlRes[0])
    );
}
MatchModel.setResult = (match_id,result) => {
    const q = `UPDATE MatchHistory SET end = NOW(), result='${result}' WHERE match_id='${match_id}';`
    return connection.promise().query(q)
}

module.exports = {connection,session_store,UserModel,MatchModel}
