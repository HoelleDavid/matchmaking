extends State
class_name match_client_playing_state


func enter():
	print("MC: started PLAYING")
	
func exit():
	print("MC: finished PLAYING")

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
	
	var get_queue_response = await get_parent().mms_connection.get_queue()
	get_queue_response = JSON.parse_string(get_queue_response["body"])
	if(!get_queue_response["state"] != "PLAYING"):
		transition.emit(self,"init_state") #reset
