extends State
class_name match_server_init_state

func enter():
	print("MS: match server initialized")
	
func exit():
	print("MS: match server obtained id: %s, started matching"%get_parent().match_id)

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
	
	var add_match_response = await get_parent().mms_connection.add_match({
		addr = get_parent().enet_address,
		port = get_parent().enet_port
	})
	var res_id = JSON.parse_string(add_match_response["body"]).id
	if(res_id <= 0):
		printerr("MS: could not parse int from res:\n%s"%add_match_response["body"])
		return
	get_parent().match_id = res_id
	
	transition.emit(self,"matching_state")
	
