import fs from 'node:fs';
import vm from 'node:vm';

const floorFiveSource=fs.readFileSync(new URL('../game/08-floor-five.js',import.meta.url),'utf8');
const floorTwoSource=fs.readFileSync(new URL('../game/17-floor-two.js',import.meta.url),'utf8');
const corridorHelpers=floorFiveSource.slice(0,floorFiveSource.indexOf('function hotelCorridorLabel'));
const generatorSource=floorTwoSource.slice(0,floorTwoSource.indexOf('function newFloorTwoRun'));
const sandbox={};
vm.runInNewContext(`${corridorHelpers}\n${generatorSource}\nglobalThis.generateFloorTwoRoutes=generateFloorTwoRoutes;globalThis.required=FLOOR_TWO_ACCESSIBLE_ROOM_TYPES.map(([,variant])=>variant);globalThis.version=FLOOR_TWO_RANDOM_VERSION;`,sandbox);

const routeNames=['arrival','scaleToPiano','pianoToBallroom','returnInside'];
const failures=[];
for(let seed=0;seed<5000;seed++){
 const routes=sandbox.generateFloorTwoRoutes(seed),interior=routeNames.flatMap(name=>routes[name]),missing=sandbox.required.filter(variant=>!interior.some(room=>room.variant===variant));
 if(missing.length)failures.push({seed,missing});
 for(const routeName of routeNames){
  const route=routes[routeName];
  if(!route.some(room=>room.shape==='l-turn'))failures.push({seed,routeName,problem:'missing turning route'});
  for(let index=1;index<route.length;index++){
   if(route[index].variant===route[index-1].variant)failures.push({seed,routeName,index,problem:'duplicate variant'});
   if(route[index].class==='special'&&route[index-1].class==='special')failures.push({seed,routeName,index,problem:'consecutive specials'});
   if(index>1&&route[index].class==='hazard'&&route[index-1].class==='hazard'&&route[index-2].class==='hazard')failures.push({seed,routeName,index,problem:'three hazards'});
  }
 }
 if(failures.length)break;
}
if(failures.length)throw new Error(`Floor 2 generator contract failed: ${JSON.stringify(failures[0])}`);
if(sandbox.version!==11)throw new Error(`Unexpected Floor 2 generator version ${sandbox.version}`);

console.log(JSON.stringify({seedsChecked:5000,requiredVariants:sandbox.required,generatorVersion:sandbox.version,spacingRules:'passed'},null,2));
