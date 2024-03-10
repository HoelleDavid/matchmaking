extends Control


func _onBtn():
	if $ReferenceRect/PassField.text != $ReferenceRect/PassField2.text:
		print("invalid login data")
	var data = {
		"user":$ReferenceRect/NameField.text,
		"password":$ReferenceRect/PassField.text
	}
	print("trying to register %s" % data)
	#TODO

func _ready():
	$ReferenceRect/PassField.secret = true # hide password
	$ReferenceRect/ConfirmBtn.pressed.connect(_onBtn)
