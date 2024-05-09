extends state
class_name match_client_init_state


func enter():
	print("match client initialized, awaiting mms connection")
	
func exit():
	print("match client exit idle")

func physics_process(delta):
	if !get_parent().mms_connection.has_mms_session():
		return
	#TODO connect other logic
	if Input.is_action_just_pressed("ui_accept"): 
		var res = await get_parent().mms_connection.look_for_match()
		if res["response_code"] == 201:
			transition.emit(self,"matching_state")
		else:
			push_warning(res)
		
	
