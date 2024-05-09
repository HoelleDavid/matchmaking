extends Node
class_name state_machine

#This is a base class for state machines
#it requires states to be present on scene nodes and referenced in @export fields
@export
var states : Array[state] = []
@export
var active_state : state = null


func on_transition(state_old,state_new):
	print(state_old)
	print(state_new)
	pass
	
	
func _ready():
	for state_instance in states:
		print(state_instance)
		state_instance.transition.connect(on_transition)
	active_state.enter()
func _physics_process(delta):
	if active_state:
		active_state.physics_process(delta)
		
func _process(delta):
	if active_state:
		active_state.process(delta)
		
