const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=[...pages].reverse().find(entry=>entry.type==='page'&&entry.url.includes('verify=50-doors'))||pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1:8765'))||pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1'));
if(!page)throw new Error('Hotel Nocturne page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map();
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value};

await send('Runtime.enable');
for(let attempt=0;attempt<50;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await new Promise(resolve=>setTimeout(resolve,200));
 if(attempt===49)throw new Error('Game module did not finish initializing');
}
const launch=destination=>evaluate(`(()=>{try{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value=${JSON.stringify(destination)};document.querySelector('#admin-teleport-go').onclick();return{value:select.value}}catch(error){return{error:error.stack}}})()`);
const floorFiveLaunch=await launch('floor5-entry');
if(floorFiveLaunch.error)throw new Error(floorFiveLaunch.error);
await new Promise(resolve=>setTimeout(resolve,500));
const floorFive=await evaluate(`(()=>({room:document.querySelector('#room-number strong').textContent,title:document.querySelector('#title').textContent,run:JSON.parse(sessionStorage.getItem('infinite-hotel-floor-five'))}))()`);
if(floorFive.run.opening.length!==24||floorFive.run.middle.length!==23||floorFive.room!=='ROOM 501')throw new Error('Floor 5 does not expose its 50-door route: '+JSON.stringify(floorFive));
if(![...floorFive.run.opening,...floorFive.run.middle].some(room=>room.shape==='l-turn'))throw new Error('Floor 5 generated no turning rooms');

const floorOneLaunch=await launch('floor1-entry');
if(floorOneLaunch.error)throw new Error(floorOneLaunch.error);
await new Promise(resolve=>setTimeout(resolve,500));
const floorOne=await evaluate(`(()=>({room:document.querySelector('#room-number strong').textContent,run:JSON.parse(sessionStorage.getItem('infinite-hotel-floor-one'))}))()`);
const floorOneRooms=Object.values(floorOne.run.routes).flat();
if(floorOneRooms.length!==45||floorOne.room!=='ROOM 1')throw new Error('Floor 1 does not expose its 50-door route: '+JSON.stringify(floorOne));
if(!floorOneRooms.some(room=>room.shape==='l-turn')||!floorOneRooms.some(room=>room.shape==='straight'))throw new Error('Floor 1 generated layouts are not varied');

const entryLaunch=await launch('floor2-entry');
if(entryLaunch.error)throw new Error(entryLaunch.error);
await new Promise(resolve=>setTimeout(resolve,500));
const entry=await evaluate(`(()=>({title:document.querySelector('#title').textContent,prompt:document.querySelector('#prompt').textContent,wired:typeof document.querySelector('#admin-teleport-go').onclick,panelHidden:document.querySelector('#admin-panel').hidden,run:JSON.parse(sessionStorage.getItem('infinite-hotel-floor-two'))}))()`);
if(!entry.run)throw new Error('Generated Floor 2 entry did not initialize: '+JSON.stringify(entry));
const interiorRoutes=[entry.run.routes.arrival,entry.run.routes.scaleToPiano,entry.run.routes.pianoToBallroom,entry.run.routes.watcherInside,entry.run.routes.fuseToSpotlights,entry.run.routes.returnInside],interior=interiorRoutes.flat();
if(!entry.title||!entry.run.seed||entry.run.version!==8)throw new Error('Generated Floor 2 entry did not initialize');
const generatedDoorCount=interior.length+entry.run.routes.finalExterior.length;
if(generatedDoorCount!==39)throw new Error(`Floor 2 should contain 39 generated rooms, received ${generatedDoorCount}`);
const courtyardOption=await evaluate(`document.querySelector('#admin-teleport option[value="floor2-courtyard"]')!==null`);
if(courtyardOption)throw new Error('Removed Flooded Courtyard is still exposed in the admin teleport menu');
for(const route of interiorRoutes){
 if(!route.some(room=>room.shape==='l-turn'))throw new Error('Interior segment is missing its guaranteed L-turn');
 if(!route.some(room=>['left-turn','right-turn','switchback','zigzag','winding'].includes(room.layout)))throw new Error('Interior segment is missing a real multi-segment route');
 for(let index=1;index<route.length;index++){
  if(route[index].variant===route[index-1].variant)throw new Error('Consecutive duplicate room variation');
  if(route[index].class==='special'&&route[index-1].class==='special')throw new Error('Consecutive Special Rooms');
  if(index>1&&route[index].class==='hazard'&&route[index-1].class==='hazard'&&route[index-2].class==='hazard')throw new Error('More than two consecutive Hazard Rooms');
 }
}
if(interior.some(room=>!['normal','water','hazard','special'].includes(room.class)))throw new Error('Unknown random-room class');
const accessibleTypes=['guest-suite-foyer','sitting-room','storage-room','dining-room','nursery-suite','mailroom','service-kitchen','conservatory','submerged-laundry','floor-collapse','mirror-room','mannequin-room'];
for(const variant of accessibleTypes)if(!interior.some(room=>room.variant===variant))throw new Error(`Accessible room type is missing from this run: ${variant}`);
const suiteFoyer=interior.find(room=>room.variant==='guest-suite-foyer');
if(suiteFoyer?.annex!=='bedroom-bathroom')throw new Error('Guest Suite Foyer does not lead to the bedroom-and-bathroom annex');
if(interior.some(room=>room.variant!=='guest-suite-foyer'&&room.annex))throw new Error('A non-suite room incorrectly retained a private annex');
const standalonePrivateRooms=['bedroom','double-bedroom','bathroom','rain-suite','overflowing-bath','identical-beds','backward-suite'];
if(interior.some(room=>standalonePrivateRooms.includes(room.variant)))throw new Error('A bedroom or bathroom still appears as a standalone numbered room');
if(interior.some(room=>room.path?.length!==9))throw new Error('Generated room is missing its nine-segment route definition');
if(!interior.some(room=>['switchback-corridor','zigzag-corridor','winding-corridor'].includes(room.variant)))throw new Error('Generated rooms contain no extended corridor variants');
for(const room of interior.filter(room=>room.layout!=='straight')){
 if(room.path[0]!==2||room.path.at(-1)!==2||!room.path.some(lane=>lane!==2))throw new Error('Turning room does not connect its centered entrance and exit: '+JSON.stringify(room));
 const turns=room.path.slice(1).filter((lane,index)=>lane!==room.path[index]).length;
 if(['switchback','zigzag','winding'].includes(room.layout)&&turns<2)throw new Error('Extended route does not contain repeated turns: '+JSON.stringify(room));
}

const landmarkExpectations={
 'floor2-scale':'Room 105 · The Luggage Scale Lock',
 'floor2-piano':'Room 112 · The Piano Chord Cipher',
 'floor2-outside':'Room 115 · The Storm Ballroom',
 'floor2-watcher':'Room 116 · Outdoor Puzzle · The Watcher',
 'floor2-garden':'Room 119 · Outdoor Puzzle · The Garden Maze',
 'floor2-window':'Room 120 · Outdoor Puzzle · The Window Creature',
 'floor2-guests':'Room 121 · Outdoor Puzzle · The False Guests',
 'floor2-fuse':'Room 122 · The Fuse Box Patch',
 'floor2-spotlights':'Room 130 · The Spotlight Matrix',
 'floor2-crane':'Room 140 · The Crane Cargo Scramble',
 'room140':'Room 150 · Safe Vault'
};
for(const [destination,expectedTitle] of Object.entries(landmarkExpectations)){
 await launch(destination);
 await new Promise(resolve=>setTimeout(resolve,120));
 const title=await evaluate(`document.querySelector('#title').textContent`);
 if(title!==expectedTitle)throw new Error(`${destination} rendered ${JSON.stringify(title)} instead of ${JSON.stringify(expectedTitle)}`);
 if(destination==='floor2-outside'){
  const ballroom=await evaluate(`(()=>({objective:document.querySelector('#objective').textContent,run:JSON.parse(sessionStorage.getItem('infinite-hotel-floor-two'))}))()`);
  if(!ballroom.objective.includes('press E to tag')||ballroom.run.ballroomTagged.length!==0)throw new Error('Ballroom guest-tag encounter did not initialize');
 }
}

socket.close();
console.log(JSON.stringify({seed:entry.run.seed,entry:entry.title,generatedRooms:generatedDoorCount,landmarks:Object.keys(landmarkExpectations).length,totalDoors:generatedDoorCount+Object.keys(landmarkExpectations).length},null,2));
