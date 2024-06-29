extends State
class_name match_server_playing_state

func enter():
	print("match server started playing")
	
func exit():
	print("match server play complete")

func physics_process(delta):
	var break_conditions = [
		!get_parent().mms_connection,
		get_parent().mms_connection.is_awaiting_response(),
		!get_parent().mms_connection.has_session()
	]
	for condition in break_conditions:
		if condition:
			return
	
	var add_match_response = await get_parent().mms_connection.add_match()
	print(add_match_response["body"])
	get_parent().match_id = add_match_response["body"]
	#transition.emit(self,"matching_state")
	
