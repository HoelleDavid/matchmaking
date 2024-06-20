require("dotenv").config();

const express 	= require('express');
const session 	= require('express-session');
const routes 	= require("routes");
//const cors = require("cors");


const args = process.argv.slice(1)



///========INIT DATABASE========
const database = {session_store,UserModel,UserPrivilegeModel} = require("./controllers/database");
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
//app.use(cors());
////========INIT ASSERTIONS======
//const assetions = require("./controllers/assertions")
//========INIT PASSPORT========
const passport = {generateHashSalt,auth} = require("./controllers/passport-local")

///========ROUTES========
const user_router = require("./routes/user")
app.use("/user/",user_router)
const admin_router = require("./routes/administration")
app.use("/administration/",admin_router)
const mm_router = require("./routes/matchmaking");
app.use("/matchmaking/",mm_router)

///========ERR HANDLING AND PORT BINDING========
function errHandler(err,req,res,next) { 
	if (err){
		console.log(err)
		switch(err.name){
			case "Unauthorized":
				res.status(401).send(`Unauthorized:\n ${err.message}`)
				break
			case "Forbidden":
				res.status(403).send(`Forbidden:\n ${err.message}`)
				break
			case "NotFound":
				res.status(404).send(`NotFound:\n ${err.message}`)
				break
			case "Conflict":
				res.status(409).send(`Conflict:\n ${err.message}`)
			case "UnprocessableContent":
				res.status(422).send(`UnprocessableContent:\n ${err.message}`)
				break
			case "Locked":
				res.status(423).send(`Locked:\n ${err.message}`)
				break

			//this error is fatal for the end user and should not happen
			//hopefully the closest thing to the api crashing post init
			default:
				res.status(500).send(`unhandled backend error:\n ${err.message}`)
				console.warn(`unhandled error:\n ${err}`)
		}
	}
};


app.use(errHandler);

app.listen(3000);