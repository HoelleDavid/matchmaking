extends Node2D

@onready var _client = $Client
@onready var _scene = $MainMenu


func _ready():
	var globals = get_node("/root/globals")
	var x = await _client.login("user_c2436","user_c2436")
	print(x["response_code"])
	x = await _client.look_for_match()
	print(x["response_code"])
	
func _process(delta):
	pass
