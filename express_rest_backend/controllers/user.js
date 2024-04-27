const app = require("../app")
// set session-user metadata on req.userdata
app.use(
	(req,res,next) => {
		req.userdata = {}
		req.userdata.userAuth = req.isAuthenticated()
		if(req.userdata.userAuth){
			req.userdata.username =  req.session.passport.user
			udatapromises = [
				UserPrivilegeModel.getHostPrivilege(req.userdata.username).then(
					(isHost) => {req.userdata.hostPrivilege = isHost}
				)
			]
	
			Promise.all(udatapromises).then(
				() => {next()}
			).catch(next)
		}else{
			req.userdata.username = ""
			req.userdata.hostPrivilege = false
			next()
		}
	}
)

const assertUserAuth = (req,res,next) =>{
    if( !req.userdata.userAuth ){
        res.status(401)
        res.send("you are not logged in. consider logging in at /user/login/ via POST")
        next()
    }
}
const assertHostPrivilege = (req,res,next) =>{
    assertUserAuth(req,res,next)
    UserPrivilegeModel.isHost(req.userdata.username).then(
        (isHost) => {isHost?next():pass}
    ).catch(
        (err) =>{
            res.status(401);
            res.send("you are no server user");
            next();
        }
    )
}


module.exports = {assertUserAuth,assertHostPrivilege}