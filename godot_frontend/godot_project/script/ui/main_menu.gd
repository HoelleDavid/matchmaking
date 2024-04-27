extends Control

@onready var login = $LoginField
@onready var register = $RegisterField


func _ready():
	assert(login != null)
	assert(register != null)
