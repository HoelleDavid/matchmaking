const express = require("express")
const router = express.Router()

const {UserPrivilegeModel} = require("../database");

const assertUserAuth = (req,res) => {
	if (!req.isAuthenticated()){
		res.status(401);
		res.send("you are not logged in");
		res.redirect("/user/login")
		return false;
	}
	return true;
}

const assertUserServerPrivileged = (req,res) => {
	if(assertUserAuth(req,res)){
		const t = UserPrivilegeModel.isServerUser(req.session.passport.user).then(
			(isServerUser) => {return isServerUser}
		).catch(
			(err) =>{
				res.status(401);
				res.send("you are no server user");
				return false
			}
		)

	}
}


//========TMP========
router.get("/enqueue/",
	(req,res,next) => {
		if(assertUserAuth(req,res)){
			UserPrivilegeModel.revokeServerUser(req.session.passport.user).then().catch();
			res.send("revoke server user")
		}
	}
);

router.get("/provide/",
	(req,res,next) =>{
		if(assertUserAuth(req,res)){
			UserPrivilegeModel.setServerUser(req.session.passport.user).then().catch();
			res.send("set server user")
		}
	}
);

//========Route endpoints========
//MMSB0
router.post("/enqueue/",
	(req,res,next) => {
		
	}
);
//MMSB1
router.get("/enqueue/",
	(req,res,next) => {
		
	}
);
//MMSB2
router.delete("/enqueue/",
	(req,res,next) => {
		
	}
);

//MMSB4
router.post("/provide/",
	(req,res,next) => {
		
	}
);
//MMSB5
router.get("/provide/",
	(req,res,next) => {
	
	}
);
//MMSB6
router.delete("/provide/",
	(req,res,next) => {
		
	}
);

//MMSB7
router.post("/report/",
	(req,res,next) => {
		
	}
);

module.exports = router