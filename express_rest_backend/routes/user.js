const express = require("express");
const user_controller = {assertUserAuth,assertHostPrivilege} = require("../controllers/user")
const router = express.Router()

const Ajv = require('ajv');
const ajv = new Ajv();
const user_auth_data_schema = require("../../schema/user_auth_data.json")



//========Route endpoints========
//MMSA0
router.post("/register/", (req,res,next) => {
	//on invalid body send the schema with 422 Unprocessable Content
	console.log(req.body)
	console.log(user_auth_data_schema)
	if(!ajv.validate(user_auth_data_schema,req.body)){
		res.code = 422
		res.send(`userdata must follow 	${user_auth_data_schema}`)
		next()
	}

	//add the user to the database
	const hashSalt = generateHashSalt(req.body.password);
	UserModel.register(req.body.username,hashSalt.hash,hashSalt.salt).then(
		(val) => {
			res.status(201)
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
		next()		
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
		res.redirect("/login/")
	}
);

//MMSA3
router.delete("/",
	(req,res,next) => {
		if (assertUserAuth(req,res)){
			UserModel.delete(req.session.passport.user);
			next();
		}
	}
);


//MMSA4
router.get("/",
	(req,res,next) => {
			res.send(req.userdata)
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