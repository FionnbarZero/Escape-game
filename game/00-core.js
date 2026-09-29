// Renderer, camera, controls, lighting, puzzle-run data, and shared DOM handles.

const graphicsHardwareConstrained=(navigator.hardwareConcurrency||8)<=6,graphicsQuery=new URLSearchParams(location.search),storedGraphicsQuality=localStorage.getItem('hotel-graphics-quality'),requestedGraphicsQuality=graphicsQuery.get('quality'),validGraphicsQualities=['low','medium','high'],initialGraphicsQuality=validGraphicsQualities.includes(requestedGraphicsQuality)?requestedGraphicsQuality:validGraphicsQualities.includes(storedGraphicsQuality)?storedGraphicsQuality:graphicsHardwareConstrained?'low':'medium';
const canvas=document.querySelector('#game'),storySelect=document.querySelector('#story-select'),renderer=new THREE.WebGLRenderer({canvas,antialias:initialGraphicsQuality!=='low'&&!graphicsHardwareConstrained,powerPreference:initialGraphicsQuality==='low'?'low-power':'high-performance'});
const chapter=document.querySelector('#chapter'),title=document.querySelector('#title'),description=document.querySelector('#description'),objective=document.querySelector('#objective'),count=document.querySelector('#count'),roomNumber=document.querySelector('#room-number strong'),intro=document.querySelector('#intro');
const MONSTER_JUMPSCARE_PROFILES={
 monster:{variant:'monster',motion:'unknown-lunge',mark:'?'},
 bash:{variant:'bash',motion:'bash-ram',mark:'//'},
 chef:{variant:'chef',motion:'chef-cleave',mark:'X'},
 collector:{variant:'collector',motion:'collector-grab',mark:'KEYS'},
 clockmaker:{variant:'clockmaker',motion:'clockmaker-wind',mark:'XII'},
 'drowned-guest':{variant:'drowned',motion:'drowned-surge',mark:'SOS'},
 'water-creature':{variant:'water',motion:'water-breach',mark:'≈'},
 pursuer:{variant:'pursuer',motion:'pursuer-intercept',mark:'+'},
 molly:{variant:'molly',motion:'molly-monitor-kill',mark:'00'},
 'stair-monster':{variant:'stair',motion:'stair-zigzag',mark:'↯'},
 'cable-mass':{variant:'cable',motion:'cable-whip',mark:'LIVE'},
 spider:{variant:'spider',motion:'spider-pounce',mark:'••••'},
 'giant-spider':{variant:'spider',motion:'spider-pounce',mark:'••••'},
 'root-stalker':{variant:'root',motion:'root-erupt',mark:'●'},
 root:{variant:'root',motion:'root-erupt',mark:'●'},
 gardener:{variant:'gardener',motion:'gardener-reap',mark:'III'},
 watcher:{variant:'watcher',motion:'watcher-unseen',mark:'EYES'},
 'ballroom-guest':{variant:'ballroom-guest',motion:'guest-waltz',mark:'VI'},
 'masked-guest':{variant:'ballroom-guest',motion:'guest-waltz',mark:'VI'},
 'false-guest':{variant:'false-guest',motion:'impostor-unmask',mark:'FALSE'},
 'fake-guest':{variant:'false-guest',motion:'impostor-unmask',mark:'FALSE'},
 'window-creature':{variant:'window',motion:'window-break',mark:'OPEN'},
 reflection:{variant:'reflection',motion:'reflection-cross',mark:'YOU'},
 'luggage-warden':{variant:'warden',motion:'warden-crush',mark:'404'},
 'empty-porter':{variant:'porter',motion:'porter-blink',mark:'EMPTY'},
 'black-bellhop':{variant:'bellhop',motion:'bellhop-ring',mark:'RING'},
 'hotel-manager':{variant:'manager',motion:'manager-block',mark:'MGR'},
 'night-auditor':{variant:'auditor',motion:'auditor-scan',mark:'DUE'},
 'cellblock-guard':{variant:'cellblock-guard',motion:'guard-baton',mark:'HALT'},
 'pursuit-guards':{variant:'pursuit-guards',motion:'guards-roadblock',mark:'STOP'},
 'vent-crawler':{variant:'crawler',motion:'crawler-duct-slam',mark:'////'}
};
const MONSTER_JUMPSCARE_VARIANTS=Object.fromEntries(Object.entries(MONSTER_JUMPSCARE_PROFILES).map(([kind,profile])=>[kind,profile.variant]));
let monsterJumpscareTimer=null;
function hideMonsterJumpscare(){
 clearTimeout(monsterJumpscareTimer);monsterJumpscareTimer=null;
 for(const selector of ['#monster-jumpscare','#purge-jumpscare','#noise-jumpscare']){const overlay=document.querySelector(selector);if(!overlay)continue;overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true')}
 document.body.classList.remove('monster-jumpscare-active','purge-jumpscare','noise-hit');
}
function playMonsterJumpscare(kind='monster',name='THE MONSTER',reason='IT FOUND YOU',duration=1050){
 hideMonsterJumpscare();const normalized=String(kind).toLowerCase();let overlay;
 if(normalized==='purge'||normalized==='the-purge'){overlay=document.querySelector('#purge-jumpscare');document.body.classList.add('purge-jumpscare');overlay?.querySelector('small')&&(overlay.querySelector('small').textContent='THE PURGE');overlay?.querySelector('strong')&&(overlay.querySelector('strong').textContent=reason)}
 else if(normalized==='noise'||normalized==='the-noise'){overlay=document.querySelector('#noise-jumpscare');document.body.classList.add('noise-hit');const label=document.querySelector('#noise-death-reason');if(label)label.textContent=reason}
 else{overlay=document.querySelector('#monster-jumpscare');if(overlay){const profile=MONSTER_JUMPSCARE_PROFILES[normalized]||MONSTER_JUMPSCARE_PROFILES.monster;overlay.dataset.monster=profile.variant;overlay.dataset.motion=profile.motion;const label=document.querySelector('#monster-jumpscare-name'),detail=document.querySelector('#monster-jumpscare-reason'),mark=overlay.querySelector('.monster-jumpscare__signature span');if(label)label.textContent=String(name||kind).toUpperCase();if(detail)detail.textContent=reason;if(mark)mark.textContent=profile.mark}document.body.classList.add('monster-jumpscare-active')}
 if(!overlay)return;overlay.classList.remove('active');void overlay.offsetWidth;overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');
 monsterJumpscareTimer=setTimeout(()=>{overlay.classList.remove('active');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('monster-jumpscare-active','purge-jumpscare','noise-hit');monsterJumpscareTimer=null},duration);
}
const GRAPHICS_PRESETS={low:{resolutionScale:.72,pixelRatioCap:1,shadows:false,shadowMapSize:512,particles:.45,optionalEffects:false},medium:{resolutionScale:.88,pixelRatioCap:1.35,shadows:true,shadowMapSize:1024,particles:.72,optionalEffects:true},high:{resolutionScale:1,pixelRatioCap:1.75,shadows:true,shadowMapSize:2048,particles:1,optionalEffects:true}};
let graphicsQuality=initialGraphicsQuality,graphicsRenderScale=Number(localStorage.getItem('hotel-graphics-resolution'))||GRAPHICS_PRESETS[initialGraphicsQuality].resolutionScale,graphicsOptionalEffects=localStorage.getItem('hotel-graphics-effects')!=='off'&&GRAPHICS_PRESETS[initialGraphicsQuality].optionalEffects,graphicsReducedMotion=localStorage.getItem('hotel-reduced-motion')==='on'||matchMedia('(prefers-reduced-motion: reduce)').matches,graphicsReducedFlashing=localStorage.getItem('hotel-reduced-flashing')==='on',lowPowerMode=initialGraphicsQuality==='low';
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x151511);scene.fog=new THREE.FogExp2(0x1d1c18,.016);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,100);camera.position.set(0,1.7,5.5);
const controls=new PointerLockControls(camera,document.body);controls.pointerSpeed=1.1;
const rawMoveForward=controls.moveForward.bind(controls),rawMoveRight=controls.moveRight.bind(controls);function activeMovementModifier(){const floorOneModifier=!floorOne?1:floorOne.cough>0?0:floorOne.exhausted>0?.5:floorOne.lookDown?.8:1,floorTwoModifier=floorTwo&&hotelSideScene.startsWith('floor-two')&&floorTwo.waterSlow?.62:1,vitaminModifier=inventoryEffects?.vitaminsTimer>0?(floorOne?1.3:1.2):1,energyModifier=inventoryEffects?.energyTimer>0?1.18:1;return(floorFive?.slowTimer>0?.45:1)*floorOneModifier*floorTwoModifier*vitaminModifier*energyModifier}controls.moveForward=distance=>{if(hotelHideState)return;const before=camera.position.clone();rawMoveForward(distance*activeMovementModifier());if(playerHitsSolid(camera.position))camera.position.copy(before)};controls.moveRight=distance=>{if(hotelHideState)return;const before=camera.position.clone();rawMoveRight(distance*activeMovementModifier());if(playerHitsSolid(camera.position))camera.position.copy(before)};
scene.add(camera);
scene.add(new THREE.AmbientLight(0xa79c83,.48));
scene.add(new THREE.HemisphereLight(0x8f9694,0x21170f,.62));
const moon=new THREE.DirectionalLight(0x9aa8b8,1.15);moon.position.set(-4,7,4);moon.castShadow=true;scene.add(moon);
const flashlight=new THREE.SpotLight(0xffedc2,240,100,Math.PI/3.2,.45,1.05);flashlight.position.set(.12,-.08,0);flashlight.target.position.set(0,-.05,-1);flashlight.castShadow=true;flashlight.shadow.mapSize.set(2048,2048);flashlight.shadow.bias=-.0004;camera.add(flashlight,flashlight.target);
const inventoryMatchLight=new THREE.PointLight(0xff9b45,0,8,2);inventoryMatchLight.position.set(.25,-.15,-.35);camera.add(inventoryMatchLight);
const inventoryGlowLight=new THREE.PointLight(0x69ffd5,0,17,1.65);inventoryGlowLight.position.set(-.3,-.35,-.55);camera.add(inventoryGlowLight);

function graphicsPreset(){return GRAPHICS_PRESETS[graphicsQuality]||GRAPHICS_PRESETS.medium}
function graphicsParticleScale(){return graphicsPreset().particles}
function applyGraphicsResolution(){const preset=graphicsPreset(),scale=THREE.MathUtils.clamp(graphicsRenderScale,.5,1);renderer.setPixelRatio(Math.min(devicePixelRatio,preset.pixelRatioCap)*scale);renderer.setSize(innerWidth,innerHeight,false)}
function applyGraphicsQuality(next=graphicsQuality,{persist=true}={}){
 graphicsQuality=GRAPHICS_PRESETS[next]?next:'medium';const preset=graphicsPreset();lowPowerMode=graphicsQuality==='low';graphicsRenderScale=THREE.MathUtils.clamp(Number(graphicsRenderScale)||preset.resolutionScale,.5,1);graphicsOptionalEffects=Boolean(graphicsOptionalEffects&&preset.optionalEffects);renderer.shadowMap.enabled=preset.shadows;renderer.shadowMap.type=graphicsQuality==='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;moon.castShadow=preset.shadows;flashlight.castShadow=preset.shadows&&graphicsQuality==='high';scene.traverse(object=>{if(!object.isLight||!object.shadow)return;object.castShadow=preset.shadows&&Boolean(object.userData.presentationShadowPriority||object===moon||object===flashlight);const shadowSize=object.isPointLight?Math.min(1024,preset.shadowMapSize):preset.shadowMapSize;object.shadow.mapSize.set(shadowSize,shadowSize);object.shadow.needsUpdate=true});applyGraphicsResolution();document.body.dataset.graphicsQuality=graphicsQuality;document.body.classList.toggle('low-power',lowPowerMode);document.body.classList.toggle('reduced-motion',graphicsReducedMotion);document.body.classList.toggle('reduced-flashing',graphicsReducedFlashing);document.body.classList.toggle('optional-effects',graphicsOptionalEffects);if(persist){localStorage.setItem('hotel-graphics-quality',graphicsQuality);localStorage.setItem('hotel-graphics-resolution',String(graphicsRenderScale));localStorage.setItem('hotel-graphics-effects',graphicsOptionalEffects?'on':'off');localStorage.setItem('hotel-reduced-motion',graphicsReducedMotion?'on':'off');localStorage.setItem('hotel-reduced-flashing',graphicsReducedFlashing?'on':'off')}if(typeof syncGraphicsControls==='function')syncGraphicsControls();return graphicsSnapshot()
}
function graphicsSnapshot(){const gl=renderer.getContext();return{quality:graphicsQuality,resolutionScale:graphicsRenderScale,pixelRatio:renderer.getPixelRatio(),drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],shadows:renderer.shadowMap.enabled,shadowMapSize:graphicsPreset().shadowMapSize,particles:graphicsParticleScale(),optionalEffects:graphicsOptionalEffects,reducedMotion:graphicsReducedMotion,reducedFlashing:graphicsReducedFlashing}}
applyGraphicsQuality(graphicsQuality,{persist:false});

function newPuzzleRun(){const pick=list=>list[Math.floor(Math.random()*list.length)],shuffle=list=>[...list].sort(()=>Math.random()-.5);return{warning:pick([['DO NOT','TRUST','THE VOICE','BELOW'],['NEVER','FOLLOW','THE CHILD','DOWNSTAIRS'],['COVER','THE MIRROR','BEFORE','MIDNIGHT']]),ritual:pick([['SALT','HERBS','ASH','BLOOD'],['IRON','WATER','BONE','FIRE'],['BELL','THREAD','WAX','HAIR']]),trophyReverse:Math.random()>.5,cellarTarget:pick([11,13,16]),clockHour:1+Math.floor(Math.random()*11),clockMinute:pick([7,13,22,37,46,53]),mazeBinding:pick([['CUT THE ROOTS','BREAK THE CIRCLE','BURN THE HEART','RUN AT DAWN'],['BREAK THE SEAL','PIERCE THE HEART','LIGHT THE ROOTS','RUN TO THE DOOR'],['SPEAK THE NAME','RING THE BELL','BURN THE MARK','FLEE AT DAWN']]),logOrder:shuffle(['BIRCH','PINE','OAK']),windowWord:pick(['WOLF','DARK','FIND','MOON']),mapRoute:pick([['40° NORTH','120° EAST'],['70° EAST','30° NORTH'],['20° WEST','90° SOUTH']])}}
const puzzleRun=JSON.parse(sessionStorage.getItem('cabin-puzzle-run')||'null')||newPuzzleRun();const savePuzzleRun=()=>sessionStorage.setItem('cabin-puzzle-run',JSON.stringify(puzzleRun));savePuzzleRun();
puzzleRun.hiddenWall||=[['YOU','HAVE','BEEN','HERE'],['THE','CABIN','KNOWS','YOUR NAME'],['NEVER','ANSWER','THE','KNOCKING']][Math.floor(Math.random()*3)];puzzleRun.hiddenRitual||=[['SALT','FIRE','WATER','BONE'],['IRON','WAX','HAIR','ASH'],['BELL','BLOOD','THREAD','SMOKE']][Math.floor(Math.random()*3)];puzzleRun.lockYear||=[1987,1996,2008][Math.floor(Math.random()*3)];puzzleRun.toolOrder||=[['HAMMER','SAW','PLIERS','BAT'],['SAW','PLIERS','HAMMER','BAT'],['PLIERS','HAMMER','SAW','BAT']][Math.floor(Math.random()*3)];savePuzzleRun();
puzzleRun.hotelStart??=[7,13,21][Math.floor(Math.random()*3)];puzzleRun.hotelStep??=[7,11,13][Math.floor(Math.random()*3)];puzzleRun.hotelAnswer??=puzzleRun.hotelStart+puzzleRun.hotelStep*3;puzzleRun.hotelFloor??=[-1,0,404][Math.floor(Math.random()*3)];const hotelWelcomeRooms=[13,14,15];if(!hotelWelcomeRooms.includes(puzzleRun.hotelAssignedRoom))puzzleRun.hotelAssignedRoom=hotelWelcomeRooms[Math.floor(Math.random()*hotelWelcomeRooms.length)];puzzleRun.hotelRoomVariant??=Math.floor(Math.random()*4);savePuzzleRun();
const assignedHotelRoom=puzzleRun.hotelAssignedRoom;
const hotelFloorNumber=5;
const hotelRealityPuzzleUpgrade=puzzleRun.hotelRealityVersion!==2;puzzleRun.hotelFeatures??=['fireplace','clock','aquarium','shrine','sealed-window'].sort(()=>Math.random()-.5);puzzleRun.hotelSymbols??=['△','○','□','◇','✕'].sort(()=>Math.random()-.5);puzzleRun.hotelRealityVersion=2;savePuzzleRun();

const rooms=[
 ['CHAPTER I','The Main Cabin','You wake on splintered floorboards. The windows are boarded from the inside.','Find three pieces of the broken door handle.'],
 ['CHAPTER II','The Bedroom','An empty rocking chair faces a mirror that refuses to show your reflection.','Recover the warning hidden in the mirror.'],
 ['CHAPTER III','The Kitchen','Bundles of herbs hang above bowls marked with ritual symbols.','Reconstruct the cabin owner’s ritual.'],
 ['CHAPTER IV','The Trophy Room','Backpacks and photographs belong to people who vanished in these woods.','Arrange the disappearances in order.'],
 ['CHAPTER V','The Flooded Cellar','Black water covers the floor. Three rusted valves feed a pressure pump above the submerged hatch.',`Set the pump to exactly ${puzzleRun.cellarTarget} PSI and drain the hatch.`],
 ['CHAPTER VI','The Workshop','Rusting tools hang above a workbench. A baseball bat rests in an open vise.','Take something you can defend yourself with.'],
 ['CHAPTER VII','The Playroom','A giant spider hunts across the entire floor. One touch is fatal, so keep moving and use the high platforms.','Avoid its body and hit the spider’s faster throws back five times.'],
 ['CHAPTER VIII','The Root Maze','A vast maze of stone and living roots stretches far beneath the cabin.','Find the glowing heart at the center of the maze.'],
 ['CHAPTER IX','The Infinite Hotel','Fog surrounds the oak entrance of a hotel that already has your name in its guestbook.','Enter the Grand Lobby, complete check-in, and find Room 304.'] ];
