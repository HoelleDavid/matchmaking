extends Node

@export var mms: MMSConnection
@export var username = ""
@export var password = ""
@export var login_only = false
func _ready():
	if(!login_only):
		await mms.register(username,password)
	var res = await mms.login(username,password)
	print("bootsrap completed for %s\n%s"%[str(self),res])
