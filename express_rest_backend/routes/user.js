const express = require("express")
const router = express.Router()

//========POST========
router.post("/register/", (req,res,next) => {
	const hashSalt = generateHashSalt(req.body.password);
	UserModel.register(req.body.username,hashSalt.hash,hashSalt.salt).then(
		(val) => {
			res.send("sucessful register go to <a href='/user/login/'> LOGIN </a>");
		}
	).catch(
		(err) => {
			if(err.code === "ER_DUP_ENTRY"){
				res.send("username already taken")
			}else{
				next(err)
			}
		}
	);

});

router.post("/login/",
	auth("local"),
	(req,res,next) => {
		res.redirect("/");
	}
);


router.post("/logout/",
	(req,res,next) => {
		req.logOut((err) => {
			if(err){
				next(err)
			}
		});
		res.redirect("/")
	}
);

router.delete("/",
	(req,res,next) => {
		if (!req.isAuthenticated()){
			res.status(401);
			res.send("you are not logged in");
			res.redirect("/")
		}else{
			UserModel.delete(req.session.passport.user);
			next();
		}
	}
);

router.get("/",
	(req,res,next) => {
		if (!req.isAuthenticated()){
			res.status(401);
			res.send("you are not logged in");
			res.redirect("/")
		}else{
			console.log(req.session.passport.user)
		}
	}
);

//========GET========
const registerForm = "<a>REGISTER:</a><br><form method='POST' action='/user/register'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='password' name='password'><br> SERVER USER:  <input type='checkbox' name='serverUser'> <br><input value='SUBMIT' type='submit'> </form>";
router.get("/register/", (req,res,next) => {
	res.send(registerForm);
});

const loginForm = "<a>LOGIN:</a><br><form method='POST' action='/user/login'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='password' name='password'><br><input value='SUBMIT' type='submit'> </form>";
router.get("/login/",
	(req,res,next) => {
		res.send(loginForm);
	}
);


const logoutForm = "<form method='POST' action='/user/logout'> <input value='LOGOUT' type='submit'> </form>";
router.get("/logout", (req,res,next) => {
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

module.exports = router