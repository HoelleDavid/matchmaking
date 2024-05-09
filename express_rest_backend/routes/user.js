const express = require("express");
const router = express.Router()
const app = require("../app")

//==============Controller===========================================
const {AuthorizationAssertions,ContentAssertions} = require("../controllers/assertions");
const { UserModel } = require("../controllers/database");
// set session-user metadata on req.userdata

app.use(
	"/",
	(req,res,next) => {
		req.userdata = {
			username : "",
			privilege: 0
		}
		
		if (req.isAuthenticated()){
			req.userdata.username =  req.session.passport.user

			UserModel.getPrivilege(req.userdata.username).then(
				(privilege) => {
					req.userdata.privilege = privilege
					next()
				}
			)
		}else{
			next()
		}
	}
)


//========Route endpoints========
//MMSA0 Register
router.put(
	"/",
	ContentAssertions.assert_user_auth_data_schema,
	(req,res,next) => {
		//add the user to the database
		const hashSalt = generateHashSalt(req.body.password);
		UserModel.register(req.body.username,hashSalt.hash,hashSalt.salt).then(
			(_) => {
				res.status(201).send("sucessful register go to <a href='/user/login/'> LOGIN </a>");
			}
		).catch(
			(err) => {
				if(err.code === "ER_DUP_ENTRY"){
					const err = new Error(`username already taken`)
        			err.name = "Locked"
				}
				next(err)
			}
		);
	}
);

//MMSA1 Login
router.post(
	"/login/",
	ContentAssertions.assert_user_auth_data_schema,
	auth("local"),
	(req,res,next) => {
		res.send("success")
		next()		
	}
);

//MMSA2 Logout
router.post(
	"/logout/",
	AuthorizationAssertions.assert_user_auth,
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
	AuthorizationAssertions.assert_user_auth,
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