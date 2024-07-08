extends StateMachine
#used to run and store a match
class_name MatchServer

@export 
var mms_connection : MMSConnection

var players = []
var player_session_keys = []
var match_id = -1 # -1 indicates match state not synced

#var enet_server = ENetMultiplayerPeer.new()
@export
var enet_port = 3010
@export
var enet_address = "127.0.0.1"

#defines conditions to be met before executing state process
func process_break_conditions():
	return [
		!self.mms_connection,
		self.mms_connection.is_awaiting_response(),
		!self.mms_connection.has_user()
	]

func reset():
	self.players = []
	self.player_session_keys = []
	self.match_id = -1

func get_player_session_key(username):
	var index = players.find(username)
	if index >= 0:
		return player_session_keys[index]



#var args = [] #cmdline args
#func _ready():
#	args = Array(OS.get_cmdline_args())
#	print("match server starting on %s:%s"%[enet_address,enet_port])
	
	


#enet peers
#var clients = {}
	

#ready	
	#enet_server.create_server(enet_port,2)
	#multiplayer.multiplayer_peer = enet_server
	#multiplayer.peer_connected.connect(_on_connect())
	#multiplayer.peer_disconnected.connect(_on_disconnect())


#func _on_connect_client(client_id):
#	clients[client_id]  = {
#		"authenticated": false,
#		 "timeout": 10,
#	}

#@rpc("any_peer")
#func send_session_key(session_key):
#	if(session_key not in player_session_keys):
		
