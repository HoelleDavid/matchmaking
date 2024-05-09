class_name register_field
extends Control

signal register_data
@onready var globals = get_node("/root/globals")
func _onBtn():
	var data = {
		"user":$ReferenceRect/NameField.text,
		"password":$ReferenceRect/PassField.text,
		"password_check" : $ReferenceRect/PassField2.text
	}
	if _matches(data):
		data.erase("password_check")
		globals.on_register($ReferenceRect/NameField.text,$ReferenceRect/PassField.text)
		print("trying to register in %s" % data)


func _matches(data):
	#TODO check required format
	return data["password"] == data["password_check"]

func _ready():
	$ReferenceRect/PassField.secret = true # hide password
	$ReferenceRect/PassField2.secret = true
	$ReferenceRect/ConfirmBtn.pressed.connect(_onBtn)
