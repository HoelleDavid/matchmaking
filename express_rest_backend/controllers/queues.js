const {shuffle_array,unique_pairs,zip} = require("../helper_functions.js")


//Elicitation strategies define how groups of players and possibly servers are obtained before evaluation

const ElicitationStrategy = {
    //returns all possible player pairs in list
    exhausitve_ordered_1v1: (players)=> unique_pairs(players),
    //considers all servers for all players
    exhausitve_ordered_1v1_server: (players,servers)=> {
        let player_server_pairs = [];
        for (const server of servers) {
            for (const [p1, p2] of unique_pairs(players))
                player_server_pairs.push([p1, p2, server])
        }
        return player_server_pairs;
    },

    /*
    Not yet implemented, im unsure, if this will impact performance

    //by shuffling a range players will be reindexed and groups yielded in a random order from the generator func*
    exhautive_random_1v1_generator : (players) => {
        dim = [players.length,players.length] //size of 1v1 players space
        flat_dim = dim.reduce((a, b)=> a*b) //product of dim
        random_group_flat_indices = shuffle_array(array_range(0,(servers.length*(players.length**2)) - 1)).map(
            flat_index => from_index(flat_index,dim)
        )
        for (const [i,j] of random_group_flat_indices)
            if(i<j)
            yield [players[i], players[j]]
    },
    //servers can be randomly elicited too 
    exhaustive_random_1v1_generator_server : (players,servers) => {
        dim = [players.length,players.length,servers.length] //size of 1v1n1 players and servers space
        flat_dim = dim.reduce((a, b)=> a*b) //product of dim
        random_group_flat_indices = shuffle_array(array_range(0,(servers.length*(players.length**2)) - 1)).map(
            flat_index => from_index(flat_index,dim)
        )
        for (const [i,j,k] of random_group_flat_indices)
            if(i<j)
                yield [players[i], players[j],servers[k]]
    }
    */
}


const EvaluationStrategy = {
    skill_based_1v1: (group) => {
        [player1,player2] = group
        return .01 * abs(player1.rating - player2.rating) // difference in rating
    },
    skill_wait_time_based_1v1: (group) => {
        [player1,player2] = group
        rating_weight = .01         // 1 per 100 rating points
        normalized_wait_time = 1/(1+(player1.wait_time_ms+player2.wait_time_ms)) // normalize time
        wait_time_weight = 500      // 500 ms before normalized time sum contributes evaluation change <1
        return  rating_weight*Math.abs(player1.rating - player2.rating)  //weighted difference in rating 
            +   wait_time_weight*normalized_wait_time  //and weighted sum of normalized wait times
    }
}
// selections will be applied as filters to possible matching groups put a threshold on evaluation
const SelectionStrategy = {
    constant_threshold_1v1: (group,evaluation) => evaluation > 1,
    wait_time_threshold_1v1: (group,evaluation) => {
        [player1,player2] = group
        time_adjustment = (player1.wait_time_ms + player2.wait_time_ms)
        time_adjustment_weight = .00001 // 1 per 100s
        return evaluation > 1 + time_adjustment_weight*time_adjustment
    }
}



//queue definitions include:
//	players and hosts, grouped by their match status
//	definitions for how missmatched player groups are / how eligable they are for finding a match
//	a function that returns found matches

queue_1v1_rated = {
    id:"1v1-rated",
    players:{},
    player_state: (username) => players[username] ? players[username].state : "IDLE",
    matches:{},
    match_state: (match_id) => matches[match_id] ? matches[match_id].state : "IDLE",
	match_found_expire_ms:20000,
    
    elicitation_strategy:ElicitationStrategy.exhausitve_ordered_1v1_server,
    evaluation_strategy:EvaluationStrategy.skill_wait_time_based_1v1,
    selection_strategy:SelectionStrategy.wait_time_threshold_1v1,
    
	get_new_matches:function(){
        const elicited_groups = this.elicitation_strategy(this.players.filter(p => p.queue_entry.player_state === "MATCHING"),this.servers.filter(s => s.match_state))
        const group_evaluations = elicited_groups.map(this.evaluation_strategy)
        const group_selections = elicited_groups.map(this.selection_strategy)
        return zip(elicited_groups,group_evaluations,group_selections).filter(
            ([g,e,s]) => s                      // filter by selection 
        ).sort(
            ([g1,e1,s1],[g2,e2,s2]) => e1-e2    // sort by evalutaion
        ).map(
            ([g,e,s]) => g//[g,e]               // return possible ordered matches without eval
        )
    },
}

module.exports = {queue_1v1_rated}