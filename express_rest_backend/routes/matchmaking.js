const express = require("express")
const timeout 	= require("connect-timeout")
const router = express.Router()

//to check requests before making controller calls
const Ajv = require('ajv');
const ajv = new Ajv();
const queue_data_schema = require("../../schema/queue_data.json");
const host_data_schema = require("../../schema/host_data.json");

const user_controller = { assertUserAuth, assertHostPrivilege } = require("../controllers/user");
const mm_controller = {onProvideHost,onRevokeHost,onPollHost,/*onACceptHost,*/onJoinQueue,onExitQueue,onPollQueue,onAcceptQueue,data} = require("../controllers/matchmaking")

//========Route endpoints========
//MMSB3 join queue
router.put("/queue/",
	assertUserAuth,
	(req,res,next) => {
		if(!ajv.validate(queue_data_schema,req.body)){
			res.code = 422
			res.send(`userdata must follow 	${queue_data_schema}`)
			next()
			return
		}
		onJoinQueue(req.body).then(
			x => console.log(x)
		).catch(
			x => console.log(x)
		)
		res.status(201)
	}
);
router.get("/queue/view/",
	res.send(data)
)
//MMSB0 
router.post("/queue/",
	assertUserAuth,
	(req,res,next) => {
		onAcceptQueue().then().catch()
		res.status(202)
	}
);
//MMSB2
router.delete("/queue/",
	assertUserAuth,
	(req,res,next) => {
		onExitQueue().then().catch()
		res.status(200)
	}
);

//MMSB1
router.get("/queue/",
	assertUserAuth,
	(req,res,next) => {
		onPollQueue().then().catch()
		res.status(202)
		res.status(201)
	}
);



//MMSB4
router.post("/host/",
	assertHostPrivilege,
	(req,res,next) => {
		if(!ajv.validate("",req.body)){
			res.code = 422
			res.send(`userdata must follow 	${""}`)
			next()
			return
		}
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