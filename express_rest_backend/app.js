require("dotenv").config();

const express 	= require('express');
const session 	= require('express-session');
const routes 	= require("routes");

///========INIT DATABASE========
const database = {sessionStore,connection,UserModel,UserPrivilegeModel} = require("./database");
///========INIT EXPRESS========
const app = module.exports = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(session({
	key: 'mm_session_cookie',
	secret: process.env.expressSessionSecret,
	store: database.sessionStore,
	resave: false,
	saveUninitialized: false
}));

///========INIT PASSPORT========
const passport = {generateHashSalt,auth} = require("./passport")


///========ROUTES========
const user_router = require("./routes/user")
app.use("/user/",user_router)
const mm_router = require("./routes/matchmaking")
app.use("/matchmaking/",mm_router)


///========ERR HANDLING AND PORT BINDING========
function errHandler(err,req,res,next) { // TODO
	if (err){
		const x = `backend error in err handler \n ${err}`
		console.warn(x);
	}
};
app.use(errHandler);

app.listen(3000);