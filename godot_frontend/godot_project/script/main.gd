extends Node2D

@onready var _client = $Client
@onready var _scene = $MainMenu


func _ready():
	_client.username = "asd"
	_client.password = "asd"
	
# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
