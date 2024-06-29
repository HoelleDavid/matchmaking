//if database is not connected yet, this will attempt connection
//SHOLD not happen
const {MatchModel} = require("./database")
class Match {
    //A match belongs to a host, it has a database entry with
    constructor(host_username =undefined,host_adress = undefined,queue=undefined,accept_timeout = 20000) {
        this.host = {
            username:host_username,
            adress:host_adress
        }
        this.accept_timeout = accept_timeout
        this.state = "NOT_FOUND"
    }

    //this can be used to recover matches on mms crash or inspect past matches
    deserialize_from_model(match_id){
        return MatchModel.getById(match_id).then(
            res => {
                this.match_id = res.match_id
                if(!this.match_id){
                    this.state = "NOT_FOUND"
                    return
                }
                if(!this.start){
                    this.host = JSON.parse(res.host)
                    this.state = "MATCHING"
                    return
                }
                //MATCH_FOUND doesnt exist and isnt serialized
                if(!this.end){
                    this.players = res.players
                    this.start = res.start
                    this.end = res.end
                    this.result = res.result
                    this.state = "PLAYING"
                    return
                }
                this.state = "FINISHED"
            }
        )
    }


    //=================LIFECYCLE=====================================================
    //begin by serializing a database entry and set the match_id and next state
    initialize(){
        return MatchModel.addMatch(this.host.username).then(
            id => {
                this.id = id
                this.state = "MATCHING"
            }
        )
    }
    //transition to waiting for accepts of all users
    found_players(players){
        if(this.state != "MATCHING"){
            console.warn(`FOUND_MATCH(${players}) during ${this.state}`)
            return
        }
        this.players = players
        players.map(p => p.accepted = false) // player accepted flags
        setTimeout(() => { 
            if(this.players !== players) 
                return  //this is the edge case of 2x cancel within a timeout this.state would be MATCHING
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
        MatchModel.setPlayers(JSON.stringify(this.players.map(p => p.username))).then(
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
        MatchModel.setResult(this.id,JSON.stringify(result)).then(
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