extends State
class_name match_server_finished_state

func enter():
	print("match finished")
	if get_parent().auto_reset:
		get_parent().reset()
		transition.emit(self,"init_state")
	
func exit():
	print("match server reset")
