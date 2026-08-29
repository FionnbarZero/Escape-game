extends CharacterBody3D

signal interacted(room_index: int)

@export var move_speed := 3.2
@export var mouse_sensitivity := 0.0022
var input_enabled := true
var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity")
@onready var head: Node3D = $Head
@onready var camera: Camera3D = $Head/Camera3D

func _ready() -> void:
	var capsule := CapsuleShape3D.new()
	capsule.radius = .32
	capsule.height = 1.7
	$Collider.shape = capsule
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

func _unhandled_input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_cancel"):
		Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if Input.mouse_mode == Input.MOUSE_MODE_CAPTURED else Input.MOUSE_MODE_CAPTURED
	if not input_enabled:
		return
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		rotate_y(-event.relative.x * mouse_sensitivity)
		head.rotation.x = clampf(head.rotation.x - event.relative.y * mouse_sensitivity, -1.35, 1.35)
	if (event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed) or (event is InputEventKey and event.pressed and event.physical_keycode == KEY_E):
		_try_interact()

func _physics_process(delta: float) -> void:
	if not is_on_floor(): velocity.y -= gravity * delta
	else: velocity.y = 0.0
	var input := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down") if input_enabled else Vector2.ZERO
	if input_enabled:
		if Input.is_key_pressed(KEY_A): input.x -= 1.0
		if Input.is_key_pressed(KEY_D): input.x += 1.0
		if Input.is_key_pressed(KEY_W): input.y -= 1.0
		if Input.is_key_pressed(KEY_S): input.y += 1.0
		input = input.limit_length()
	var direction := (transform.basis * Vector3(input.x, 0, input.y)).normalized()
	velocity.x = move_toward(velocity.x, direction.x * move_speed, move_speed)
	velocity.z = move_toward(velocity.z, direction.z * move_speed, move_speed)
	move_and_slide()

func _try_interact() -> void:
	var center := get_viewport().get_visible_rect().size / 2.0
	var origin := camera.project_ray_origin(center)
	var query := PhysicsRayQueryParameters3D.create(origin, origin + camera.project_ray_normal(center) * 4.5)
	query.collide_with_areas = true
	var result := get_world_3d().direct_space_state.intersect_ray(query)
	if not result.is_empty() and result.collider.has_meta("room_index"):
		interacted.emit(int(result.collider.get_meta("room_index")))

func reset_for_room() -> void:
	position = Vector3(0, 1.7, 5.5)
	rotation = Vector3.ZERO
	head.rotation = Vector3.ZERO
	velocity = Vector3.ZERO

func set_controls_enabled(value: bool) -> void:
	input_enabled = value
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED if value else Input.MOUSE_MODE_VISIBLE
