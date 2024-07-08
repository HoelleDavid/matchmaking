extends State
class_name match_server_finished_state

func enter():
	print("MS: reporting back")
	
func exit():
	pass

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
	var results = [0,0]
#=====Simulate game results based on username=========
	var simulated_results = [1,-1]
	var player_int_0 = int(get_parent().players[0].username.split("_")[-1])
	var player_int_1 = int(get_parent().players[1].username.split("_")[-1])
	if(randi()%(player_int_0+player_int_1) > player_int_0):
		simulated_results = [-1,1]
	results = simulated_results
#=============END simulation====================
	var finalize_match_response = await get_parent().mms_connection.finalize_match(
		get_parent().match_id,
		{"report":results}
	)
	finalize_match_response = JSON.parse_string(finalize_match_response["body"])
	print("MS: game complete %s "%finalize_match_response)
	get_parent().reset()
	transition.emit(self,"init_state") #reset
	
