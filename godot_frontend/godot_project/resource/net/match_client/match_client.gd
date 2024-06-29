extends StateMachine
class_name match_client

@export var mms_connection : MMSConnection = null

func try_login(username,password):
	mms_connection.login(username,password) 

func try_join_queue(queue_id = "1v1-rated"):
	mms_connection.join_queue(queue_id)
	
func try_leave_queue():
	mms_connection.leave_queue()

func try_accept_match(match_id):
	mms_connection.accept_match(match_id)
