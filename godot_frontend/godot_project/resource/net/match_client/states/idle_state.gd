extends State
class_name match_client_idle_state



func enter():
	print("match client enter idle")

func exit():
	print("match client exit idle")

func physics_process(delta):
	print("idle")
	if get_parent().mms_connection.is_awaiting_response():
		return
