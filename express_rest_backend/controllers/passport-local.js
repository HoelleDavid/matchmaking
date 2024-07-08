const app = require("../app")
require("dotenv").config();
const passport 	= require("passport");
const LocalStrategy = require('passport-local');
const crypt = {generateHashSalt,isValidHash} = require("./crypt")
const {UserModel} = require("./database")

//define json fields required in login body
const passport_options = {
	usernameField:"username",
	passwordField:"password"
};

//how to verify credentials, defines passport.authenticate
//https://www.passportjs.org/concepts/authentication/strategies/
const verifyCallback = (username,password,cb) => {
	UserModel.findByUsername(username).then(
		(user) => {
			if (!user) //User doesnt exist
				return cb(null,false)
			if (isValidHash(password,user.hash,user.salt)) //valid user password
				return cb(null,user) 	
			else //invalid user credentials
				return cb(null,false) 
		}
	).catch(
		err => 	cb(err)
	)
}

// to module export the passport.authenticate
const auth = (strategy,redirects) => passport.authenticate(strategy,redirects)

passport.use(new LocalStrategy(passport_options,verifyCallback))

passport.serializeUser(
	(user,cb) => {
		cb(null,user.username);
	}
);
passport.deserializeUser( (username,cb) => {
	UserModel.findByUsername(username).then(
		(user) => {
			cb(null,user);
		}
	).catch(
		(err) => cb(err)
	)
});


app.use(passport.initialize());

//make express use passport functions (above)
app.use(passport.session());


module.exports = {generateHashSalt,auth}