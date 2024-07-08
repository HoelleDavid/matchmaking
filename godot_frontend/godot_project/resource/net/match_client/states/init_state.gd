extends State
class_name match_client_init_state


func enter():
	print("MC: initializing")
	
func exit():
	print("MC:  connected, queue entry created, exit idle")

func physics_process(delta):
	for condition in get_parent().process_break_conditions():
		if condition:
			return
	
	var join_queue_response = await get_parent().mms_connection.join_queue("1v1-rated")
	if(join_queue_response["response_code"] not in [201,409]):#conflict or created, implying the entry exists
		printerr(join_queue_response)
		return
	
	transition.emit(self,"matching_state")
	
