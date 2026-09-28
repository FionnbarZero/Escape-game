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
 "maybeStartPursuer(1,'floor5')",
 "maybeStartPursuer(2,'floor1')",
 "maybeStartPursuer(pursuerScene,'floor2')"
];
for(const hook of hooks)if(!source.includes(hook))throw new Error(`Missing progression hook: ${hook}`);
for(const scene of [3,4,5,6])if(!source.includes(`?${scene}:`)&&!source.includes(`?${scene}`))throw new Error(`Missing Floor 2 Pursuer checkpoint ${scene}`);
if(!source.includes('cancelNoise();cancelHotelNoiseArc();'))throw new Error('Pursuer scenes do not suppress both Noise systems');
if(!source.includes('pursuer.phase=1;pursuer.revealTimer=2.8'))throw new Error('Capture does not reset to the chase entrance checkpoint');
if(!source.includes("if(part==='escape-control')return finishPursuer()"))throw new Error('Final escape controls are not immediate');
if((source.match(/addPursuerJumpObstacle\(/g)||[]).length<7)throw new Error('Every chase does not include a jump obstacle');
if((source.match(/addPursuerLowObstacle\(/g)||[]).length<7)throw new Error('Every chase does not include a crouch obstacle');
if(!source.includes('E TAP WHILE MOVING'))throw new Error('Chase switches are not presented as immediate running actions');
if(source.includes("part==='mirror-loop'"))throw new Error('The mirror chase still contains a route-choice puzzle');
if(source.includes("'pursuer-route'"))throw new Error('Legacy Room 150 Pursuer boss route still exists');
if(!source.includes('The Pursuer cannot enter this room.'))throw new Error('Safe-vault Pursuer guarantee is missing');
if((html.match(/value="pursuer-/g)||[]).length!==6)throw new Error('Expected exactly six Pursuer admin scene teleports');

console.log(JSON.stringify({scenes:scenes.length,checkpoints:6,noiseDisabled:true,captureRestart:'scene entrance',obstacles:['jump','crouch'],switches:'one-tap, unordered',escapeControls:'immediate',safeVault:'protected'},null,2));
