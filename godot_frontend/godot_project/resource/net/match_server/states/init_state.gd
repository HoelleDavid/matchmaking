extends state
class_name match_server_init_state

func enter():
	pass
	
func exit():
	print("match server matching")

var get_match_response = null
func physics_process(delta):
	if get_parent().mms_connection.is_awaiting_response():
		return
	if !get_parent().mms_connection.has_session():
		print("awaiting mms session")
		await get_parent().mms_connection.login(get_parent().username,get_parent().password)
		return
	
	if !get_match_response:
		get_match_response = await get_parent().mms_connection.get_match("provided host adress")
		return
	
	# has get_match response
	print(get_match_response["body"])
	get_parent().id = get_match_response["body"]
	transition.emit(self,"matching_state")
	
