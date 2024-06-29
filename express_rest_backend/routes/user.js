var fs = require("fs");
const express = require("express");
const router = express.Router()
const app = require("../app")

const {AuthorizationAssertions,ContentAssertions} = require("../controllers/assertions");
const { UserModel } = require("../controllers/database");
const { auth,generateHashSalt } = require("../controllers/passport-local");

//==============Controller===========================================


// set session-user metadata on req.userdata
app.use(
	"/",
	(req,res,next) => {
		if (!req.isAuthenticated()){
			req.userdata = {
				username : "",
				privilege: 0
			}
			return next()
		}
		UserModel.findByUsername(req.session.passport.user).then(
			userdata =>{console.log(userdata);req.userdata = userdata;next()}
		).catch(
			err => next(err) //unexpected
		)
		
	}
)


//========Route endpoints========
//MMSA0 Register
router.put(
	"/",
	ContentAssertions.assert_user_auth_data,
	(req,res,next) => {
		const hash_salt = generateHashSalt(req.body.password)
		//add the user to the database
		UserModel.register(req.body.username,hash_salt.hash,hash_salt.salt).then(
			(sql_res) => res.status(201).send("sucessful register POST to /user/login/ to log in")
		).catch(
			(err) => {
				if(err.code === "ER_DUP_ENTRY")
					return next(new Error(`username already taken`).name = "Locked") //expected
				return next(err) //unexpected
			}
		)
	}
);

//MMSA1 Login
router.post(
	"/login/",
	ContentAssertions.assert_user_auth_data,
	auth("local"),
	(req,res,next) => {
		console.log(req.body)
		res.status(200).send("success")	
	}
);

//MMSA2 Logout
router.post(
	"/logout/",
	AuthorizationAssertions.assert_privilege_minimum(1),
	(req,res,next) => {
		req.logout((err) => {
			if (err) { return next(err); }
			res.send("logged out");
		});
		
	}
);

//MMSA3
router.delete(
	"/",
	AuthorizationAssertions.assert_privilege_minimum(1),
	(req,res,next) => {
		UserModel.delete(req.userdata.username);
		res.status(200).send(`deleted ${req.userdata.username}`)
	}
);


//MMSA4
router.get(
	"/",
	(req,res,next) => {
		res.status(200).send(req.userdata)
	}
);





//Registration HTML
var register_page = null
var register_filename = require.resolve("../html/register.txt");
fs.readFile(register_filename, 'utf8',
	(err,res) => register_page = res
)
app.get(
	"/register/",
	(req,res,next)=>{
		if(register_page)
			res.status(200).send(register_page)
		else 
			next(new Error().name = "NotFound")
	}
)

//login HTML
var login_page = null
var login_filename = require.resolve("../html/login.txt")
fs.readFile(login_filename, 'utf8',
	(err,res) => login_page = res
)
app.get(
	"/login/",
	(req,res,next)=>{
		if(login_page)
			res.status(200).send(login_page)
		else 
			next(new Error().name = "NotFound")
	}
)
module.exports = router