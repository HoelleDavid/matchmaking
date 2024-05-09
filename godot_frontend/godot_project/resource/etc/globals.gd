extends Node

@onready var client = $client

func on_login(username,password):
	client.login(username,password)

func on_register(username,password):
	client.register(username,password)
