const Ajv = require('ajv');
const ajv = new Ajv();

const user_auth_data_schema = require("../../schema/user_auth_data.json");
//const host_data_schema      = require("../../schema/host_data.json");
const e = require('connect-timeout');


var ContentAssertions = {}

//Register and login data
ContentAssertions.assert_user_auth_data = (req,res,next) => {
    if(!ajv.validate(user_auth_data_schema,req.body)){
        const err = new Error(`user login and register data must follow\n${JSON.stringify(user_auth_data_schema)}`)
        err.name = "UnprocessableContent"
        next(err)
        return
    }
    /*
    const _username_regex = ".*"
    const _password_regex = ".*"
    if(!req.body.username.matches(_username_regex) || !req.body.password.matches(_password_regex)){
        const err = new Error(`username,password must each regex match ${_username_regex}`)
        err.name = "UnprocessableContent"
        return next(err)
    }
    */
    next()
}

// assertions for queue in queues, errors trigger corresponding http err codes
ContentAssertions.assert_queue_id = (queues) => (req,res,next) => {
    const join_req_queue_id = req.params.queue_id
    const queue_ids = queues.map(q => q.id)
    if(!join_req_queue_id in queue_ids){
        err = new Error(`queue id ${join_req_queue_id} not found , try one of ${queue_ids}`)
        err.name = "Not Found"
        next(err)
        return;
    }
    next()
}
// assertions for matchid in active ["MATCHING","MATCH_FOUND","PLAYING"] mathce
ContentAssertions.assert_active_match_id = (matches) => (req,res,next) => {
    const req_match_id = req.params.match_id
    if(!matches[req_match_id]){
        const err = new Error(`match id ${req_match_id} not found`)
        err.name = "Not Found"
        next(err)
        return
    }
    next()
}



//Middleware functions to assert the privilege of requests
var AuthorizationAssertions = {}
AuthorizationAssertions.assert_privilege_minimum = (priv_min_int) => (req,res,next) => {
    if(req.userdata.privilege >= priv_min_int)
        return next()

    const err = new Error()
    switch(req.userdata.privilege){
        case 0:
            if(req.isAuthenticated())
                err.message = "you are banned"
            else
                err.message = "you are not logged in , try logging in via POST to /user/login or register via PUT to /user/"
            break;
        default:
            err.message = `you are not privileged enough, required:${priv_min_int}, actual:${req.userdata.privilege}`
    }
    err.name = "Unauthorized"
    return next(err)
	
}


module.exports = {AuthorizationAssertions,ContentAssertions}