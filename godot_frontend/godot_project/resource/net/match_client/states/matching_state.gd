extends State
class_name match_client_matching_state

func enter():
	print("MC: started matching, polling queue entry")
	get_parent().match_id = -1
	
func exit():
	print("MC: stopped matching")

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
	
	var get_queue_response = await get_parent().mms_connection.get_queue()
	get_queue_response = JSON.parse_string(get_queue_response["body"])
	if(get_queue_response["state"] == "MATCHING"):
		return
	get_parent().match_id = get_queue_response["match"]
	print("MC: get_queue : %s"%get_queue_response)
	transition.emit(self,"match_found_state")
	
