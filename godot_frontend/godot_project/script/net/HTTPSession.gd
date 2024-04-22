extends Node


@onready var http = $HTTPRequest
var MMS_URL = "http://127.0.0.1:3000/"
var session_headers = ["Content-Type: application/json"]
var _response = null

func request(url,method,body=""):
	assert(_response == null)
	http.request_completed.connect(
		func (res_result, res_response_code, res_headers, res_body) : _response={"result":res_result, "response_code":res_response_code, "headers":res_headers, "body":res_body}
	)
	http.request(url,session_headers,method,body)
func has_response():
	return _response != null;
func pop_response():
	var tmp_res = _response
	_response = null
	return tmp_res
	
func await_response():
	while !has_response():
		await get_tree().create_timer(.1).timeout

func login(username,password):
	var body = JSON.stringify({"username":username, "password":password})
	request(MMS_URL+"user/login/",HTTPClient.METHOD_POST,body)
	await await_response()
	var  res = pop_response()
	if res["response_code"] != 200:
		push_warning("request returned response code %s\n%s" % [res["response_code"],res["body"].get_string_from_utf8()])
		pass
	session_headers += _get_set_headers(res["headers"])
	
	
func _get_set_headers(headers):
	var acc = []
	for h in headers:
		if h.to_lower().substr(0,4) == "set-":
			acc.append(h.substr(4))
	return acc
	
	
func save(username):
	pass
func load(username):
	pass
	
func _ready():
	await login("asd","asd")

	await request(MMS_URL+"user/",HTTPClient.METHOD_GET)
	await await_response()
	
	print(pop_response()["body"].get_string_from_utf8())
	
