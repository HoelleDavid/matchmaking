const express = require("express");
const { UserPrivilegeModel } = require("../database");
const router = express.Router()

const assertUserAuth = (req,res) => {
	if (!req.isAuthenticated()){
		res.status(401);
		res.send("you are not logged in");
		res.redirect("/user/login")
		return false;
	}
	return true;
}

//========Route endpoints========
//MMSA0
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

//MMSA1
router.post("/login/",
	auth("local"),
	(req,res,next) => {
		res.redirect("/");
	}
);

//MMSA2
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

//MMSA3
router.delete("/",
	(req,res,next) => {
		if (!req.isAuthenticated()){
			res.status(401);
			res.send("you are not logged in");
			res.redirect("/user/login")
		}else{
			UserModel.delete(req.session.passport.user);
			next();
		}
	}
);

//MMSA4
router.get("/",
	(req,res,next) => {
		if (assertUserAuth(req,res)){
			var userdata = {
				username:req.session.passport.user,
				isServerUser:false,
			}
			const username = req.session.passport.user
			udatapromises = [
				UserPrivilegeModel.isServerUser(userdata.username).then(
					(isServerUser) => {userdata.isServerUser = isServerUser}
				)
			]

			Promise.all(udatapromises).then(
				() => {res.send(userdata)}
			).catch(console.log)
		}
	}
);

//========HTMLs========
const registerForm = "<a>REGISTER:</a><br><form method='POST' action='/user/register'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='password' name='password'><br> <input value='SUBMIT' type='submit'> </form>";
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




module.exports = router