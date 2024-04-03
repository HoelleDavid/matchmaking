require("dotenv").config();

const express 	= require('express');
const session 	= require('express-session');
const routes 	= require("routes");
const database = {sessionStore,connection,UserModel,UserPrivilegeModel} = require("./database");

const app = module.exports = express();


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
			if(process.env.allowServerUserRegistration && req.body.serverUser){
				UserPrivilegeModel.setServerUser(req.body.username).then(
					(x) => {}
				).catch(
					(err) => {next(err)}
				)
			}
		
			res.send("sucessful register go to <a href='/login/'> LOGIN </a>");
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
		res.redirect("/");
	}
);


app.post("/logout/",
	(req,res,next) => {
		req.logOut((err) => {
			if(err){
				next(err)
			}
		});
		res.redirect("/")
	}
);

//server users may provide/revoke match servers
app.post("/revokeserver/",
	(req,res,next) => {
		
	}
);
app.post("/provideserver/",
	(req,res,next) => {
		
	}
);

//

//========GET========
const registerForm = "<a>REGISTER:</a><br><form method='POST' action='/register'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='password' name='password'><br> SERVER USER:  <input type='checkbox' name='serverUser'> <br><input value='SUBMIT' type='submit'> </form>";
app.get("/register/", (req,res,next) => {
	res.send(registerForm);
});

const loginForm = "<a>LOGIN:</a><br><form method='POST' action='/login'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='password' name='password'><br><input value='SUBMIT' type='submit'> </form>";
app.get("/login/",
	(req,res,next) => {
		res.send(loginForm);
	}
);


const logoutForm = "<form method='POST' action='/logout'> <input value='LOGOUT' type='submit'> </form>";
app.get("/logout", (req,res,next) => {
	res.send(logoutForm)
});




app.get("/", (req,res,next) => {
	if (!req.isAuthenticated()){
		res.send("you are not logged in");
		next();
	}else{
		const user = req.session.passport.user;
		UserPrivilegeModel.isServerUser(user).then( 
			(x) => {
				if (x){
					res.send(`hello ${user} you are a server user`)
				}else{
					res.send(`hello ${user} you are a client user`)
				}

			}).catch(
			(err) => {
				next(err)
			}
		)
	}
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



