extends Node
class_name MatchServerPool

@export var mms_connection :MMSConnection

@export var server_pool = []
@export var username = "server_pool_00"
@export var password = "server_pool_00"
func _ready():
	if(len(server_pool) == 0):
		printerr("pool empty")
		return
	if(!mms_connection.has_mms_session()):
		await mms_connection.register(username,password)
		await mms_connection.login(username,password)
	

const poll_res = await mms_connection.get_match()
func _physics_process(delta):
	for match_server_instane in server_pool:
		
