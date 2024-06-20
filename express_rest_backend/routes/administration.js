var fs = require("fs");
const express = require("express");
const router = express.Router()
const app = require("../app")


//==============Controller===========================================
const {AuthorizationAssertions,ContentAssertions} = require("../controllers/assertions");
const { UserModel } = require("../controllers/database");

//read administration html
var admin_page = "<html><h1>resource missing for administration page</h1></html>"
var filename = require.resolve("../html/administration.txt");
fs.readFile(filename, 'utf8',
	(err,res)=>{
		admin_page = res;
	}
);
// send mask for admin page with subscript message
router.use(
	"/",
	AuthorizationAssertions.assert_privilege_minimum(3),
	(req,res,next) => {
		res.send_admin_page_subtexted = (msg) => {
			res.status(200).send(admin_page.replace("</html>",`<br><a>${msg}<a></html>`))
		};
		next();
	}
);


//========Route endpoints========
router.get(
	"/",
	(req,res,next) => {
		res.send_admin_page_subtexted("")
	}
)

//update user privilege call by an admin
router.post(
	"/",
	(req,res,next) => {
		//check privilege range
		if(!typeof req.body.privilege == "number" || req.body.privilege<0 || req.body.privilege>2){
			res.send_admin_page_subtexted(`privilege ${req.body.privilege} out of bounds`)
			return;
		}
		
		//find user
		const p1 = UserModel.findByUsername(req.body.username).then(
			(user) => {
				var msg  = `found user ${user} \n`
				//perform privilege update
				UserModel.setPrivilege(req.body.username,req.body.privilege).then(
					(sqlres) => {
						res.send_admin_page_subtexted(msg + `set privilege ${sqlres}`)
						return
					}
				).catch(
					(err) => {
						res.send_admin_page_subtexted(msg + `unable to set privilege ${err}`);
						return
					}
				)
			}
		).catch(
			(err) => {
				res.send_admin_page_subtexted( `couldn't find user ${err} \n`)
			}
		)

	}
)

module.exports = router