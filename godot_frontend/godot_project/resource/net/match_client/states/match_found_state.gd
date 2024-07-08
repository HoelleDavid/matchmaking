extends State
class_name match_client_match_found_state

func enter():
	print("found match, accepting")
	
	
func exit():
	pass

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
	
	var accept_match_response = await get_parent().mms_connection.accept_match(get_parent().match_id)
	print("accept response by MMS:\n%s"%accept_match_response["body"])
	transition.emit(self,"accepted_state")
	

