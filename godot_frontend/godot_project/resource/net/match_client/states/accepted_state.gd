extends State
class_name match_client_accepted_state

func enter():
	print("MC: accepted, waiting for PLAYING or MATCHING")
	
func exit():
	print("MC: exit ACCEPTED")

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
	
	var get_queue_response = await get_parent().mms_connection.get_queue()
	get_queue_response = JSON.parse_string(get_queue_response["body"])
	if(!get_queue_response.has("state")):
		return
	if(get_queue_response["state"] == "PLAYING"):
		transition.emit(self,"playing_state")
	if(get_queue_response["state"] == "MATCHING"):
		transition.emit(self,"matching_state")
