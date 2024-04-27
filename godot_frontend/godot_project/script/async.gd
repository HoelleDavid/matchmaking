extends Object

func await_for(timeout_ms,interval_ms,routine):
	signal await_for_timeout
	timeout.connect(func ():print("timeout");return null)
	
	get_tree().create_timer(timeout_ms).timeout.connnect
	_t -= interval_ms
	if time > TIME_PERIOD:
		emit_signal("timeout")
		# Reset timer
		time = 0
		
