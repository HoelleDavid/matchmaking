
const express 	= require('express');
const session 	= require('express-session');
const passport 	= require("passport");
const routes 	= require("routes");

const MySQLStore = require('express-mysql-session')(session);

const app = module.exports = express();

const {SQLServerUser,SQLServerPassword,SQLServerIP,SQLServerPORT}= require("./globals");


const options = {
	host: SQLServerIP,
	port: SQLServerPORT,
	user: SQLServerUser,
	password: SQLServerPassword,
	database: 'matchmaking'
};

const sessionStore = new MySQLStore(options);
// Optionally use onReady() to get a promise that resolves when store is ready.
sessionStore.onReady().then(() => {
	// MySQL session store ready for use.
	console.log('MySQLStore ready');
}).catch(error => {
	// Something went wrong.
	console.error(error);
});


function errHandler(err,req,res,next) {
	if (err){
		res.send(`backend error ${err}`)
		console.log(err);
	}
};


function middleware_pattern(req,res,next) {
	//CODE
	let possibleErrors = new Error("not actually an err");
	next(possibleErrors);
};

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(session({
	key: 'session_cookie_name',
	secret: 'session_cookie_secret',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}));

app.get("/register/", (req,res,next) => {
	res.send("this will be register page !!");
});

app.get("/login/", (req,res,next) => {
	res.send("this will be login page !!");
});
app.get("/", (req,res,next) => {
	res.send("root request answer !!");
});
app.get("/testing/", (req,res,next) => {
	if(!req.session.viewCount){
		req.session.viewCount = 0;
	}
	req.session.viewCount += 1;
	res.send({svc:req.session.viewCount});
});

app.use(errHandler);

app.listen(3000);
/*
const { connectDatabase,SQLQuery } = require("./database_connector");
const os = require("os")
const {uuidv4} = require("uuid");
const express = require("express");
const express_session = require("express-session");

const app = express();
app.use(
    express_session(
        {
            genid: (request) => {
                console.log(request.sessionID);
                return uuidv4();
            },
            store:,
            secret:"TODO PRIV KEY",
            resave:false,
            saveUninitialized:true,
        }
    )
);




//connectDatabase();

/*
const framerate = 60*10* 1000/60;
function frameFunctions(){
    SQLQuery("CREATE TABLE tests;");
}

setInterval(frameFunctions,framerate);
*/