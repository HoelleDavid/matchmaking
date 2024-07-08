extends StateMachine
class_name MatchClient


@export 
var auto_rematch = false 
@export 
var mms_connection : MMSConnection

var players = []
var local_user_session_key = ""
var match_id = -1 # -1 indicates match not found
var match_data = null #match from api
#var enet_server = ENetMultiplayerPeer.new()
@export
var enet_port = -1
@export
var enet_address = ""

#defines conditions to be met before executing state process
func process_break_conditions():
	return [
		!self.mms_connection,
		self.mms_connection.is_awaiting_response(),
		!self.mms_connection.has_user()
	]

