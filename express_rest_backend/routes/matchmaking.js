const express = require("express")
const router = express.Router()


//========Controller==========
const {AuthorizationAssertions,ContentAssertions } = require("../controllers/assertions");
const {queue_1v1_rated} = require("../controllers/queues.js");
const { MatchModel } = require("../controllers/database.js");
const Match = require("../controllers/match.js");

const queues = [queue_1v1_rated]
const queue_ids = queues.map(q => q.id)

//players[username] -> {queue_timeout,username,queue_timeout,state,match}
const users = {}
const matches = {}
//cleans references to match in users and resets user state
remove_match = (match_id) => {
	for(const user of matches[match_id]){
		user.state = "MATCHING"
		user.match = null
	}
	users[req.userdata.username].hosted_matches.remove(match_id)
	delete matches[match_id]
}

//if player was timed out but is still part of active match, set its state, reference match
const sync_player_from_match = (username) => {
	Object.values(matches).map(m => {
		if(username in m.players.map(p=> p.username)){
			users[username].state = m.state
			users[username].match = m
		} 
	})
}

//if users don't check their queue state to reset queue_timeout they leave the queue
const _timeout_users = (timeout_ms = 10000) =>{
	for(const user of Object.values(users)){
		if (Date.now() - user.queue_timeout > timeout_ms)
			for(hosted_match in user.hosted_matches){
				//TODO if host force end matches
			}
			delete users[user.username]
	}
}
setInterval(_timeout_users,5000)
const reset_user_timeout = (req,res,next) => {
	users[req.userdata.username].timeout = Date.now()
	next()
}

router.use("/",	AuthorizationAssertions.assert_privilege_minimum(1))
//by proxy router.use("/queue/",	AuthorizationAssertions.assert_privilege_minimum(1))
router.use("/host/",AuthorizationAssertions.assert_privilege_minimum(2))

//saves a new user if it doesnt exist before any request
router.use("/",
	(req,res,next) => {
		if(!users[req.userdata.username])
			users[req.userdata.username] = {
				state:"IDLE",
				timeout:Date.now(),
				username:req.userdata.username, // set in user.js controller for app not route
				hosted_matches:[],
				queue_entry:null
			}
		sync_player_from_match(req.userdata.username)
		next()
	}
)


//========Route endpoints========

//JOIN_QUEUE
router.put(
	"/queue/:queue_id",
	ContentAssertions.assert_queue_id(queue_ids),
	(req,res,next) => {
		const join_req_queue_id = req.params.queue_entry.queue_id
		//response based on state
		switch (req.userdata.player_state){
			//errors on status in conflict with JOIN QUEUE action
			case "MATCH_FOUND":
			case "MATCHING":
			case "PLAYING" :
				err = new Error(`cant enter queue when PLAYING, MATCHING or MATCH_FOUND, your status is ${req.userdata.player_state}`)
				err.name = "Conflict"
				return next(err)
			case "IDLE":
				break //only passable state
			default:
				console.error(`unknown user state ${req.userdata.player_state} `)
				return
		}
		
		//IDLE state -> MATCHING state
		users[req.userdata.username].state = "MATCHING"
		//create and return entry
		const entry = {
			queue_id:join_req_queue_id,
			join_date:Date.now()
		}
		users[req.userdata.username].queue_entry = entry
		res.status(201).send(`queue entry created ${entry}\n start polling at GET /matchmaking/queue/ to keep your entry active`)
	}
);


//MMSB1 inspect queue entry
router.get(
	"/queue/",
	reset_user_timeout,
	(req,res,next) => {
		res.status(200).send(req.userdata.queue_entry)
	}
);
//MMSB1 inspect match
router.get(
	"/queue/:queue_id/:match_id",
	ContentAssertions.assert_queue_id(queue_ids),
	reset_user_timeout,
	(req,res,next) => {
		if(req.params.match_id != req.userdata.active_match.id){
			err = new Error(`cant read match ${req.params.match_id}`)
			err.name = "Forbidden"
			return next(err)
		}	
		res.status(200).send(req.userdata.active_match)
	}
);

//MMSB0 accept queue
router.post(
	"/queue/",
	(req,res,next) => {
		if(req.userdata.player_state !== "MATCH_FOUND"){
			err = new Error(`cant accept queue when PLAYING, MATCHING or IDLE, your status is ${req.userdata.player_state}`)
			err.name = "Conflict"
			return next(err)
		}
		req.userdata.active_match.
		res.status(202).send("accepted")
	}
);
//MMSB2 leave queue / don't accept
router.delete(
	"/queue/",
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





//MMSB4 host match
router.post(
	"/host/:queue_id",
	ContentAssertions.assert_queue_id(queue_ids),
	(req,res,next) => {
		const queue_id = req.params.queue_id
		match = new Match(req.userdata.username,req.body)
		users[req.userdata.username].hosted_matches.push(match)
		match.initialize().then(
			match_id => {
				matches[match_id] = match
				res.status(201).send(match_id)
			}
		)
	}
)

//MMSB5 check match
router.get(
	"/host/:match_id",
	ContentAssertions.assert_active_match_id(matches),
	reset_user_timeout,
	(req,res,next) => {
		res.status(200).send(matches[req.params.match_id])
	}
)
//check all matches
router.get(
	"/host/",
	reset_user_timeout,
	(req,res,next) => {
		res.status(200).send(users[req.userdata.username].hosted_matches)
	}
);

//MMSB6 remove a match
router.delete(
	"/host/:match_id",
	ContentAssertions.assert_active_match_id(matches),
	(req,res,next) => {
		matches[req.params.match_id].finalize("ABORTED")
		remove_match(req.params.match_id)
	}
);

//MMSB6 remove all matches
router.delete(
	"/host/",
	(req,res,next) => {
		for(const match of users.hosted_matches){
			match.finalize("ABORTED")
			remove_match(match.id)
		}
	}
);

//MMSB7 report back match
router.put(
	"/host/",
	(req,res,next) => {
		
	}
);

router.get(
	"/view/:match_id",
	(req,res,next) => {
		MatchModel.getById(req.params.match_id).then(
			sqlRes => res.status(200).send(sqlRes)
		).catch(
			err => {
				err.name = "NotFound"
				return next(err)
			}
		)
	}

);

//setTimeout(	()=>{const x = new Match().deserialize_from_history(1)}, 10)

module.exports = router