import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const source=read('../game/17-floor-two-parkour.js');
const floorTwo=read('../game/17-floor-two.js');
const runtime=read('../game/25-runtime.js');
const manifest=read('../game/manifest.js');

for(const [label,text,needle] of [
 ['random version',floorTwo,'FLOOR_TWO_RANDOM_VERSION=11'],
 ['module order',manifest,"'17-floor-two-parkour.js'"],
 ['jump traversal hook',runtime,"typeof tryFloorTwoTraversal==='function'"],
 ['runtime traversal update',runtime,"typeof updateFloorTwoTraversal==='function'"],
 ['vault ability',source,"floorTwoTraversalSurface('vault'"],
 ['mantle ability',source,"floorTwoTraversalSurface('mantle'"],
 ['ledge catching',source,'function catchFloorTwoLedge()'],
 ['ledge traversal',source,"action?.kind==='ledge'"],
 ['moving platform carry',source,'if(wasStanding)'],
 ['hanging rail',source,"kind:'rail'"],
 ['slide clearance',source,'C/CTRL · SLIDE UNDER'],
 ['local checkpoints',source,'LOCAL CHECKPOINT'],
 ['ballroom mantle',source,'shattered ballroom window sill'],
 ['watcher parkour',source,'watcher terrace raised level'],
 ['garden routes',source,'garden exposed raised walkway'],
 ['window routes',source,'window walk upper observation route'],
 ['false guest reset route',source,'false guest reset route barrier'],
 ['construction branches',source,'construction predictable transfer'],
 ['spotlight terraces',source,'spotlight stationary upper terrace'],
 ['crane combination',source,'crane middle bridge transfer'],
 ['water creature',source,'courtyard water creature'],
 ['fair forced movement',source,'floorTwo.sheltered=true'],
])if(!text.includes(needle))throw new Error(`Missing ${label}: ${needle}`);

const generationSource=source.slice(0,source.indexOf('let floorTwoTraversalSurfaces'));
const context={FLOOR_TWO_RANDOM_VERSION:11};
context.floorTwoSeededRandom=seed=>{let value=seed>>>0;return()=>{value+=0x6D2B79F5;let result=value;result=Math.imul(result^result>>>15,result|1);result^=result+Math.imul(result^result>>>7,result|61);return((result^result>>>14)>>>0)/4294967296}};
context.generateFloorTwoRoutes=()=>({arrival:[],scaleToPiano:[],pianoToBallroom:[],watcherExterior:[],fuseExterior:[],finalExterior:[],returnInside:[]});
vm.runInNewContext(generationSource,context);
const first=context.generateFloorTwoRoutes(123456),repeat=context.generateFloorTwoRoutes(123456),other=context.generateFloorTwoRoutes(987654);
if(JSON.stringify(first)!==JSON.stringify(repeat))throw new Error('Outdoor route selection is not stable for one seed');
if(JSON.stringify(first)===JSON.stringify(other))throw new Error('Different seeds did not produce different authored variants');
if(first.watcherExterior.length!==2||first.fuseExterior.length!==7||first.finalExterior.length!==9)throw new Error('Outdoor route room counts changed');
if(first.watcherExterior[0].kind!=='fire-escape'||first.watcherExterior[1].kind!=='window-cradle')throw new Error('Rooms 117–118 no longer introduce fire escape then cradles');
if(!first.watcherExterior.every(room=>room.difficulty==='introductory')||!first.fuseExterior.every(room=>room.difficulty==='standard')||!first.finalExterior.every(room=>room.difficulty==='hard'))throw new Error('Outdoor difficulty tiers are not assigned by route');
const all=[...first.watcherExterior,...first.fuseExterior,...first.finalExterior],families=new Set(all.map(room=>room.kind));
if(families.size!==15)throw new Error(`Expected all 15 authored families in a run, found ${families.size}`);
if(families.has('wall-run'))throw new Error('Wall-running was added before the ability is implemented');
if(source.includes('scheduleRandomRoomMonster'))throw new Error('Exposed parkour rooms schedule incompatible random rush monsters');
for(const room of all)if(!room.variant||!room.difficulty)throw new Error(`Incomplete outdoor spec: ${JSON.stringify(room)}`);

console.log(JSON.stringify({
 roomCounts:{introductory:2,standard:7,hard:9},
 authoredFamilies:[...families].sort(),
 abilities:['vault','mantle','ledge catch','ledge traversal','slide','precision jump','moving platforms','hanging rail'],
 fixedLandmarks:['Ballroom','Watcher','Garden','Window Walk','False Guests','Construction Elevator','Spotlights','Crane'],
 wallRunning:'deliberately deferred',
 deterministic:true,
 noiseOnFloorTwo:false
},null,2));
