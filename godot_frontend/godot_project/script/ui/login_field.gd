class_name login_field
extends Control

signal login_data
@onready var globals = get_node("/root/globals")

func _onBtn():
	var data = {
		"user":$ReferenceRect/NameField.text,
		"password":$ReferenceRect/PassField.text
	}
	if _matches(data):
		globals.on_login($ReferenceRect/NameField.text,$ReferenceRect/PassField.text)



func _matches(data):
	#TODO check required format
	return true

func _ready():
	$ReferenceRect/PassField.secret = true # hide password
	$ReferenceRect/ConfirmBtn.pressed.connect(_onBtn)
