const {MatchHistoryModel} = require("./database")
class Match {
    //A match belongs to a host, it has a database entry with
    constructor(host_username,host_adress,accept_timeout = 20000) {
        this.host = {
            username:host_username,
            adress:host_adress
        }
        this.accept_timeout = accept_timeout
        this.state = "NOT_FOUND"
    }

    initialize(){
        return MatchHistoryModel.addMatch(this.host.username).then(
            id => {
                this.id = id
                this.state = "MATCHING"
            }
        )
    }
    found_players(players){
        if(this.state != "MATCHING"){
            console.warn(`FOUND_MATCH(${players}) during ${this.state}`)
            return
        }
        this.players = players
        players.map(p => p.accepted = false) // player accepted flags
        setTimeout(() => { 
            if(this.players !== players) 
                return  //this is called after a match was cancelled and found withtin timeout
            if(this.state === "MATCH_FOUND"){
                delete this.players
                this.state = "MATCHING"
            }

        } ,accept_timeout)
        this.state = "MATCH_FOUND"
    }
    accept(username){
        if(!this.state === "MATCH_FOUND"){
            console.warn(`ACCEPT(${username}) during ${this.state}`)
            return
        }
        this.players.map(p => p.accepted |= (p.username === username))
        this._finalize_accept()
    }
    _finalize_accept(){
        if(!every(this.players.accepted))
            return
        MatchHistoryModel.setPlayers(JSON.stringify(this.players.map(p => p.username))).then(
            _ => { //sucesss
                this.state = "PLAYING"
            }
        ).catch(
            (err) => console.warn(`cannot finalize match ${err}`)
        )
    }
    refused(/*username for logging purposes*/){
        if(!this.state === "MATCH_FOUND")
            console.warn(`ACCEPT(${username}) during ${this.state}`)
        this.state = "MATCHING"
    }
    finalize(result){
        MatchHistoryModel.setResult(this.id,JSON.stringify(result)).then(
            _ => { //sucesss
                this.result = result
                this.state = "FINISHED"
            }
        ).catch(
            (err) => console.warn(`cannot finalize match ${err}`)
        )
    }

    player_view = ()=>{

    }

    host_view = ()=>{

    }
    admin_view = ()=> {

    }
}
module.exports = Match