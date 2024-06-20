extends Node2D

@onready var mms_cli = $group00/mms_client
@onready var m_cli = $group00/match_client

func _process(delta):
	if mms_cli.is_awaiting_response():
		return
		
		
	if Input.is_key_pressed(KEY_U):
		var x = await mms_cli.userdata()
		print(x["body"].get_string_from_utf8())
	if Input.is_key_pressed(KEY_L):
		var x = await mms_cli.login("user_c01","user_c01")
		print(x["response_code"])
	
	if Input.is_key_pressed(KEY_R):
		var x = await mms_cli.register("user_c01","user_c01")
		print(x["response_code"])

	if Input.is_key_pressed(KEY_Q):
		var x = await mms_cli.look_for_match()
		print(str(x["response_code"]) + x["body"].get_string_from_utf8())

	if Input.is_key_pressed(KEY_D):
		var x = await mms_cli.leave_queue()
		print(x["response_code"])
