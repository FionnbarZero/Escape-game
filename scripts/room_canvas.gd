extends Control

signal object_clicked(room_index: int)
signal threat_changed(is_close: bool)

var room_index := 0
var dolls_close := false
var mouse_position := Vector2.ZERO
var pulse := 0.0

func _ready() -> void:
	set_process(true)
	queue_redraw()

func set_room(index: int) -> void:
	room_index = index
	dolls_close = false
	queue_redraw()

func set_dolls_close(value: bool) -> void:
	if dolls_close == value:
		return
	dolls_close = value
	threat_changed.emit(value)
	queue_redraw()

func _process(delta: float) -> void:
	mouse_position = get_local_mouse_position()
	pulse += delta
	queue_redraw()

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		var hotspot := _hotspot_for_room()
		if hotspot.has_point(event.position):
			object_clicked.emit(room_index)

func _hotspot_for_room() -> Rect2:
	match room_index:
		0: return Rect2(180, 315, 170, 140)
		1: return Rect2(525, 320, 230, 145)
		2: return Rect2(535, 325, 210, 160)
		3: return Rect2(525, 320, 230, 155)
		_: return Rect2(510, 170, 260, 270)

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("11110f"))
	match room_index:
		0: _draw_nursery()
		1: _draw_library()
		2: _draw_portrait_hall()
		3: _draw_study()
		4: _draw_basement()

func _draw_wall_floor(wall: Color, floor: Color) -> void:
	draw_rect(Rect2(0, 0, size.x, size.y * .72), wall)
	draw_rect(Rect2(0, size.y * .72, size.x, size.y * .28), floor)
	for x in range(0, int(size.x), 180):
		draw_line(Vector2(x, 0), Vector2(x + 30, size.y * .72), Color(1, 1, 1, .025), 1)

func _draw_window(center: Vector2, window_size: Vector2) -> void:
	var rect := Rect2(center - window_size / 2.0, window_size)
	draw_rect(rect.grow(10), Color("11120f"))
	draw_rect(rect, Color("4b5048"))
	draw_line(Vector2(center.x, rect.position.y), Vector2(center.x, rect.end.y), Color("171914"), 8)
	draw_line(Vector2(rect.position.x, center.y), Vector2(rect.end.x, center.y), Color("171914"), 8)
	draw_circle(center - Vector2(22, 46), 31, Color(0.72, .74, .65, .23))

func _draw_nursery() -> void:
	_draw_wall_floor(Color("20211d"), Color("0d0d0b"))
	_draw_window(Vector2(size.x * .5, 155), Vector2(170, 245))
	draw_rect(Rect2(95, 365, 300, 105), Color("2d261d"))
	draw_rect(Rect2(185, 325, 125, 62), Color("806b46"), false, 4)
	draw_circle(Vector2(247, 310), 17, Color("aa9465"))
	_draw_doll(Vector2(465, 365) + (Vector2(70, -30) if dolls_close else Vector2.ZERO), 1.0)
	_draw_doll(Vector2(900, 345) + (Vector2(-90, -25) if dolls_close else Vector2.ZERO), .9)
	_draw_doll(Vector2(1080, 380) + (Vector2(-120, -40) if dolls_close else Vector2.ZERO), 1.15)
	_draw_hotspot_label(Vector2(247, 302), "TURN THE MUSIC BOX")

func _draw_doll(position: Vector2, scale_value: float) -> void:
	var head_radius := 26.0 * scale_value
	draw_colored_polygon(PackedVector2Array([
		position + Vector2(-28, 35) * scale_value, position + Vector2(28, 35) * scale_value,
		position + Vector2(42, 105) * scale_value, position + Vector2(-42, 105) * scale_value
	]), Color("55483f"))
	draw_circle(position, head_radius, Color("aaa08a"))
	for side in [-1.0, 1.0]:
		var eye := position + Vector2(10 * side, -4) * scale_value
		draw_circle(eye, 6 * scale_value, Color("d2c9b1"))
		var direction := (mouse_position - eye).normalized() * 2.8 * scale_value
		draw_circle(eye + direction, 2.6 * scale_value, Color("121210"))

func _draw_library() -> void:
	_draw_wall_floor(Color("191916"), Color("0c0b09"))
	_draw_window(Vector2(size.x * .5, 135), Vector2(145, 215))
	for side in [90, 850]:
		draw_rect(Rect2(side, 25, 340, 410), Color("2b2117"))
		for y in range(85, 420, 82): draw_line(Vector2(side, y), Vector2(side + 340, y), Color("705232"), 9)
	draw_rect(Rect2(470, 360, 340, 115), Color("4a321e"))
	for index in 4: draw_rect(Rect2(540 + index * 42, 340 + sin(index) * 8, 75, 50), Color("b1a27e"))
	_draw_hotspot_label(Vector2(640, 335), "READ THE SCATTERED DIARY")

func _draw_portrait_hall() -> void:
	_draw_wall_floor(Color("27221c"), Color("0d0c0a"))
	for index in 5:
		var frame := Rect2(95 + index * 225, 70 + (35 if index % 2 else 0), 145, 245)
		draw_rect(frame, Color("6b5130"))
		draw_rect(frame.grow(-10), Color("292722"))
		draw_circle(frame.position + Vector2(72, 75), 27, Color("77705f") if index != 2 else Color("171713"))
	draw_rect(Rect2(555, 360, 170, 110), Color("b2a37f"), false, 5)
	_draw_hotspot_label(Vector2(640, 345), "REASSEMBLE THE PORTRAIT")

func _draw_study() -> void:
	_draw_wall_floor(Color("191916"), Color("0c0b09"))
	draw_rect(Rect2(75, 25, 1130, 290), Color("2b2117"))
	for y in range(85, 310, 70): draw_line(Vector2(75, y), Vector2(1205, y), Color("64492c"), 8)
	draw_circle(Vector2(640, 120), 68, Color("6b5130"))
	draw_circle(Vector2(640, 120), 55, Color("aaa082"))
	draw_string(ThemeDB.fallback_font, Vector2(627, 132), "III", HORIZONTAL_ALIGNMENT_LEFT, -1, 25, Color("29251e"))
	draw_rect(Rect2(450, 360, 380, 120), Color("4a301c"))
	draw_string(ThemeDB.fallback_font, Vector2(604, 405), "✉", HORIZONTAL_ALIGNMENT_LEFT, -1, 55, Color("b99e6b"))
	_draw_hotspot_label(Vector2(640, 345), "DECODE THE LETTER")

func _draw_basement() -> void:
	_draw_wall_floor(Color("11120f"), Color("090908"))
	for x in [120, 1090]: draw_line(Vector2(x, 0), Vector2(x, 510), Color("48463e"), 20)
	var center := Vector2(640, 255)
	draw_circle(center, 180, Color("453e31"))
	draw_circle(center, 145, Color("171814"))
	draw_circle(center, 83 + sin(pulse * 2.0) * 4, Color(0.61, .46, .25, .35))
	draw_circle(center, 42, Color("ad8c51"))
	_draw_hotspot_label(Vector2(640, 110), "ACTIVATE THE MEMORY MACHINE")

func _draw_hotspot_label(position: Vector2, text: String) -> void:
	if position.distance_to(mouse_position) > 140:
		return
	draw_string(ThemeDB.fallback_font, position, text, HORIZONTAL_ALIGNMENT_CENTER, 0, 11, Color("c0ae84"))
