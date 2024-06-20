extends Node
class_name MMSConnection
@onready var _http = $HTTPSession

var mms_url : String = "http://127.0.0.1:3000/"
var _mms_cookie : String = ""
func get_mms_cokie():
	if(_mms_cookie):
		return "mms_cookie="+_mms_cookie
	return _mms_cookie
func set_mms_cookie(mms_cookie):
	_mms_cookie = mms_cookie
func has_user():
	return _mms_cookie != ""
	
func is_awaiting_response():
	return _http.is_awaiting_response()
	
	
func _ready():
	var res = await login("server_0000","server_0000")
	print(res)
	var y = cookie_from_login_response(res)
	print(y)
#========RESPONSE ABSTRACTIONS========================================================
func cookie_from_login_response(res):
	for h in res["headers"]:
		if h.to_lower().substr(0,4) == "set-":
			return h.substr(4)
	
#========MMS API CALLS========================================================
# /USER/
func register(username,password):
	var body = JSON.stringify({"username":username, "password":password})
	var  res = await _http.request_async(mms_url+"user/",HTTPClient.METHOD_PUT,body)
	if res["response_code"] != 201:
		push_warning("register returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
		pass
	print(res["body"])
	return res

func login(username,password):
	var body = JSON.stringify({"username":username, "password":password})
	print(body)
	var res = await _http.request_async(mms_url+"user/login/",HTTPClient.METHOD_POST,body)
	if res["response_code"] != 200:
		push_warning("login returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
		pass
	return res

func logout():
	var res = await _http.request_async(mms_url+"user/logout/",HTTPClient.METHOD_POST)
	if res["response_code"] != 200:
		push_warning("logout returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
		pass
	_http.update_cookie_from_header(res["headers"])
	return res

func userdata():
	var res = await _http.request_async(mms_url+"user/",HTTPClient.METHOD_GET)
	if res["response_code"] != 200:
		push_warning("logout returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
		pass
	_http.update_cookie_from_header(res["headers"])
	return res

func delete_user():
	#var body = JSON.stringify({"username":username, "password":password})
	var res = await _http.request_async(mms_url+"user/",HTTPClient.METHOD_DELETE)
	if res["response_code"] != 200:
		push_warning("delete user returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
		pass
	_http.update_cookie_from_header(res["headers"])
	return res




# /MATCHMAKING/QUEUE/
func look_for_match(queue_id = "1v1-rated"):
	var res = await _http.request_async(mms_url+"matchmaking/queue/"+queue_id,HTTPClient.METHOD_PUT)
	if  res["response_code"] != 201:
		push_warning("look for match returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res

func accept_match():
	var body = JSON.stringify({})
	var res = await _http.request_async(mms_url+"matchmaking/queue/",HTTPClient.METHOD_POST,body)
	if  res["response_code"] != 202:
		push_warning("accept match returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res
	
func leave_queue():
	var res = await _http.request_async(mms_url+"matchmaking/queue/",HTTPClient.METHOD_DELETE)
	if  res["response_code"] != 200:
		push_warning("leave queue returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res
	
func queue_state():
	var res = await _http.request_async(mms_url+"matchmaking/queue/",HTTPClient.METHOD_GET)
	if  res["response_code"] != 201:
		push_warning("look for match returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res
	
	
# /MATCHMAKING/HOST/
func get_match(host_data):
	var body = JSON.stringify(host_data)
	var res = await _http.request_async(mms_url+"matchmaking/host/",HTTPClient.METHOD_PUT,body)
	if  res["response_code"] != 201:
		push_warning("add hosts returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res

func accept_host(hosts):
	var body = JSON.stringify(hosts)
	var res = await _http.request_async(mms_url+"matchmaking/host/",HTTPClient.METHOD_POST,body)
	if  res["response_code"] != 200:
		push_warning("accept found match returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res

func remove_hosts(hosts):
	var body = JSON.stringify(hosts)
	var res = await _http.request_async(mms_url+"matchmaking/host/",HTTPClient.METHOD_DELETE,body)
	if  res["response_code"] != 200:
		push_warning("THING returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res

func poll_hosts():
	var res = await _http.request_async(mms_url+"matchmaking/host/",HTTPClient.METHOD_GET)
	if  res["response_code"] != 200:
		push_warning("THING returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res


func report_hosted_match(matchdata):
	var body = JSON.stringify(matchdata)
	var res = await _http.request_async(mms_url+"matchmaking/history/",HTTPClient.METHOD_PUT,body)
	if  res["response_code"] != 201:
		push_warning("THING returned response code %s:\n%s\n\n" % [res["response_code"],res["body"].get_string_from_utf8()])
	return res

