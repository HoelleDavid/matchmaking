extends State
class_name match_server_playing_state

func enter():
	print("started playing")
	multiplayer.peer_connected.connect(func():return)
	
func exit():
	print("match server play complete")

var play_time = 0
func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
			
	var get_match_response = await get_parent().mms_connection.get_match(get_parent().match_id)
	get_match_response = JSON.parse_string(get_match_response["body"])
	print(get_match_response)
	if(play_time > 5000):
			transition.emit(self,"finished_state")
	
