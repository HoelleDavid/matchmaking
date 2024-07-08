extends State
class_name match_server_matching_state

func enter():
	print("MS: matching started")
	
func exit():
	print("MS obtained id: %s, started matching"%get_parent().match_id)

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
			
	var get_match_response = await get_parent().mms_connection.get_match(get_parent().match_id)
	get_match_response = JSON.parse_string(get_match_response["body"])
	print("MS: get_match: %s"%get_match_response)
	var state = get_match_response.state
	if(state == "PLAYING"):
		get_parent().players = get_match_response.players
		get_parent().player_session_keys = get_match_response.player_session_keys
		transition.emit(self,"finished_state")
		return
	
	if(state not in ["MATCHING","MATCH_FOUND"]):
		printerr("MS: error in recieved state %s"%state)
		transition.emit(self,"init_state")
