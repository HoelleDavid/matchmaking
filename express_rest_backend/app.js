require("dotenv").config();

const express 	= require('express');
const session 	= require('express-session');
const routes 	= require("routes");

const app = module.exports = express();

const database = {sessionStore,connection,UserModel} = require("./database");

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(session({
	key: 'session_cookie_name',
	secret: process.env.expressSessionSecret,
	store: database.sessionStore,
	resave: false,
	saveUninitialized: false
}));

const passport = {generateHashSalt,auth} = require("./passport")


///========ROUTES========


//========POST========
app.post("/register/", (req,res,next) => {
	const hashSalt = generateHashSalt(req.body.password);
	UserModel.register(req.body.username,hashSalt.hash,hashSalt.salt).then(
		(val) => {
			res.send("sucessful register go to <a href='/login/' LOGIN>");
		}
	).catch(
		(err) => {
			if(err.code === "ER_DUP_ENTRY"){
				res.send("username already taken") // TODO jsonify to msg protocol
			}else{
				next(err)
			}
		}
	);
});

app.post("/login/",
	auth("local"),
	(req,res,next) => {
		console.log(req);
	}
);






//========GET========
const registerForm = "<a>REGISTER:</a><br><form method='POST' action='/register'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='text' name='password'> <br><input type='submit'> </form>";
app.get("/register/", (req,res,next) => {
	res.send(registerForm);
});

const loginForm = "<a>LOGIN:</a><br><form method='POST' action='/login'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='text' name='password'><br><input type='submit'> </form>";
app.get("/login/",
	(req,res,next) => {
		res.send(loginForm);
	}
);

app.get("/logout/", (req,res,next) => {
	res.send("TBD")
});

app.get("/matchmake/", (req,res,next) => {
	var matchUserConfig = req.headers.matchUserConfig

	res.send("TBD")
});



app.get("/", (req,res,next) => {
	var x = database.models.findUserByUname("someuser")
	console.log(x)
	res.send(x)
	
});

app.get("/testing/", (req,res,next) => {
	if(!req.session.viewCount){
		req.session.viewCount = 0;
	}
	req.session.viewCount += 1;
	console.log(req.headers);
	
	res.send({svc:req.session.viewCount});
});

app.get("/usertable/", (req,res,next) => {
	//connection.promise().query("CREATE TABLE User(username varchar(255) NOT NULL UNIQUE, hash varchar(255) NOT NULL,salt varchar(255) NOT NULL);").then( (x) => {res.send(x)}).catch( (err) => {next(err)})
	connection.promise().query(`SELECT * FROM User;`).then( (x) => {res.send(x)}).catch( (err) => {next(err)})
});


///========ERR HANDLING AND PORT BINDING========
function errHandler(err,req,res,next) { // TODO
	if (err){
		const x = `backend error in err handler \n ${err}`
		res.send(x)
		console.log(x);
	}
};
app.use(errHandler);

app.listen(3000);



