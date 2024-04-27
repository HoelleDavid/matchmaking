const queue = { players: [], hosts:[] }


const schema = require("../../schema/host_data.json")
const data = {}

/** 
    controller functions:
    functions will assume semantics and integrity of data fields (@param host_data ,@param queue_data)
    the schema validation happens in /routes
    each syntax mistake in a data field function may raise one Exception caught in /routes
    
*/


const onProvideHost = (username,host_data) => {
    console.log(`provide host call, username=${username}, host_data = ${host_data}`);
}
const onRevokeHost = (username,host_data = null) => {
    console.log(`revoke host call, username=${username}, host_data = ${host_data}`);
}
const onPollHost = (username) => {
    console.log(`poll host call username=${username}`);
}


const onJoinQueue= (username,queue_data) => {
    console.log(`join queue call, username=${username}, queue_data = ${queue_data}`);
}
const onExitQueue = (username,queue_data = null) => {
    console.log(`exit queue call, username=${username}, queue_data = ${queue_data}`);
}
const onPollQueue = (username) => {
    console.log(`poll queue call`);
}
module.exports = {onProvideHost,onRevokeHost,onPollHost,onJoinQueue,onExitQueue,onPollQueue}
