import fs from 'node:fs';

const source=fs.readFileSync(new URL('../three-game.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

const scenes=[
 ['guest','DO NOT LOOK BACK'],
 ['laundry','SPIN CYCLE'],
 ['mirror','THE WRONG REFLECTION'],
 ['exterior','OUTSIDE THE WINDOWS'],
 ['baggage','PRIORITY DELIVERY'],
 ['executive','NO FURTHER APPOINTMENTS']
];
for(const [slug,name] of scenes){
 if(!source.includes(`slug:'${slug}',name:'${name}'`))throw new Error(`Missing Pursuer scene definition: ${slug}`);
 if(!html.includes(`value="pursuer-${slug}"`))throw new Error(`Missing Pursuer admin teleport: ${slug}`);
}
const hooks=[
 "maybeStartRandomPursuer('floor5',floorFive,saveFloorFive,roomKey,[1],.18)",
 "maybeStartRandomPursuer('floor1',floorOne,saveFloorOne,roomKey,[2],.15)",
 "maybeStartRandomPursuer('floor2',floorTwo,saveFloorTwo,roomKey,[3,4,5,6],.17)"
];
for(const hook of hooks)if(!source.includes(hook))throw new Error(`Missing randomized progression hook: ${hook}`);
if(source.includes("floorFive.index===5&&maybeStartPursuer")||source.includes('const pursuerScene=floorTwo.phase==='))throw new Error('A Pursuer chase is still attached to a predictable fixed room');
if(!source.includes('cancelNoise();cancelHotelNoiseArc();'))throw new Error('Pursuer scenes do not suppress both Noise systems');
if(!source.includes('pursuer.phase=1;pursuer.revealTimer=2.8'))throw new Error('Capture does not reset to the chase entrance checkpoint');
if(!source.includes("if(part==='escape-control')return finishPursuer()"))throw new Error('Final escape controls are not immediate');
if((source.match(/addPursuerJumpObstacle\(/g)||[]).length<7)throw new Error('Every chase does not include a jump obstacle');
if((source.match(/addPursuerLowObstacle\(/g)||[]).length<7)throw new Error('Every chase does not include a crouch obstacle');
if(!source.includes('E TAP WHILE MOVING'))throw new Error('Chase switches are not presented as immediate running actions');
if(!source.includes('function beginPursuerRunInPlace()')||!source.includes('revealTimer<=0)return beginPursuerRunInPlace()'))throw new Error('Reveal still rebuilds or teleports to a disconnected chase room');
if(!source.includes("beginHotelRoomPassage(trigger,()=>advancePursuer(3))"))throw new Error('The run does not connect physically to its escape room');
if(!source.includes("label:'PROTECTED CORRIDOR',type:'pursuer',part:'protected-exit'"))throw new Error('The escape does not connect physically to its protected aftermath');
if(!source.includes("box('continuous marked chase route'")||!source.includes("box('connected scaffold bridge'"))throw new Error('A chase route still contains an unmarked or disconnected span');
if(source.includes("part==='mirror-loop'"))throw new Error('The mirror chase still contains a route-choice puzzle');
if(source.includes("'pursuer-route'"))throw new Error('Legacy Room 150 Pursuer boss route still exists');
if(!source.includes('The Pursuer cannot enter this room.'))throw new Error('Safe-vault Pursuer guarantee is missing');
if((html.match(/value="pursuer-/g)||[]).length!==6)throw new Error('Expected exactly six Pursuer admin scene teleports');

console.log(JSON.stringify({scenes:scenes.length,triggers:'randomized by room',checkpoints:6,noiseDisabled:true,captureRestart:'scene entrance',route:'continuous reveal → run → escape → protected corridor',obstacles:['jump','crouch'],switches:'one-tap, unordered',escapeControls:'immediate',safeVault:'protected'},null,2));
