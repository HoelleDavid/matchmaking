const express = require("express");
const router = express.Router()
const app = require("../app")

//==============Controller===========================================
const {AuthorizationAssertions,ContentAssertions} = require("../controllers/assertions");
const { UserModel } = require("../controllers/database");
const { auth } = require("../controllers/passport-local");
// set session-user metadata on req.userdata


app.use(
	"/",
	(req,res,next) => {
		if (!req.isAuthenticated()){
			req.userdata = {
				username : "",
				privilege: 0
			}
			next()
		}else{
			req.userdata.username =  req.session.passport.user

			UserModel.findByUsername(req.userdata.username).then(
				(userdata) => {
					console.log(userdata)
					req.userdata = userdata
					next()
				}
			).catch(
				err => console.error(`fatal database error in\n UserModel.findByUsername\n ${err}`)
			)
		}
	}
)


//========Route endpoints========
//MMSA0 Register
router.put(
	"/",
	ContentAssertions.assert_user_auth_data,
	(req,res,next) => {
		const hashSalt = generateHashSalt(req.body.password);
		//add the user to the database
		UserModel.register(req.body.username,hashSalt.hash,hashSalt.salt).then(
			(sql_res) => {
				console.log(sql_res)
				res.status(201).send("sucessful register post to <a href='/user/login/'> LOGIN </a>");
			}
		).catch(
			(err1) => {
				if(err1.code === "ER_DUP_ENTRY"){
					const err = new Error(`username already taken`)
        			err.name = "Locked"
					next(err)
				}else{
					next(err1)
				}
			}
		)
	}
);

//MMSA1 Login
router.post(
	"/login/",
	(req,res,next) => {
		console.log(req.body)
		next()
	},
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
		next();
	}
);


//MMSA4
router.get(
	"/",
	(req,res,next) => {
		res.status(200)
		res.send(req.userdata)
	}
);


module.exports = router