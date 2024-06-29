extends Node2D

@onready var mms_clients_root = $mms_client_collection

var players = []
var hosts = []


func create_mms_clients():
	for i in range(100):
		var mms_client_instance = preload("res://resource/net/mms_connection/mms_connection.res").instantiate()
		mms_clients_root.add_child(mms_client_instance)
		var users = []
		var username = ("player_%2d" % i).replace(" ","0")
		users.append({
			"username":username,
			"password":username,
			"mms_client": mms_client_instance
		})
		return users
		
		
# USER Function Assertions
func assert_login(user,expect_res_codes = [200]):
	var res = await user["mms_client"].login(user["username"],user["password"])
	assert(res["response_code"] in expect_res_codes)
func assert_register(user,expect_res_codes = [201,423]):
	var res = await user["mms_client"].register(user["username"],user["password"])
	assert(res["response_code"] in expect_res_codes)
func assert_logout(user,expect_res_codes = [200]):
	var res = await user["mms_client"].logout()
	assert(res["response_code"] in expect_res_codes)
func assert_delete_user(user,expect_res_codes = [200]):
	var res = await user["mms_client"].delete_user()
	assert(res["response_code"] in expect_res_codes)




func _process(delta):
	pass
