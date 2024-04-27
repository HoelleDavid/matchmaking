extends Node

@onready var _http = $HTTPSession
var _peer = WebRTCMultiplayerPeer.new();
@export var username : String
@export var password : String
@export var saveCredentials := true

func establish_http_sesion():
	if _http.load_headers("user://%s.httpsesion"%username):
		return
	if !_http.has_session():
		await _http.register(username,password)
		await _http.login(username,password)
	await _http.login(username,password)
	_http.save_headers("user://%s.httpsesion"%username)
	assert( _http.has_session())

func _ready():
	assert(username != "")
	assert(password != "")
	await establish_http_sesion()
	
	
func _process(delta):
	pass
