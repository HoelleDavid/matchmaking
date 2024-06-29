extends Node

@onready var conn = $"../mms_connection"
@onready var client = $"../match_client"
# Called when the node enters the scene tree for the first time.
func _ready():
	print([1,2].find(3))
	await conn.register("player_test2","player_test2")
	await conn.login("player_test2","player_test2")

# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta):
	pass
