extends Control

const TIMEOUT_MS = 3000
const FADE_OUT_MS = 500

func _fade_out():
	await get_tree().create_timer(FADE_OUT_MS/1000).timeout.connect(queue_free)

func _ready():
	await get_tree().create_timer(TIMEOUT_MS/1000).timeout.connect(_fade_out)

