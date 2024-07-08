extends Node
class_name MMSConnection
@onready var _http = $http_session

var mms_url : String = "http://127.0.0.1:3000"
var _mms_cookie : String = ""
func get_mms_cokie():
	if(_mms_cookie):
		return "mms_cookie="+_mms_cookie
	return _mms_cookie
func set_mms_cookie(mms_cookie):
	if(mms_cookie):
		_mms_cookie = mms_cookie
func has_user():
	return _mms_cookie not in [null,[],""]
	
func is_awaiting_response():
	return _http.is_awaiting_response()
	

#========RESPONSE ABSTRACTIONS========================================================
func _cookie_from_login_response(res):
	for h in res["headers"]:
		if h.to_lower().substr(0,30) == "set-cookie: mm_session_cookie=":
			return h.substr(4)



#========MMS API CALLS========================================================
# provides all HTTP request async functions according to spec
#return responses as a dict with keys : result,response_code,headers,body
#USER MANAGEMENT
func register(username,password):
	var body = JSON.stringify({"username":username, "password":password})
	var  res = await _http.request_async(
		"%s/user/"%[mms_url],
		HTTPClient.METHOD_PUT,
		null,
		body
	)
	if res["response_code"] != 201:
		push_warning("REGISTER returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res

func login(username,password):
	var body = JSON.stringify({"username":username, "password":password})
	var res = await _http.request_async(
		"%s/user/login/"%[mms_url],
		HTTPClient.METHOD_POST,
		_mms_cookie,
		body
	)
	if res["response_code"] != 200:
		push_warning("login returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
		return res
	var c = _cookie_from_login_response(res)
	if(c):
		set_mms_cookie(c)
	return res


func get_user():
	var res = await _http.request_async(
		"%s/user/"%[mms_url],
		HTTPClient.METHOD_GET,
		_mms_cookie
	)
	if res["response_code"] != 200:
		push_warning("logout returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
		return res
	_http.update_cookie_from_header(res["headers"])
	return res

func logout():
	var res = await _http.request_async(
		"%s/user/logout/"%[mms_url],
		HTTPClient.METHOD_POST,
		_mms_cookie
	)
	if res["response_code"] != 200:
		push_warning("logout returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
		pass
	set_mms_cookie("")
	return res


func delete_user():#(username,password):
	#var body = JSON.stringify({"username":username, "password":password})
	var res = await _http.request_async(
		"%s/user/"%[mms_url],
		HTTPClient.METHOD_DELETE,
		_mms_cookie
	)#,body)
	if res["response_code"] != 200:
		push_warning("delete user returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
		set_mms_cookie("")	
	return res


#MATCHMAKING
func join_queue(queue_id):
	var res = await _http.request_async(
		"%s/matchmaking/queue/%s"%[mms_url,queue_id],
		HTTPClient.METHOD_PUT,
		_mms_cookie
	)
	if  res["response_code"] not in [201,409]:
		push_warning("join queue returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res

func get_queue():
	var res = await _http.request_async(
		"%s/matchmaking/queue/"%[mms_url],
		HTTPClient.METHOD_GET,
		_mms_cookie
	)
	if  res["response_code"] != 200:
		push_warning("get queue returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res

func leave_queue():
	var res = await _http.request_async(
		"%s/matchmaking/queue/"%[mms_url],
		HTTPClient.METHOD_DELETE,
		_mms_cookie
	)
	if  res["response_code"] != 200:
		push_warning("leave queue returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res
	
func accept_match(match_id):
	var res = await _http.request_async(
		"%s/matchmaking/match/%s"%[mms_url,str(match_id)],
		HTTPClient.METHOD_PUT,
		_mms_cookie
	)
	if  res["response_code"] != 202:
		push_warning("accept match returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res

	
func get_match(match_id):
	var res = await _http.request_async(
		"%s/matchmaking/match/%s"%[mms_url,str(match_id)],
		HTTPClient.METHOD_GET,
		_mms_cookie
	)
	if  res["response_code"] != 200:
		push_warning("add hosts returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res

func add_match(host_data,queue_id="1v1-rated"):
	var body = JSON.stringify(host_data)
	var res = await _http.request_async(
		"%s/matchmaking/match/%s"%[mms_url,queue_id],
		HTTPClient.METHOD_POST,
		_mms_cookie,
		body
	)
	if  res["response_code"] != 201:
		push_warning("add hosts returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res


func get_host():
	var res = await _http.request_async(
		"%s/matchmaking/host/"%[mms_url],
		HTTPClient.METHOD_POST,
		_mms_cookie
	)
	if  res["response_code"] != 200:
		push_warning("accept found match returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res

func finalize_match(match_id,result):
	var body = JSON.stringify(result)
	var res = await _http.request_async(
		"%s/matchmaking/match/%s"%[mms_url,str(match_id)],
		HTTPClient.METHOD_DELETE,
		_mms_cookie,
		body
	)
	if  res["response_code"] != 200:
		push_warning("THING returned response code %s:\n%s\n\n" % [res["response_code"],res["body"]])
	return res

