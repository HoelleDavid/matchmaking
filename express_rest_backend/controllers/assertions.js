const Ajv = require('ajv');
const ajv = new Ajv();

const user_auth_data_schema = require("../../schema/user_auth_data.json");
const queue_data_schema     = require("../../schema/queue_data.json");
const host_data_schema      = require("../../schema/host_data.json")


//Middleware functions to assert the request body integrity with ajv
var ContentAssertions = {}
ContentAssertions.assert_user_auth_data_schema = (req,res,next) => {
    if(!ajv.validate(user_auth_data_schema,req.body)){
        const err = new Error(`user login and register data must follow\n${JSON.stringify(user_auth_data_schema)}`)
        err.name = "UnprocessableContent"
        return next(err)
    }
    next()
}
ContentAssertions.assert_queue_data_schema = (req,res,next) => {
    if(!ajv.validate(queue_data_schema,req.body)){
        const err = new Error(`queue join data must follow\n${JSON.stringify(queue_data_schema)}`)
        err.name = "UnprocessableContent"
        return next(err)
    }
    next()
}
ContentAssertions.assert_host_data_schema = (req,res,next) => {
    if(!ajv.validate(queue_data_schema,req.body)){
        const err = new Error(`host data must follow \n${JSON.stringify(host_data_schema)}`)
        err.name = "UnprocessableContent"
        return next(err)
    }
    next()
}


//Middleware functions to assert the privilege of requests
var AuthorizationAssertions = {}
AuthorizationAssertions.assert_user_auth = (req,res,next) =>{
    if( !req.userdata.privilege >= 1){
        const err = new Error(`you are not logged in  try logging in at POST /user/login/  or register at PUT  /user/ with the body ${JSON.stringify(user_auth_data_schema)} `)
        err.name = "Unauthorized"
        return next(err)
    }
	next()
}

AuthorizationAssertions.assert_host_privilege = (req,res,next) =>{
    if( !req.userdata.privilege >= 2){
        const err = new Error(`you do not have host privilege(2+), if you suspect this is a mistake contact an administrator`)
        err.name = "Unauthorized"
        return next(err)
    }
	next()
}
AuthorizationAssertions.assert_admin_privilege = (req,res,next) =>{
    if( !req.userdata.privilege >= 3){
        const err = new Error(`you do not have administrator privilege(3+)`)
        err.name = "Unauthorized"
        return next(err)
    }
	next()
}

module.exports = {AuthorizationAssertions,ContentAssertions}