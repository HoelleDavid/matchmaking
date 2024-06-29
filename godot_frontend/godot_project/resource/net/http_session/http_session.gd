extends Node

@onready var http = $HTTPRequest
const _session_headers = ["Content-Type: application/json"]
func _filled_header(mms_cookie):
	if(mms_cookie in [null,[],""]):
		return _session_headers
	return _session_headers + ["mms_session_cookie: "+mms_cookie]

var _response = null
var _is_processing_response = false
func is_awaiting_response():
	return _is_processing_response

#masks $HTTPRequest.request, puts response in _response
func request_async(url,method,mms_cookie,body=""):
	assert(_response == null)
	http.request_completed.connect(
		func (res_result, res_response_code, res_headers, res_body) : _response={"result":res_result, "response_code":res_response_code, "headers":res_headers, "body":res_body}
	)
	_is_processing_response = true
	http.request(url,_filled_header(mms_cookie),method,body)
	await _await_response()
	var res = _pop_response()
	res["body"] = res["body"].get_string_from_utf8()
	return res
func _has_response():
	return _response != null;
func _pop_response():
	var tmp_res = _response
	_response = null
	_is_processing_response = false
	return tmp_res
	
#waits until _response is filled
func _await_response(interval = .1):
	while !_has_response():
		await get_tree().create_timer(interval).timeout




#filer headers that start with "set-" then remove that prefix
#func _get_set_headers(headers):
#	var acc = []
#	for h in headers:
#		if h.to_lower().substr(0,4) == "set-":
#			acc.append(h.substr(4))
#	return acc

# delete cookies if expired
#func _expire_cookies():
#	for h in session_headers:
#		if h.to_lower().substr(0,7) == "cookie:":
#			if false: #TODO check timestamp against os time
#				session_headers.erase(h)
			
#serialize cookie for user
#func save_headers(path):
#	var file = FileAccess.open(path, FileAccess.WRITE)
##	var text = JSON.stringify(session_headers)
#	print("saving: %s"%text)
##	file.store_line(text)
#	file.close()
	
#load cookie for user
#func load_headers(path):
#	if FileAccess.file_exists(path):
#		var file = FileAccess.open(path, FileAccess.READ)
#		var json = JSON.new()
#		var headers = Array(json.parse_string(file.get_line()))
#		if(len(headers) <= 1):
#			printerr("loaded header too small")
#			return false
#		print("loading: %s" % str(headers))
#		session_headers = headers
#		file.close()
#		return true
#	printerr("path is no file")
#	return false
	

