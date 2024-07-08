extends Node
class_name StateMachine

#This is a base class for state machines
#it requires states to be present on scene nodes and referenced in @export fields
@export
var states : Array[State] = []
@export
var active_state : State = null

#transitions use the old node and new node name to identify states,
#trigger the right exit() and init()
func on_transition(state_old,state_name_new):
	var state_new = states.filter( func(s) : return s.name == state_name_new)[0]
	if !state_new:
		printerr("failed to find target state for transition in %s\n  from %s\n  to %s\n"%[self,state_old,state_name_new])
	state_old.exit()
	self.active_state = state_new
	state_new.enter()
	
func _ready():
	for state_instance in states:
		print(state_instance)
		state_instance.transition.connect(on_transition)
	active_state.enter()
	

#states update only if active
func _physics_process(delta):
	if active_state:
		active_state.physics_process(delta)
func _process(delta):
	if active_state:
		active_state.process(delta)
		
