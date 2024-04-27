const express = require("express");
const router = express.Router()

const Ajv = require('ajv');
const ajv = new Ajv();
const user_auth_data_schema = require("../../schema/user_auth_data.json");
const { assertUserAuth } = require("../controllers/user");



//========Route endpoints========
//MMSA0 Register
router.put("/", (req,res,next) => {
	//on invalid body send the schema with 422 Unprocessable Content
	console.log(req.body)
	console.log(user_auth_data_schema)
	if(!ajv.validate(user_auth_data_schema,req.body)){
		res.code = 422
		res.send(`userdata must follow 	${user_auth_data_schema}`)
		next()
		return
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
				res.status(423)
				res.send("username already taken")
				next()
			}else{
				next(err)
			}
		}
	);

});

//MMSA1 Login
router.post("/login/",
	auth("local"),
	(req,res,next) => {
		res.send("success")
		next()		
	}
);

//MMSA2 Logout
router.post("/logout/",
	assertUserAuth,
	(req,res,next) => {
		req.logout((err) => {
			if (err) { return next(err); }
			res.send("logged out");
		});
		
	}
);

//MMSA3
router.delete("/",
	assertUserAuth,
	(req,res,next) => {
		UserModel.delete(req.session.passport.user);
		next();
	}
);


//MMSA4
router.get("/",
assertUserAuth,
	(req,res,next) => {
		res.status(200)
		res.send(req.userdata)
	}
);




//========HTMLs========
const registerForm = "<a>REGISTER:</a><br><form method='PUT' action='/user/'> USERNAME: <input type='text' name='username'> <br> PASSWORD: <input type='password' name='password'><br> <input value='SUBMIT' type='submit'> </form>";
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