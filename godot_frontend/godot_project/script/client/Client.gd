extends Node

@onready var _http = $HTTPSession
var _peer = WebRTCMultiplayerPeer.new();
@export var username : String
@export var password : String
@export var saveCredentials := true




func _ready():
	assert(username != "")
	if (_http.has_session()):
		pass

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
