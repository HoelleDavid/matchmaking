extends Node


@onready var http = $HTTPRequest
var MMS_URL = "http://127.0.0.1:3000/"
var session_headers = ["Content-Type: application/json"]
var _response = null

#masks $HTTPRequest.request, puts response in _response
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
	
#waits until _response is filled
func await_response(interval = .1):
	while !has_response():
		await get_tree().create_timer(interval).timeout

func has_session():
	return len(session_headers) > 1

#set-headers after a login call, else warn and dont modify session_headers
func login(username,password):
	var body = JSON.stringify({"username":username, "password":password})
	request(MMS_URL+"user/login/",HTTPClient.METHOD_POST,body)
	await await_response()
	var  res = pop_response()
	if res["response_code"] != 200:
		push_warning("request returned response code %s\n%s" % [res["response_code"],res["body"].get_string_from_utf8()])
		pass
	session_headers += _get_set_headers(res["headers"])
	_expire_cookies()
	
func register(username,password):
	var body = JSON.stringify({"username":username, "password":password})
	request(MMS_URL+"user/register/",HTTPClient.METHOD_POST,body)
	await await_response()
	var  res = pop_response()
	if res["response_code"] != 200:
		push_warning("request returned response code %s\n%s" % [res["response_code"],res["body"].get_string_from_utf8()])
		pass

func logout():
	request(MMS_URL+"user/logout/",HTTPClient.METHOD_POST)
	await await_response()
	var  res = pop_response()
	if res["response_code"] != 200:
		push_warning("request returned response code %s\n%s" % [res["response_code"],res["body"].get_string_from_utf8()])
		pass
	session_headers += _get_set_headers(res["headers"])
	print(res["headers"])
	_expire_cookies()
	
#filer headers that start with "set-" then remove that prefix
func _get_set_headers(headers):
	var acc = []
	for h in headers:
		if h.to_lower().substr(0,4) == "set-":
			acc.append(h.substr(4))
	return acc

# delete cookies if expired
func _expire_cookies():
	for h in session_headers:
		if h.to_lower().substr(0,7) == "cookie:":
			if false: #TODO check timestamp against os time
				session_headers.erase(h)
			
#serialize cookie for user
func save(file):
	pass
#load cookie for user
func load(file):
	pass
	
func _ready():
	
	await login("asd","asd")

	#await request(MMS_URL+"user/",HTTPClient.METHOD_GET)
	#await await_response()
	
	await print(session_headers)
	
	await logout()
	await print(session_headers)
	
	#callv("funcId",arr)
