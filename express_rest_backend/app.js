require("dotenv").config();

const express 	= require('express');
const session 	= require('express-session');
const routes 	= require("routes");

const app = module.exports = express();

const database = require("./database")
const passport = require("./passport")

function middleware_pattern(req,res,next) {
	//CODE
	let possibleErrors = new Error("not actually an err");
	next(possibleErrors);
};

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(session({
	key: 'session_cookie_name',
	secret: process.env.expressSessionSecret,
	store: database.sessionStore,
	resave: false,
	saveUninitialized: false
}));


///========ROUTES========


///========POST========
/*
app.post("/login/",passport.authenticate("local"),(req,res,next) => {
	//ON VALID AUTH
});

app.post("/register/",passport.reg(req,res,next) => {

});
*/


///========GET========
app.get("/register/", (req,res,next) => {
	res.send("this will be register page !!");
});

app.get("/login/", (req,res,next) => {
	res.send("this will be login page !!");
});


app.get("/", (req,res,next) => {
	var x = database.sessionStore.query("show collections;")
	x.then(
		(a) => 
			res.send(a)
	).catch(
		(err) => next(err)
	);
});
app.get("/testing/", (req,res,next) => {
	if(!req.session.viewCount){
		req.session.viewCount = 0;
	}
	req.session.viewCount += 1;
	console.log(req.headers);
	
	res.send({svc:req.session.viewCount});
});

///========ERR HANDLING AND PORT BINDING========
function errHandler(err,req,res,next) {
	if (err){
		res.send(`backend error ${err}`)
		console.log(err);
	}
};
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