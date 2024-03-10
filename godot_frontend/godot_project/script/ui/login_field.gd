extends Control


func _onBtn():
	var data = {
		"user":$ReferenceRect/NameField.text,
		"password":$ReferenceRect/PassField.text
	}
	print("trying to log in %s" % data)
	#TODO

func _ready():
	$ReferenceRect/PassField.secret = true # hide password
	$ReferenceRect/ConfirmBtn.pressed.connect(_onBtn)
