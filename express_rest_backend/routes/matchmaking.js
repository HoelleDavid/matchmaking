const express = require("express")
const timeout 	= require("connect-timeout")
const router = express.Router()



//========Controller==========
const { AuthorizationAssertions,ContentAssertions } = require("../controllers/assertions");

//players are a dict<username,queuedata>
//hosts are a dict<username,list<hostdata>>
const queue = { players: {}, hosts:{} , matches_found: []}


const data = {}
//========Route endpoints========

//TMP
router.get("/view/",
	//AuthorizationAssertions.assert_admin_privilege, TODO
	(req,res,next)=>{
		console.log(queue)
		res.send(queue)
	}
)



//MMSB3 join queue
router.put(
	"/queue/",
	AuthorizationAssertions.assert_user_auth,
	ContentAssertions.assert_queue_data_schema, // conforms to queue_data.json
	(req,res,next) => {
		const queue_elm = queue.players[req.userdata.username]
		const put_queue_elm =  req.body.json
		if (queue_elm){
			if(queue_elm == put_queue_elm){
				res.status(201).send(`DUPLICATE PUT\n on join queue\n${put_queue_elm}`)
			}else{
				queue.players[req.userdata.username] = put_queue_elm
				res.status(201).send(`UPDATE PUT\n on join queue\n${put_queue_elm}`)
			}
		}else{
			const created_queue_elm = queue.players[req.userdata.username] = req.body.json
			res.status(201).send(`JOINED QUEUE\n${created_queue_elm}`)
		}
	}
);

//MMSB0 
router.post(
	"/queue/",
	AuthorizationAssertions.assert_user_auth,
	(req,res,next) => {
		onAcceptQueue().then().catch()
		res.status(202)
	}
);
//MMSB2
router.delete(
	"/queue/",
	AuthorizationAssertions.assert_user_auth,
	(req,res,next) => {
		const queue_elm = queue.players[req.userdata.username]
		if (queue_elm){
			queue.players.delete(req.userdata.username)
			res.status(200).send(`DELETE\n queue participant \n${req.userdata.username}`)
		}else{
			res.status(200).send(`ALREADY DELETED\n queue participant \n${req.userdata.username}`)
		}
	}
);

//MMSB1
router.get(
	"/queue/",
	AuthorizationAssertions.assert_user_auth,
	(req,res,next) => {
		onPollQueue().then().catch()
		res.status(202)
		res.status(201)
	}
);


//MMSB4
router.post(
	"/host/",
	AuthorizationAssertions.assert_host_privilege,
	(req,res,next) => {
		
	}
);

//MMSB5
router.get(
	"/host/",
	AuthorizationAssertions.assert_host_privilege,
	(req,res,next) => {
	
	}
);
	//MMSB6
router.delete(
	"/host/",
	AuthorizationAssertions.assert_host_privilege,
	(req,res,next) => {
		
	}
);

	//MMSB7
router.put(
	"/host/",
	AuthorizationAssertions.assert_host_privilege,
	(req,res,next) => {
		
	}
);

module.exports = router