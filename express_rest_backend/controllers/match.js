const crypto = require("crypto")

//if database is not connected yet, this will attempt connection
//SHOULD not happen
const {MatchModel} = require("./database")
class Match {
    //A match belongs to a host, it has a database entry with
    constructor(host_username =undefined,host_adress = undefined,queue_id=undefined,accept_timeout = 20000) {
        this.host = {
            username:host_username,
            adress:host_adress
        }
        this.queue_id = queue_id
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
                return id
            }
        )
    }
    //transition to waiting for accepts of all users
    found_players(players){
        if(this.state != "MATCHING"){
            console.warn(`found_players(${players}) during ${this.state}`)
            return
        }
        this.players = players
        //console.log(`set players ${JSON.stringify(players)} for match ${JSON.stringify(this)}`)
        players.map(p => p.state = "MATCH_FOUND")   //player state
        players.map(p => p.match = this.id)         //reference found match
        players.map(p => p.accepted = false)        // player accepted flags
        setTimeout(() => { 
            if(this.players !== players) 
                return  //this is the edge case of 2x cancel within a timeout this.state would be MATCHING
            if(this.state === "MATCH_FOUND"){
                players.map(p => p.state = "MATCHING")   //reset player state
                players.map(p => delete p.match)         //reset reference found match
                delete this.players
                this.state = "MATCHING"
            }
            
        } ,15000)
        this.state = "MATCH_FOUND"
    }
    accept(username){
        //console.warn(`ACCEPT(${username}) during ${this.state}`)
        if(!this.state === "MATCH_FOUND"){
            console.warn(`ACCEPT(${username}) during ${this.state}`)
            return
        }
        for(const player of this.players)
            if(player.username == username)
                player.accepted = true
        this._finalize_accept()
    }
    _finalize_accept(){
        if(!this.players.map(p => p.accepted).every(Boolean))
            return
        const players_string = JSON.stringify(this.players.map(p => p.username))
        MatchModel.setPlayers(this.id,players_string).then(
            _ => { //sucesss
                this.state = "PLAYING"
                this.players.map(p => p.state = "PLAYING")
                this.players.map(p => p.match = this.id)
                this.player_session_keys = this.players.map(p => crypto.randomBytes(16).toString("hex"))
            }
        ).catch(
            (err) => console.warn(`cannot set players ${err}`)
        )
    }
    refused(/*username for logging purposes*/){
        if(!this.state === "MATCH_FOUND")
            console.warn(`REJECT(${username}) during ${this.state}`)
        this.state = "MATCHING"
        this.players.map(p => p.state = "MATCHING")
        this.players = []
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
        this.players.map(p => p.state = "IDLE")
    }

    player_view = (username) => {
        const result = {
            state:this.state
        }

        if(this.players){
            result.players = this.players.map(p => {
                const {username,rating} = p;
                return {username,rating}
            })
            const player_index = this.players.findIndex(p => p.username == username)
            if(player_index == -1 || this.state != "PLAYING")
                result["local_player_session_key"] = ""
            else
                result["local_player_session_key"] = this.player_session_keys[player_index]
            
        }
        //only show host when playing 
        if(this.state in ["PLAYING"/*,"MATCH_FOUND"*/])
            result.host = this.host
        
       return result
    }


    host_view = () => {
        return {
            state:this.state,
            players:this.players,
            player_session_keys:this.player_session_keys,
            host:this.host
        }
    }
    admin_view = ()=> {
        return this
    }
}
module.exports = Match