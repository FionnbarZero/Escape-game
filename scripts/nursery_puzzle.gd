extends Control

signal solved
signal stability_changed(value: float)
signal dolls_threatened(value: bool)

var target_bpm := 72.0
var crank_rpm := 0.0
var stability := 100.0
var match_time := 0.0
var beat_elapsed := 0.0
var beat_count := 0
var dragging := false
var started := false
var last_angle := 0.0
var last_motion_time := 0
var arm_angle := 0.0
var heart_scale := 1.0
var audio_player: AudioStreamPlayer
var generator_playback: AudioStreamGeneratorPlayback

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	set_process(true)
	_setup_audio()
	queue_redraw()

func _setup_audio() -> void:
	audio_player = AudioStreamPlayer.new()
	var generator := AudioStreamGenerator.new()
	generator.mix_rate = 22050.0
	generator.buffer_length = .35
	audio_player.stream = generator
	add_child(audio_player)
	audio_player.play()
	generator_playback = audio_player.get_stream_playback()

func _process(delta: float) -> void:
	beat_elapsed += delta
	heart_scale = lerpf(heart_scale, 1.0, delta * 9.0)
	if beat_elapsed >= 60.0 / target_bpm:
		beat_elapsed = 0.0
		beat_count += 1
		heart_scale = 1.45
		_generate_heartbeat()
		if beat_count % 4 == 0:
			var choices := [62.0, 72.0, 84.0, 96.0, 76.0]
			target_bpm = choices.pick_random()
	crank_rpm *= pow(.38, delta)
	if started:
		_evaluate_speed(delta)
	queue_redraw()

func _evaluate_speed(delta: float) -> void:
	var difference := crank_rpm - target_bpm
	if absf(difference) <= 13.0:
		match_time += delta
		stability = minf(100.0, stability + delta)
		dolls_threatened.emit(false)
	elif difference > 13.0:
		match_time = maxf(0.0, match_time - delta * 1.4)
		dolls_threatened.emit(true)
	else:
		match_time = maxf(0.0, match_time - delta)
		stability = maxf(0.0, stability - delta * 4.5)
		dolls_threatened.emit(false)
	stability_changed.emit(stability)
	if stability <= 0.0:
		stability = 55.0
		started = false
		match_time = 0.0
		stability_changed.emit(stability)
	if match_time >= 6.0:
		set_process(false)
		solved.emit()

func _gui_input(event: InputEvent) -> void:
	var center := Vector2(size.x * .42, size.y * .58)
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		dragging = event.pressed and event.position.distance_to(center) < 125.0
		if dragging:
			last_angle = center.angle_to_point(event.position)
			last_motion_time = Time.get_ticks_msec()
			accept_event()
	elif event is InputEventMouseMotion and dragging:
		var angle := center.angle_to_point(event.position)
		var difference := wrapf(angle - last_angle, -PI, PI)
		var now := Time.get_ticks_msec()
		var elapsed := maxf(.016, float(now - last_motion_time) / 1000.0)
		if difference > 0.0:
			var instant_rpm := minf(150.0, difference / TAU * 60.0 / elapsed)
			crank_rpm = lerpf(crank_rpm, instant_rpm, .35)
			started = true
		arm_angle = angle + PI / 2.0
		last_angle = angle
		last_motion_time = now
		accept_event()

func _generate_heartbeat() -> void:
	if generator_playback == null:
		return
	var sample_rate := 22050.0
	for index in int(sample_rate * .16):
		var time := float(index) / sample_rate
		var first := sin(TAU * 58.0 * time) * exp(-time * 28.0)
		var shifted := maxf(0.0, time - .085)
		var second := sin(TAU * 47.0 * shifted) * exp(-shifted * 35.0) if time > .085 else 0.0
		var sample := (first * .22) + (second * .12)
		generator_playback.push_frame(Vector2(sample, sample))

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("12110f"))
	var font := ThemeDB.fallback_font
	draw_string(font, Vector2(48, 55), "THE MUSIC BOX", HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color("a98d58"))
	draw_string(font, Vector2(48, 100), "Match the crank to the heart", HORIZONTAL_ALIGNMENT_LEFT, -1, 30, Color("ded7c8"))
	draw_string(font, Vector2(48, 132), "Turn clockwise. Hold the rhythm for six seconds.", HORIZONTAL_ALIGNMENT_LEFT, -1, 14, Color("817b70"))
	var center := Vector2(size.x * .42, size.y * .58)
	draw_circle(center, 115, Color("4e4433"))
	draw_circle(center, 108, Color("171612"))
	draw_circle(center, 38, Color("393124"))
	var arm_end := center + Vector2.UP.rotated(arm_angle) * 82.0
	draw_line(center, arm_end, Color("aa8c57"), 8)
	draw_circle(arm_end, 15, Color("b69a62"))
	draw_string(font, center + Vector2(-38, 6), "DRAG", HORIZONTAL_ALIGNMENT_CENTER, 76, 12, Color("756d5e"))
	var heart_center := Vector2(size.x * .77, size.y * .4)
	draw_string(font, heart_center + Vector2(-18, 12) * heart_scale, "♥", HORIZONTAL_ALIGNMENT_LEFT, -1, int(40 * heart_scale), Color("8b4038"))
	draw_string(font, heart_center + Vector2(-50, 65), "%d BPM" % int(target_bpm), HORIZONTAL_ALIGNMENT_CENTER, 100, 20, Color("c1ad84"))
	draw_string(font, heart_center + Vector2(-50, 125), "%d RPM" % int(crank_rpm), HORIZONTAL_ALIGNMENT_CENTER, 100, 20, Color("c1ad84"))
	draw_rect(Rect2(size.x * .64, size.y * .72, size.x * .25, 5), Color("332e27"))
	draw_rect(Rect2(size.x * .64, size.y * .72, size.x * .25 * minf(1.0, match_time / 6.0), 5), Color("a58a55"))
	var status := "LISTEN, THEN BEGIN"
	if started and crank_rpm > target_bpm + 13: status = "TOO FAST — THEY ARE MOVING"
	elif started and crank_rpm < target_bpm - 13: status = "TOO SLOW — MEMORY IS FADING"
	elif started: status = "THE RHYTHMS ARE ALIGNING"
	draw_string(font, Vector2(size.x * .64, size.y * .82), status, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color("a99a7a"))
