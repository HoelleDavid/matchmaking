const express = require("express")
const router = express.Router()


const {UserPrivilegeModel} = require("../database");



//server users may provide/revoke match servers
router.post("/revokeserver/",
	(req,res,next) => {
		
	}
);
router.post("/provideserver/",
	(req,res,next) => {
		
	}
);




module.exports = router