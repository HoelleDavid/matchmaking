const crypto = require("crypto")

const generateHashSalt = (password) =>	{
	var salt = crypto.randomBytes(32).toString("hex");
	var hash = crypto.pbkdf2Sync(password,salt,
		Number(process.env.cryptIterationCount),Number(process.env.cryptKeyLength),process.env.cryptDigest
	).toString("hex");
	return {salt:salt,hash:hash}
}
const isValidHash = (password,hash,salt) => {
	var verifyHash = crypto.pbkdf2Sync(password,salt,
		Number(process.env.cryptIterationCount),Number(process.env.cryptKeyLength),process.env.cryptDigest
	).toString("hex");
	return hash === verifyHash;
}

module.exports = {generateHashSalt,isValidHash}