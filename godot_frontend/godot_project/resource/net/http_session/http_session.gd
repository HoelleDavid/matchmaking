extends Node

@onready var http = $HTTPRequest
const _session_headers = ["Content-Type: application/json"]
func _filled_header(mms_cookie):
	if(mms_cookie in [null,[],""]):
		return _session_headers
	return _session_headers + [mms_cookie]

var _response = null
var _is_processing_response = false
func is_awaiting_response():
	return _is_processing_response

#masks $HTTPRequest.request, puts response in _response
func request_async(url,method,mms_cookie=null,body=""):
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
func _await_response(interval = 1):
	while !_has_response():
		await get_tree().create_timer(interval).timeout

