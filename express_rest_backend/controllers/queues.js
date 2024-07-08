const { match } = require("routes");
const {shuffle_array,unique_pairs,zip} = require("../helper_functions.js");
const { UserModel } = require("./database.js");


//Elicitation strategies define how groups of players and possibly servers are obtained before evaluation
const ElicitationStrategy = {}
//returns all possible player pairs in list
ElicitationStrategy.exhausitve_ordered_1v1 = (players)=> unique_pairs(Object.values(players))


const EvaluationStrategy = {}
EvaluationStrategy.skill_based_1v1 = (players) => {
    [player1,player2] = players
    return .01 * (player1.rating - player2.rating)**2 // difference in rating ²
}
EvaluationStrategy.skill_wait_time_based_1v1 = (players) => {
    [player1,player2] = players
    const now = Date.now()
    rating_weight = .001         // 1 per 1000 rating points
    normalized_wait_time = 1/(1+(-player1.queue_entry.join_date -player2.queue_entry.join_date + 2*now)) // normalize time
    wait_time_weight = 1000      // 1000 ms before normalized time sum contributes evaluation change <1
    return  rating_weight*Math.abs(player1.rating - player2.rating)  //weighted difference in rating 
        +   wait_time_weight*normalized_wait_time  //and weighted sum of normalized wait times
}

// selections will be applied as filters to possible matching groups put a threshold on evaluation
const SelectionStrategy = {}
SelectionStrategy.constant_threshold_1v1= (evaluation,constant = 1) => evaluation < constant,
SelectionStrategy.wait_time_threshold_1v1= (players,evaluation,constant = 10) => {
    [player1,player2] = players
    const now = Date.now()
    sum_wait_time = -player1.queue_entry.join_date -player2.queue_entry.join_date + 2*now
    // eval < [0,inf) -> (0,1] approaching 0 as sum_wait_time -> inf
    return evaluation < constant*(1-(1/(sum_wait_time)))
}

//removes less fit groups if players or match is in a more fit group
const cleanup_redundancies_in_sorted_groups = (player_groups) => {
    const redundant_matches = []
    const redundant_players = []
    const irredundant_groups = []
    for(const players of player_groups){
        const player_redundancies = players.map(p => p.username in redundant_players)
        if(player_redundancies.some(Boolean))
            continue
        redundant_players.concat(players.map(p=>p.username))
        irredundant_groups.push(players)
    }
    return irredundant_groups
}

//==========QUEUES======================================================

//queue definitions include:
//	a string id for the route
//	get_new_matches:(players,matches) definition for how to get new matches from waiting players and waiting hosts
//	on_report_match:(report) definition for how to handle a match finished report

// 1v1 RATED
queue_1v1_rated = {}
queue_1v1_rated.id="1v1-rated"
queue_1v1_rated.match_found_expire_ms=20000,
queue_1v1_rated.get_new_matches=(players)=>{
    //elicited groups
    const elicited_groups = ElicitationStrategy.exhausitve_ordered_1v1(players)
    const groups_evals = []
    //evaluated and selected groups
    for(const [player1,player2] of elicited_groups){
        const eval0 = EvaluationStrategy.skill_based_1v1([player1,player2])
        const sel0 = SelectionStrategy.wait_time_threshold_1v1([player1,player2],eval0)
        if(sel0)
            groups_evals.push([[player1,player2],eval0])
    }
    //sort by evaluation and map to groups
    const sorted_selections = groups_evals.sort(
        ([g1,e1],[g2,e2]) => e2-e1
    ).map(
        ([g,e]) => g
    )
    //clen group redundancies
    return cleanup_redundancies_in_sorted_groups(sorted_selections)
}
queue_1v1_rated.on_report_match=(results,match) => {
    const usernames = match.players.map(p => p.username)
    const ratings = match.players.map(p => p.rating)
    const avg_rating = .5*(ratings[0]+ratings[1])
    for(const [username,rating,result] of zip(usernames,ratings,results)){
        const expected_result = 1/(1+Math.exp(0.01*(avg_rating-rating)))
        UserModel.setRating(
            username,
            parseInt(rating + 10*(result-expected_result))
        )
    }
}


module.exports = {queue_1v1_rated}

