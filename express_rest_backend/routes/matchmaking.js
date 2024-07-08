const express = require("express")
const router = express.Router()
const {zip} = require("../helper_functions")

//========Controller==========
const {AuthorizationAssertions,ContentAssertions } = require("../controllers/assertions");
const queues_exports = {queue_1v1_rated} = require("../controllers/queues.js");
const { MatchModel } = require("../controllers/database.js");
const Match = require("../controllers/match.js");
const { match } = require("routes");

const queues = Object.values(queues_exports)
const queue_ids = queues.map(q => q.id)
const queues_dict = {}
for(const q of queues)
	queues_dict[q.id] = q

//stores dicts of active users in queue or hosting
//players[username] -> {queue_timeout,username,queue_timeout,state,match}
const queued_users = {}

//stores dicts of active matches
//matches[match_id] -> {players,host,state,players_session_keys}
const matches = {}

//cleans references to match in queued_users and resets user state MATCHING
remove_match = (match_id) => {
	for(const user of matches[match_id].players){
		user.state = "MATCHING"
		user.join_date = Date.now()
		user.match = null
	}
	queued_users[matches[match_id].host.username].hosted_matches = queued_users[matches[match_id].host.username].hosted_matches.filter(mid => mid != match_id)
	delete matches[match_id]
}

//if player was timed out but is still part of active match, set its state, reference match
const sync_player_from_match = (username) => {
	Object.values(matches).map(m => {
		if(!m.players)
			return
		if(username in m.players.map(p=> p.username)){
			queued_users[username].state = m.state
			queued_users[username].match = m
		} 
	})
}

//USER TIMEOUT
//if users don't check their queue state to reset timeout they leave the queue
setInterval(
	() => {
		for(const user of Object.values(queued_users)){
			if (Date.now() - user.timeout <= 0){
				for(hosted_match in user.hosted_matches){
					match.finalize("HOST TIMEOUT")
				}
				//dont delete user pointer if there exists a match referencing it
				if(user.match)
					user.state = "OFFLINE" 
				else
					delete queued_users[user.username]
			}
		}
	},
	5000
)
//timeouts can be prevented by polling
const reset_user_timeout = (timeout_ms = 10000) => (req,res,next) => {
	queued_users[req.userdata.username].timeout = Date.now()-timeout_ms
	next()
}
//matchmaking process
setInterval(
	()=>{
		for(const queue of queues){
			const waiting_players = Object.values(queued_users).filter(u => u.state == "MATCHING" && u.queue_entry && u.queue_entry.queue_id == queue.id)
			const waiting_matches = Object.values(matches).filter(m => m.state == "MATCHING" && m.queue_id == queue.id)
			const new_matches_players = queue.get_new_matches(waiting_players)
			for(const group of zip(new_matches_players,waiting_matches)){
				const [[player1,player2],match] = group
				if(match.state == "MATCHING")
					match.found_players([player1,player2])
			}	
		}
	},
	100
)

//todo
//elevates privileges od users name conatining "host"
//this should be done over the /administration/ backdoor
router.use("/",
	(req,res,next) => {
		if(req.userdata.username.includes("host"))
			req.userdata.privilege = 2
		next()
	}
)

router.use("/",	AuthorizationAssertions.assert_privilege_minimum(1))
//by proxy router.use("/queue/",	AuthorizationAssertions.assert_privilege_minimum(1))
router.use("/host/",AuthorizationAssertions.assert_privilege_minimum(2))
//saves a new user if it doesnt exist before any request
router.use("/",
	(req,res,next) => {
		if(queued_users[req.userdata.username])
			return next()
		queued_users[req.userdata.username] = {
			state:"IDLE",
			timeout:Date.now(),
			username:req.userdata.username, // set in user.js controller for app not route
			rating:req.userdata.rating,
			hosted_matches:[],
			queue_entry:null
		}
		sync_player_from_match(req.userdata.username)
		next()
	}
)
router.use("/",reset_user_timeout())

//========Route endpoints========

//JOIN_QUEUE
router.put(
	"/queue/:queue_id",
	ContentAssertions.assert_queue_id(queue_ids),
	(req,res,next) => {
		if (queued_users[req.userdata.username].state in ["PLAYING","MATCH_FOUND"]){
			const err = new Error(`cant enter queue when PLAYING, MATCHING or MATCH_FOUND, your status is ${queued_users[req.userdata.username].state}`)
			err.name = "Conflict"
			next(err)
			return
		}
		
		//IDLE state -> MATCHING state
		queued_users[req.userdata.username].state = "MATCHING"
		queued_users[req.userdata.username].rating = req.userdata.rating
		//create and return entry
		queued_users[req.userdata.username].queue_entry = {
			queue_id:req.params.queue_id,
			join_date:Date.now()
		}
		res.status(201).send(queued_users[req.userdata.username])
	}
);


//GET_QUEUE
router.get(
	"/queue/",
	(req,res,next) => {
		res.status(200).send(queued_users[req.userdata.username])
	}
);
//LEAVE_QUEUE
router.delete(
	"/queue/",
	(req,res,next) => {
		const queue_elm = queued_users[req.userdata.username]
		if (queue_elm){
			queued_users.delete(req.userdata.username)
			res.status(200).send(`DELETE\n queue participant \n${req.userdata.username}`)
		}else{
			res.status(200).send(`ALREADY DELETED\n queue participant \n${req.userdata.username}`)
		}
	}
);

//ACCEPT_MATCH
router.put(
	"/match/:match_id",
	ContentAssertions.assert_active_match_id(matches),
	reset_user_timeout(),
	(req,res,next) =>{
		matches[req.params.match_id].accept(req.userdata.username)
		res.status(202).send("accepted")
	}
)
//GET_MATCH
router.get(
	"/match/:match_id",
	ContentAssertions.assert_active_match_id(matches),
	(req,res,next) => {
		if(req.userdata.privilege >= 2){
			res.status(200).send(matches[req.params.match_id].host_view())
			return
		}
		if(req.userdata.privilege >= 1){
			res.status(200).send(matches[req.params.match_id].player_view(req.userdata.username))
			return
		}
		res.status(200).send("failed GET MATCH")
	}
)

//ADD_MATCH
router.post(
	"/match/:queue_id",
	ContentAssertions.assert_queue_id(queue_ids),
	(req,res,next) => {
		const match = new Match(req.userdata.username,req.body,req.params.queue_id)
		queued_users[req.userdata.username].hosted_matches.push(match)
		match.initialize().then(
			match_id => {
				matches[match_id] = match
				res.status(201).send({id:match_id})
			}
		).catch(
			err => next(err)
		)
	}
)

//FINALIZE_MATCH
router.delete(
	"/match/:match_id",
	ContentAssertions.assert_active_match_id(matches),
	(req,res,next) => {
		const report = req.body.report
		const match = matches[req.params.match_id]
		if(report)
			queues_dict[match.queue_id].on_report_match(report,match)
		else
			report = "NOT REPORTED"
		match.finalize(report)
		remove_match(match.id)
		res.status(201).send("finalized")
	}
)


//=======History endpoint===
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

)



module.exports = router