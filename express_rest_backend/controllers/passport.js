const app = require("../app")
require("dotenv").config();
const passport 	= require("passport");
const LocalStrategy = require('passport-local');
const {UserModel,UserPrivilegeModel} = require("./database")
const crypto = require("crypto")

const passport_options = {
	usernameField:"username",
	passwordField:"password"
};


const verifyCallback = (username,password,done) => {
	UserModel.findByUsername(username).then(
		(users) => {return users[0]}
	).then(
		(user) => {
			console.log(user)
			if (!user) {
				//User doesnt exist
				return done(null,false);
			}
			if (isValidHash(password,user.hash,user.salt)){
				//valid user credentials
				return done(null,user);
			}else{
				//invalid user credentials
				return done(null,false);
			}
		}
	).catch(
		(err) => {
			//forward all errors trough passport to express
			done(err);
		}
	)
}


const generateHashSalt = (password) =>	{
	var salt = crypto.randomBytes(32).toString("hex");
	var hash = crypto.pbkdf2Sync(password,salt,
		Number(process.env.cryptIterationCount),Number(process.env.cryptKeyLength),process.env.cryptDigest
	).toString("hex");
	return {salt:salt,hash:hash}
}
const isValidHash = (password,hash,salt) => {
	var verifyHash = crypto.pbkdf2Sync(password,salt,
		Number(process.env.cryptIterationCount),Number(process.env.cryptKeyLength),process.env.cryptDigest
	).toString("hex");
	return hash === verifyHash;
}
const auth = (strategy,redirects) => {
	return passport.authenticate(strategy,redirects)
};


//TODO allow other strats
passport.use(new LocalStrategy(passport_options,verifyCallback))

passport.serializeUser(
	(user,done) => {
		done(null,user.username);
	}
);
passport.deserializeUser( (username,done) => {
	UserModel.findByUsername(username).then(
		(user) => {
			done(null,user);
		}
	).catch(
		(err) => done(err)
	)
});


app.use(passport.initialize());

//make express use passport functions (above)
app.use(passport.session());


module.exports = {generateHashSalt,auth}