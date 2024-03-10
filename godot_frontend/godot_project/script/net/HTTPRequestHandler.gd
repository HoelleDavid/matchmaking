extends HTTPRequest

func await_request():
	print("waiting :D")

func d_ready():
	request_login()

func request_login():
	self.request_completed.connect(_on_login_request_completed)
	self.request("https://api.github.com/repos/godotengine/godot/releases/latest")
	OS.delay_msec(1000)
	self.request_completed.disconnect(_on_login_request_completed)

func _on_login_request_completed(result, response_code, headers, body):
		#headers = ["Content-Type: application/json"]
		var body_json = JSON.parse_string(body.get_string_from_utf8())
		if response_code != 200:
			push_warning("request returned response code %s" % response_code)
			pass
		print("[result,response_code,headers,body_json]")


#WAYS TO SLEEP
#await get_tree().create_timer(1).timeout
#OS.delay_msec(1000)
