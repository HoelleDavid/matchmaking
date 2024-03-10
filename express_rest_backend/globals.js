var SQLServerUser,SQLServerPassword,SQLServerIP,SQLServerPORT;

function _readConfig(){
    var parsedJSON = require('./config.json');
    
    SQLServerUser = parsedJSON["SQLServerUser"];
    SQLServerPassword = parsedJSON["SQLServerPassword"]
    SQLServerIP= parsedJSON["SQLServerIP"]
    SQLServerPORT= parsedJSON["SQLServerPORT"]
}
_readConfig();


module.exports = {SQLServerUser,SQLServerPassword,SQLServerIP,SQLServerPORT};