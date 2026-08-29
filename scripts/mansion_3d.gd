extends Node3D

var room_index := 0
var room_root: Node3D
var dolls: Array[Node3D] = []
var doll_origins: Array[Vector3] = []
var dolls_close := false
@onready var player: Node3D = get_parent().get_node("Player")

const WALL := Color("292824")
const WOOD := Color("38291d")
const DARK_WOOD := Color("1c1510")
const BRASS := Color("9d7c43")
const PAPER := Color("aa9d7d")

func _ready() -> void: build_room(0)
func set_room(index: int) -> void:
	room_index = index
	build_room(index)
func set_dolls_close(value: bool) -> void: dolls_close = value

func build_room(index: int) -> void:
	if room_root: room_root.queue_free()
	room_root = Node3D.new()
	add_child(room_root)
	dolls.clear(); doll_origins.clear()
	_build_shell()
	match index:
		0: _build_nursery()
		1: _build_library()
		2: _build_portraits()
		3: _build_study()
		4: _build_basement()

func _process(delta: float) -> void:
	for index in dolls.size():
		var doll := dolls[index]
		if not is_instance_valid(doll): continue
		var target := doll_origins[index]
		if dolls_close: target += (player.global_position - doll.global_position).normalized() * 1.6
		doll.position = doll.position.lerp(target, delta * 3.5)
		var head := doll.get_node_or_null("Head") as Node3D
		if head: head.look_at(player.global_position, Vector3.UP)

func _material(color: Color, emission := Color.BLACK) -> StandardMaterial3D:
	var material := StandardMaterial3D.new()
	material.albedo_color = color; material.roughness = .82
	if emission != Color.BLACK:
		material.emission_enabled = true; material.emission = emission; material.emission_energy_multiplier = 2.0
	return material

func _box(name: String, position: Vector3, dimensions: Vector3, color: Color, collision := false) -> MeshInstance3D:
	var instance := MeshInstance3D.new(); instance.name = name
	var mesh := BoxMesh.new(); mesh.size = dimensions; mesh.material = _material(color)
	instance.mesh = mesh; instance.position = position; room_root.add_child(instance)
	if collision: instance.create_trimesh_collision()
	return instance

func _sphere(name: String, position: Vector3, radius: float, color: Color, parent: Node = null) -> MeshInstance3D:
	var instance := MeshInstance3D.new(); instance.name = name
	var mesh := SphereMesh.new(); mesh.radius = radius; mesh.height = radius * 2; mesh.radial_segments = 18; mesh.rings = 10; mesh.material = _material(color)
	instance.mesh = mesh; instance.position = position
	var target_parent: Node = parent if parent != null else room_root
	target_parent.add_child(instance)
	return instance

func _cylinder(name: String, position: Vector3, radius: float, height: float, color: Color) -> MeshInstance3D:
	var instance := MeshInstance3D.new(); instance.name = name
	var mesh := CylinderMesh.new(); mesh.top_radius = radius; mesh.bottom_radius = radius; mesh.height = height; mesh.material = _material(color)
	instance.mesh = mesh; instance.position = position; room_root.add_child(instance)
	return instance

func _light(position: Vector3, color: Color, energy: float, range_value: float) -> void:
	var light := OmniLight3D.new(); light.position = position; light.light_color = color; light.light_energy = energy; light.omni_range = range_value; light.shadow_enabled = true; room_root.add_child(light)

func _interactive(position: Vector3, dimensions: Vector3) -> void:
	var area := Area3D.new(); area.position = position; area.set_meta("room_index", room_index)
	var shape := CollisionShape3D.new(); var box_shape := BoxShape3D.new(); box_shape.size = dimensions; shape.shape = box_shape
	area.add_child(shape); room_root.add_child(area)

func _build_shell() -> void:
	_box("Floor", Vector3(0, -.15, 0), Vector3(14, .3, 14), WOOD, true)
	_box("Ceiling", Vector3(0, 4.1, 0), Vector3(14, .25, 14), Color("090908"))
	_box("BackWall", Vector3(0, 2, -7), Vector3(14, 4, .3), WALL, true)
	_box("LeftWall", Vector3(-7, 2, 0), Vector3(.3, 4, 14), WALL, true)
	_box("RightWall", Vector3(7, 2, 0), Vector3(.3, 4, 14), WALL, true)
	_box("FrontLeft", Vector3(-4.5, 2, 7), Vector3(5, 4, .3), WALL, true)
	_box("FrontRight", Vector3(4.5, 2, 7), Vector3(5, 4, .3), WALL, true)

func _build_nursery() -> void:
	_box("Window", Vector3(0, 2.45, -6.78), Vector3(2.5, 2.6, .08), Color("89908a"))
	_box("WindowV", Vector3(0, 2.45, -6.65), Vector3(.12, 2.7, .12), Color("090908")); _box("WindowH", Vector3(0, 2.45, -6.65), Vector3(2.6, .12, .12), Color("090908"))
	_box("Dresser", Vector3(-3.8, .75, -4.3), Vector3(2.4, 1.5, 1.1), DARK_WOOD, true)
	_box("MusicBox", Vector3(-3.8, 1.65, -4.3), Vector3(1.1, .35, .7), BRASS); _interactive(Vector3(-3.8, 1.65, -4.3), Vector3(1.5, 1, 1.2))
	_box("Crib", Vector3(4.2, .7, -4.8), Vector3(3, 1.4, 1.7), DARK_WOOD, true)
	_build_doll(Vector3(-1.9, 0, -4.8), 1.0); _build_doll(Vector3(2.3, 0, -5.3), .85); _build_doll(Vector3(5.1, 0, -2.5), 1.1)
	_light(Vector3(-1, 2.8, -3), Color("767b71"), 2.2, 7)

func _build_doll(position: Vector3, scale_value: float) -> void:
	var doll := Node3D.new(); doll.position = position; doll.scale = Vector3.ONE * scale_value; room_root.add_child(doll)
	var body_mesh := BoxMesh.new(); body_mesh.size = Vector3(.5, .7, .3); body_mesh.material = _material(Color("544943"))
	var body := MeshInstance3D.new(); body.mesh = body_mesh; body.position = Vector3(0, .45, 0); doll.add_child(body)
	var head := Node3D.new(); head.name = "Head"; head.position = Vector3(0, 1.05, 0); doll.add_child(head)
	_sphere("Face", Vector3.ZERO, .3, Color("aaa08a"), head)
	for x in [-.11, .11]:
		_sphere("Eye", Vector3(x, .04, -.27), .055, Color("d8cfb9"), head)
		_sphere("Pupil", Vector3(x, .04, -.322), .025, Color("090908"), head)
	dolls.append(doll); doll_origins.append(position)

func _build_library() -> void:
	for side in [-1, 1]:
		_box("Bookcase", Vector3(4.7 * side, 1.8, -5.7), Vector3(3.5, 3.6, .65), DARK_WOOD, true)
		for shelf in 4: _box("Shelf", Vector3(4.7 * side, .55 + shelf * .85, -5.3), Vector3(3.2, .12, .6), BRASS)
	_box("Desk", Vector3(0, .7, -3.5), Vector3(4, 1.4, 1.8), WOOD, true)
	for index in 4: _box("DiaryPage", Vector3(-.75 + index * .5, 1.43, -3.5), Vector3(.42, .025, .55), PAPER)
	_interactive(Vector3(0, 1.55, -3.5), Vector3(3.2, .8, 1.7)); _light(Vector3(0, 2.5, -3.2), Color("d39b50"), 3, 6)

func _build_portraits() -> void:
	for index in 5:
		var x := -5.0 + index * 2.5
		_box("Frame", Vector3(x, 2.25, -6.72), Vector3(1.55, 2.3, .16), BRASS); _box("Portrait", Vector3(x, 2.25, -6.6), Vector3(1.3, 2, .08), Color("544943") if index != 2 else Color("090908"))
	_box("PhotoTable", Vector3(0, .7, -3.4), Vector3(3.2, 1.4, 1.4), WOOD, true); _box("TornPhoto", Vector3(0, 1.43, -3.4), Vector3(1.5, .03, .9), PAPER)
	_interactive(Vector3(0, 1.6, -3.4), Vector3(2.5, .8, 1.5)); _light(Vector3(0, 3.2, -3.5), Color("b48e58"), 2.2, 7)

func _build_study() -> void:
	_box("Shelves", Vector3(0, 2, -6.65), Vector3(11, 3.7, .6), DARK_WOOD, true)
	var clock := _cylinder("Clock", Vector3(0, 2.65, -6.15), .7, .15, PAPER); clock.rotation_degrees.x = 90
	_box("WritingDesk", Vector3(0, .8, -3.4), Vector3(4.4, 1.6, 1.7), WOOD, true); _box("Letter", Vector3(0, 1.62, -3.4), Vector3(1.2, .03, .7), PAPER)
	_interactive(Vector3(0, 1.7, -3.4), Vector3(2.2, .7, 1.4)); _light(Vector3(0, 2.6, -3.1), Color("d39b50"), 2.7, 6)

func _build_basement() -> void:
	for x in [-5.7, 5.7]: _cylinder("Pipe", Vector3(x, 2, -2), .16, 4, Color("45443e"))
	var core := _sphere("MemoryCore", Vector3(0, 2, -4.5), 1.25, BRASS); core.material_override = _material(Color("5c492d"), Color("9d783e"))
	_interactive(Vector3(0, 2, -4.1), Vector3(3.6, 3.6, 2)); _light(Vector3(0, 2.2, -3.2), Color("c5924a"), 4, 8)
