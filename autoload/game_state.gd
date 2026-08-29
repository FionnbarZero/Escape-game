extends Node

signal memory_restored(index: int)
signal stability_changed(value: float)

const SAVE_PATH := "user://house_save.cfg"
const ROOM_NAMES := ["Nursery", "Library", "Portrait Hall", "Study", "Basement"]

var restored: Array[bool] = [false, false, false, false, false]
var stability := 100.0
var current_room := 0

func _ready() -> void:
	load_game()

func restore_memory(index: int) -> void:
	if index < 0 or index >= restored.size() or restored[index]:
		return
	restored[index] = true
	memory_restored.emit(index)
	save_game()

func set_stability(value: float) -> void:
	stability = clampf(value, 0.0, 100.0)
	stability_changed.emit(stability)

func memory_count() -> int:
	return restored.count(true)

func save_game() -> void:
	var config := ConfigFile.new()
	config.set_value("progress", "restored", restored)
	config.set_value("progress", "stability", stability)
	config.save(SAVE_PATH)

func load_game() -> void:
	var config := ConfigFile.new()
	if config.load(SAVE_PATH) != OK:
		return
	var saved: Array = config.get_value("progress", "restored", restored)
	for index in mini(saved.size(), restored.size()):
		restored[index] = bool(saved[index])
	stability = float(config.get_value("progress", "stability", 100.0))

func reset_game() -> void:
	restored = [false, false, false, false, false]
	stability = 100.0
	current_room = 0
	var absolute_path := ProjectSettings.globalize_path(SAVE_PATH)
	if FileAccess.file_exists(SAVE_PATH):
		DirAccess.remove_absolute(absolute_path)
