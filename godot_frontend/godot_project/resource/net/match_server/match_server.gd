extends StateMachine
#used to run and store a match
class_name MatchServer
#reset automatically in finished_state
@export 
var auto_reset = false 
@export 
var mms_connection : MMSConnection
var enet_server = ENetMultiplayerPeer.new()
var enet_port = 3010
var enet_adress = "127.0.0.1"
var players = []
var player_session_keys = []
var match_id = -1 # -1 indicates match state not synced

func reset():
	self.players = []
	self.player_session_keys = []
	self.match_id = -1

func get_player_session_key(username):
	var index = players.find(username)
	if index >= 0:
		return player_session_keys[index]

func _ready():
	enet_server.create_server(enet_port,2)
	multiplayer.multiplayer_peer = enet_server
