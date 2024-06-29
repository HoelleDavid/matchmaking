extends State
class_name match_server_matching_state

func enter():
	print("match server initialized")
	
func exit():
	print("match server obtained id: %s, started matching"%get_parent().match_id)

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
	
