const passport 	= require("passport");
const LocalStrategy = require('passport-local');
const {sessionStore,connection} = require("./database")


/*
const passport_options = {
	usernameField:"user",
	passwordField:"password"
};

passport.use(new LocalStrategy(
    (uname , pw, cb) => {
        User
    }
))


/*
///PASSPORT 
const passportVerifyCallback = (username,password,done) => {
	User.findOne({username:username}).then(
		(user) => {
			if (!user) {
				return done(null,false);
			}
			if (isValid(password,user.hash,user.salt)){
				return done(null,user);
			}else{
				return done(null,false);
			}
		}
	).catch(
		(err) => {
			done(err);
		}
	)
}
const strategy = new LocalStrategy(passport_options, passportVerifyCallback);
passport.use(strategy)
passport.serializeUser(
	(user,done) => {
		done(null,user);
	}
);
passport.deserializeUser(
	User.findById(userId).then(
		(user) => {
			done(null,user);
		}
	).catch(
		(err) => done(err)
	)
);

app.use(passport.initialize());
app.use(passport.session());


*/
