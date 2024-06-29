extends state
class_name match_client_no_logon_state
var mms_conn
func _ready():
	mms_conn = get_parent().mms_connection

func physics_process(delta):
	if mms_conn.has_mms_session():
		transition.emit(self,"idle_state")
