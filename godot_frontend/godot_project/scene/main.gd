extends Node2D

@onready var mms_cli = $group00/mms_client
@onready var m_cli = $group00/match_client

func _process(delta):
	if Input.is_action_just_pressed("ui_accept") and not mms_cli.is_awaiting_response():
		var x = await mms_cli.login("user_c01","user_c01")
		print(x["response_code"])
	if Input.is_action_just_pressed("ui_up") and not mms_cli.is_awaiting_response():
		var x = await mms_cli.register("user_c01","user_c01")
		print(x["response_code"])
