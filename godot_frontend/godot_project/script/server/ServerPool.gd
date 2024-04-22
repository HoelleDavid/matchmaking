extends Node

const SERVER_LIMIT = 16
const PEER_LIMIT = SERVER_LIMIT*4


var servers = []

var queue
#var peers = null*PEER_LIMIT
# Called when the node enters the scene tree for the first time.
func _ready():
	for i in range(SERVER_LIMIT):
		servers.append(null)
	print(servers)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
