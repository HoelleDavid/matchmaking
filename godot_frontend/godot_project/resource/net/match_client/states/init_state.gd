extends State
class_name match_client_init_state


func enter():
	print("match client initialized, awaiting mms connection")
	
func exit():
	print("match client connected, exit idle")

func physics_process(delta):
	print("init")
	if !get_parent().mms_connection:
		return
	if get_parent().mms_connection.is_awaiting_response():
		return
	if !get_parent().mms_connection.has_user():
		return
	var res = await get_parent().mms_connection.get_queue()
	if res["response_code"] != 200:
		return
	var get_queue_body = JSON.parse_string(res["body"])
	print(get_queue_body)
	#restore state from server
	match get_queue_body.state:
		"IDLE":
			transition.emit(self,"idle_state")
		"MATCHING":
			transition.emit(self,"matching_state")
		"MATCH_FOUND":
			transition.emit(self,"matching_state")
		"PLAYING":
			transition.emit(self,"playing_state")
		_:
			printerr("could not pull server state for %s"%get_parent())
			return #stay in state until there is a server state
			
		
	
