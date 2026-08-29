extends Node

const NurseryPuzzle = preload("res://scripts/nursery_puzzle.gd")

var room_canvas
var player
var interface: Control
var room_title: Label
var room_description: Label
var objective: Label
var memory_label: Label
var stability_bar: ProgressBar
var stability_label: Label
var modal_layer: Control
var current_sequence: Array = []

const ROOM_INFO := [
	["MEMORY I", "The Decaying Nursery", "Antique dolls watch a music box waiting to be remembered.", "Match the crank to the heartbeat."],
	["MEMORY II", "The Library", "Every book is blank. Four loose pages wait beneath the lamp.", "Put the scattered diary in order."],
	["MEMORY III", "The Portrait Hall", "Painted eyes follow a torn family photograph.", "Reassemble the family portrait."],
	["MEMORY IV", "The Study", "A coded letter waits beneath a clock stopped at three.", "Decode the unsent letter."],
	["MEMORY V", "The Basement", "The memory machine shudders beneath the house.", "Restore the final sequence."],
]

func _ready() -> void:
	room_canvas = $Mansion
	player = $Player
	interface = $UI/Interface
	player.interacted.connect(_open_room_puzzle)
	GameState.memory_restored.connect(_on_memory_restored)
	GameState.stability_changed.connect(_update_stability)
	_build_interface()
	_change_room(GameState.current_room)

func _label(text: String, font_size: int, color: Color = Color("ded7c8")) -> Label:
	var label := Label.new()
	label.text = text
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_color_override("font_color", color)
	return label

func _button(text: String) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(145, 44)
	button.add_theme_font_size_override("font_size", 11)
	return button

func _build_interface() -> void:
	var header := ColorRect.new()
	header.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	header.custom_minimum_size.y = 70
	header.offset_bottom = 70
	header.color = Color("0d0d0c")
	interface.add_child(header)
	var brand := _label("H   THE HOUSE THAT FORGOT YOU", 16, Color("c5b58f"))
	brand.position = Vector2(35, 24)
	header.add_child(brand)
	memory_label = _label("MEMORIES  0 / 5", 12, Color("a98d58"))
	memory_label.position = Vector2(1040, 26)
	header.add_child(memory_label)

	var navigation := HBoxContainer.new()
	navigation.position = Vector2(0, 70)
	navigation.size = Vector2(1280, 52)
	navigation.alignment = BoxContainer.ALIGNMENT_CENTER
	interface.add_child(navigation)
	for index in GameState.ROOM_NAMES.size():
		var room_button := _button("0%d  %s" % [index + 1, GameState.ROOM_NAMES[index].to_upper()])
		room_button.pressed.connect(_change_room.bind(index))
		navigation.add_child(room_button)

	var caption := VBoxContainer.new()
	caption.position = Vector2(42, 150)
	caption.size = Vector2(410, 180)
	caption.mouse_filter = Control.MOUSE_FILTER_IGNORE
	interface.add_child(caption)
	var eyebrow := _label("THE HOUSE REMEMBERS", 11, Color("a98d58"))
	caption.add_child(eyebrow)
	room_title = _label("", 48)
	caption.add_child(room_title)
	room_description = _label("", 14, Color("aaa398"))
	room_description.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	room_description.custom_minimum_size = Vector2(380, 60)
	caption.add_child(room_description)

	var objective_panel := VBoxContainer.new()
	objective_panel.position = Vector2(930, 150)
	objective_panel.size = Vector2(310, 100)
	interface.add_child(objective_panel)
	objective_panel.add_child(_label("CURRENT OBJECTIVE", 10, Color("8d877c")))
	objective = _label("", 16, Color("c8bda4"))
	objective.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	objective_panel.add_child(objective)

	stability_bar = ProgressBar.new()
	stability_bar.position = Vector2(945, 270)
	stability_bar.size = Vector2(220, 12)
	stability_bar.max_value = 100
	stability_bar.value = GameState.stability
	stability_bar.show_percentage = false
	interface.add_child(stability_bar)
	stability_label = _label("MEMORY STABILITY  %d%%" % int(GameState.stability), 10, Color("a98d58"))
	stability_label.position = Vector2(945, 292)
	interface.add_child(stability_label)

	var hint := _button("ASK THE HOUSE FOR A HINT")
	hint.position = Vector2(535, 650)
	hint.pressed.connect(_show_hint)
	interface.add_child(hint)
	var crosshair := _label("+", 22, Color(0.78, .71, .58, .75))
	crosshair.position = Vector2(635, 354)
	crosshair.mouse_filter = Control.MOUSE_FILTER_IGNORE
	interface.add_child(crosshair)

	modal_layer = Control.new()
	modal_layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	modal_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	interface.add_child(modal_layer)
	_refresh_status()

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and event.physical_keycode >= KEY_1 and event.physical_keycode <= KEY_5:
		_change_room(event.physical_keycode - KEY_1)

func _change_room(index: int) -> void:
	GameState.current_room = index
	room_canvas.set_room(index)
	player.reset_for_room()
	var info: Array = ROOM_INFO[index]
	room_title.text = info[1]
	room_description.text = info[2]
	objective.text = "Memory restored." if GameState.restored[index] else info[3]
	stability_bar.visible = index == 0
	stability_label.visible = index == 0

func _refresh_status() -> void:
	memory_label.text = "MEMORIES  %d / 5" % GameState.memory_count()

func _open_room_puzzle(index: int) -> void:
	if GameState.restored[index] and index != 4:
		_show_message("MEMORY RESTORED", "This room has given back everything it remembers.")
		return
	match index:
		0: _open_nursery()
		1: _open_order_puzzle("THE SCATTERED DIARY", ["STORM", "PICNIC", "BIRTHDAY", "LETTER"], 1)
		2: _open_order_puzzle("THE TORN PORTRAIT", ["MOTHER", "SIBLING", "YOU", "FATHER"], 2)
		3: _open_cipher()
		4: _open_order_puzzle("THE MEMORY MACHINE", ["MELODY", "DIARY", "PORTRAIT", "LETTER"], 4)

func _modal_base(title: String) -> VBoxContainer:
	_clear_modal()
	modal_layer.mouse_filter = Control.MOUSE_FILTER_STOP
	player.set_controls_enabled(false)
	var shade := ColorRect.new()
	shade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	shade.color = Color(0.02, .02, .018, .93)
	modal_layer.add_child(shade)
	var panel := VBoxContainer.new()
	panel.position = Vector2(300, 110)
	panel.size = Vector2(680, 500)
	panel.alignment = BoxContainer.ALIGNMENT_CENTER
	modal_layer.add_child(panel)
	panel.add_child(_label(title, 32, Color("c7b78d")))
	return panel

func _add_close(panel: VBoxContainer) -> void:
	var close := _button("RETURN TO THE ROOM")
	close.pressed.connect(_clear_modal)
	panel.add_child(close)

func _clear_modal() -> void:
	for child in modal_layer.get_children():
		child.queue_free()
	modal_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	room_canvas.set_dolls_close(false)
	player.set_controls_enabled(true)

func _open_nursery() -> void:
	_clear_modal()
	modal_layer.mouse_filter = Control.MOUSE_FILTER_STOP
	player.set_controls_enabled(false)
	var puzzle := NurseryPuzzle.new()
	puzzle.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	puzzle.stability = GameState.stability
	puzzle.stability_changed.connect(GameState.set_stability)
	puzzle.dolls_threatened.connect(room_canvas.set_dolls_close)
	puzzle.solved.connect(_solve_nursery)
	modal_layer.add_child(puzzle)
	var close := _button("RETURN TO THE ROOM")
	close.position = Vector2(1040, 640)
	close.pressed.connect(_clear_modal)
	modal_layer.add_child(close)

func _solve_nursery() -> void:
	GameState.restore_memory(0)
	_clear_modal()
	_show_message("MEMORY I RESTORED", "The lullaby ends. A little voice says: ‘You promised you wouldn’t leave me alone.’")

func _open_order_puzzle(title: String, correct: Array, memory_index: int) -> void:
	var panel := _modal_base(title)
	panel.add_child(_label("Choose the pieces in their true order.", 15, Color("989083")))
	current_sequence.clear()
	var buttons := HBoxContainer.new()
	buttons.alignment = BoxContainer.ALIGNMENT_CENTER
	panel.add_child(buttons)
	var shuffled := correct.duplicate()
	shuffled.shuffle()
	for word in shuffled:
		var choice := _button(word)
		choice.pressed.connect(_choose_sequence.bind(word, choice, correct, memory_index, panel))
		buttons.add_child(choice)
	var progress := _label("—  —  —  —", 18, Color("a98d58"))
	progress.name = "Progress"
	panel.add_child(progress)
	_add_close(panel)

func _choose_sequence(word: String, choice: Button, correct: Array, memory_index: int, panel: VBoxContainer) -> void:
	current_sequence.append(word)
	choice.disabled = true
	var progress := panel.get_node("Progress") as Label
	progress.text = "  →  ".join(PackedStringArray(current_sequence))
	if current_sequence.size() < correct.size():
		return
	if current_sequence == correct:
		GameState.restore_memory(memory_index)
		_clear_modal()
		if memory_index == 4:
			_show_message("THE HOUSE REMEMBERS", "The front door opens to morning. You did not leave them—you came back.")
		else:
			_show_message("MEMORY %s RESTORED" % ["II", "III"][memory_index - 1], "Another missing piece settles into place.")
	else:
		progress.text = "The memory rejects that order. Try again."
		await get_tree().create_timer(1.0).timeout
		_open_order_puzzle(panel.get_child(0).text, correct, memory_index)

func _open_cipher() -> void:
	var panel := _modal_base("THE UNSENT LETTER")
	panel.add_child(_label("Shift UHPHPEHU backward three letters.", 17, Color("aaa398")))
	var answer := LineEdit.new()
	answer.placeholder_text = "_ _ _ _ _ _ _ _"
	answer.custom_minimum_size = Vector2(340, 52)
	answer.alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(answer)
	var submit := _button("UNSEAL THE LETTER")
	panel.add_child(submit)
	var feedback := _label("The clock has stopped at three.", 13, Color("8d877c"))
	panel.add_child(feedback)
	submit.pressed.connect(func() -> void:
		if answer.text.strip_edges().to_upper() == "REMEMBER":
			GameState.restore_memory(3)
			_clear_modal()
			_show_message("MEMORY IV RESTORED", "The letter opens: ‘It was never your fault.’")
		else:
			feedback.text = "The seal holds. Move every letter three places back."
	)
	_add_close(panel)

func _show_message(title: String, body: String) -> void:
	var panel := _modal_base(title)
	var message := _label(body, 17, Color("aaa398"))
	message.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	message.custom_minimum_size = Vector2(560, 100)
	message.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	panel.add_child(message)
	_add_close(panel)

func _show_hint() -> void:
	var hints := [
		"Turn clockwise and keep RPM within 13 of the heartbeat for six seconds.",
		"The storm came first. The picnic was the next morning.",
		"Mother is left, Father right, and your older sibling stands beside Mother.",
		"Shift each coded letter three places backward.",
		"Follow the rooms: melody, diary, portrait, letter."
	]
	_show_message("THE HOUSE WHISPERS", hints[GameState.current_room])

func _on_memory_restored(_index: int) -> void:
	_refresh_status()
	objective.text = "Memory restored."

func _update_stability(value: float) -> void:
	stability_bar.value = value
	stability_label.text = "MEMORY STABILITY  %d%%" % int(value)
