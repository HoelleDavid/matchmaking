const express = require("express")
const timeout 	= require("connect-timeout")
const router = express.Router()

//to check requests before making controller calls
const Ajv = require('ajv');
const ajv = new Ajv();

const user_controller = { assertUserAuth, assertHostPrivilege } = require("../controllers/user");
const mm_controller = {onProvideHost,onRevokeHost,onPollHost,onJoinQueue,onExitQueue,onPollQueue} = require("../controllers/matchmaking")

//========Route endpoints========
//MMSB0 
router.post("/queue/",
	assertUserAuth,
	(req,res,next) => {
		
	}
);
//MMSB1
router.get("/queue/",
	assertUserAuth,
	(req,res,next) => {

	}
);
//MMSB2
router.delete("/queue/",
	assertUserAuth,
	(req,res,next) => {
		
	}
);

//MMSB3
router.put("/queue/",
	assertUserAuth,
	(req,res,next) => {
		
	}
);

//MMSB4
router.post("/host/",
	assertHostPrivilege,
	(req,res,next) => {
		
	}
);
//MMSB5
router.get("/host/",
	assertHostPrivilege,
	(req,res,next) => {
	
	}
);
//MMSB6
router.delete("/host/",
	assertHostPrivilege,
	(req,res,next) => {
		
	}
);

//MMSB7
router.put("/host/",
	assertHostPrivilege,
	(req,res,next) => {
		
	}
);

module.exports = router