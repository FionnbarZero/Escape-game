const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9263';
const gameUrl=process.env.HOTEL_GAME_URL||'http://127.0.0.1:8765';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.startsWith(gameUrl));
if(!page)throw new Error('Hotel Nocturne page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);clearTimeout(request.timer);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId,timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout: ${method}`))},15000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))});
let stage='initialization';
const evaluate=async expression=>{process.stderr.write(`[floor2-browser] ${stage}\n`);const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
await send('Runtime.enable');

for(let attempt=0;attempt<80;attempt++){
 if(await evaluate(`document.readyState==='complete'&&typeof hideStorySelection==='function'&&typeof buildFloorTwoOutdoorRandom==='function'&&typeof tryFloorTwoTraversal==='function'&&Object.keys(FLOOR_TWO_OUTDOOR_FAMILIES).length===15`))break;
 await new Promise(resolve=>setTimeout(resolve,100));
 if(attempt===79)throw new Error('Floor 2 parkour module did not initialize');
}
exceptions.length=0;

stage='generated route contract';
const generated=await evaluate(`(()=>{const run=newFloorTwoRun(24681357),all=[...run.routes.watcherExterior,...run.routes.fuseExterior,...run.routes.finalExterior];return{version:run.version,lengths:[run.routes.watcherExterior.length,run.routes.fuseExterior.length,run.routes.finalExterior.length],families:[...new Set(all.map(room=>room.kind))],intro:run.routes.watcherExterior.map(room=>room.kind),wallRun:all.some(room=>room.kind==='wall-run')}})()`);
if(generated.version!==11||generated.lengths.join()!=='2,7,9'||generated.families.length!==15||generated.intro.join()!=='fire-escape,window-cradle'||generated.wallRun)throw new Error(`Generated route contract failed: ${JSON.stringify(generated)}`);

stage='fire escape build';
const fireEscape=await evaluate(`(()=>{adminTeleport('floor2-fireescape');if(dlg.open)dlg.close();const vault=floorTwoTraversalSurfaces.find(surface=>surface.kind==='vault'),mantle=floorTwoTraversalSurfaces.find(surface=>surface.kind==='mantle');return{title:document.querySelector('#title').textContent,spec:floorTwo.routes.watcherExterior[floorTwo.index],platforms:hotelStairPlatforms.length,vault:Boolean(vault),mantle:Boolean(mantle),course:floorTwoCourseActive,stairwell:hotelStairwell}})()`);
if(!fireEscape.title.includes('Broken Fire Escape')||fireEscape.spec.difficulty!=='introductory'||fireEscape.platforms<7||!fireEscape.vault||!fireEscape.mantle||!fireEscape.course||!fireEscape.stairwell)throw new Error(`Fire escape did not initialize authored traversal: ${JSON.stringify(fireEscape)}`);

stage='vault traversal';
const traversal=await evaluate(`(async()=>{const surface=floorTwoTraversalSurfaces.find(entry=>entry.kind==='vault'),from=new THREE.Vector3(surface.position.x,surface.position.y,surface.position.z+1),started=floorTwoBeginTraversal('vault',from,surface.target,.18);for(let index=0;index<7;index++){await new Promise(resolve=>setTimeout(resolve,40));updateFloorTwoTraversal()}return{started,finished:!floorTwoTraversalAction,feet:playerFeetY,targetY:surface.target.y,prompt:document.querySelector('#prompt').textContent}})()`);
if(!traversal.started||!traversal.finished||Math.abs(traversal.feet-traversal.targetY)>.08||!traversal.prompt.includes('LANDING CLEAR'))throw new Error(`Vault traversal failed: ${JSON.stringify(traversal)}`);

stage='local checkpoint';
const checkpoint=await evaluate(`(()=>{floorTwoCourseCheckpoint={x:2,z:3,y:.7};camera.position.set(9,1.7,9);playerFeetY=0;verticalVelocity=-2;updateFloorTwoTraversal();return{x:camera.position.x,z:camera.position.z,feet:playerFeetY,prompt:document.querySelector('#prompt').textContent}})()`);
if(Math.abs(checkpoint.x-2)>.01||Math.abs(checkpoint.z-3)>.01||Math.abs(checkpoint.feet-.7)>.01||!checkpoint.prompt.includes('LOCAL CHECKPOINT'))throw new Error(`Local checkpoint recovery failed: ${JSON.stringify(checkpoint)}`);

stage='moving platform carry';
const moving=await evaluate(`(async()=>{floorTwo=newFloorTwoRun(24681357);floorTwo.phase=9;floorTwo.index=1;buildFloorTwoPhase();const moving=floorTwoMovingPlatforms[0],platform=moving.platform;camera.position.set(platform.x,platform.top+1.7,platform.z);playerFeetY=platform.top;playerGrounded=true;const before={relativeX:camera.position.x-moving.mesh.position.x,relativeZ:camera.position.z-moving.mesh.position.z,meshX:moving.mesh.position.x,meshY:moving.mesh.position.y};await new Promise(resolve=>setTimeout(resolve,180));updateFloorTwoTraversal();const after={relativeX:camera.position.x-moving.mesh.position.x,relativeZ:camera.position.z-moving.mesh.position.z,meshX:moving.mesh.position.x,meshY:moving.mesh.position.y};return{title:document.querySelector('#title').textContent,count:floorTwoMovingPlatforms.length,before,after}})()`);
if(!moving.title.includes('Window-Washing Cradles')||moving.count<2||moving.before.meshX===moving.after.meshX&&moving.before.meshY===moving.after.meshY||Math.abs(moving.before.relativeX-moving.after.relativeX)>.12||Math.abs(moving.before.relativeZ-moving.after.relativeZ)>.12)throw new Error(`Moving platform carry failed: ${JSON.stringify(moving)}`);

stage='ballroom mantle';
const ballroom=await evaluate(`(()=>{adminTeleport('floor2-outside');floorTwo.ballroomTagged=[0,1,2,3,4,5];buildFloorTwoPhase();playerFeetY=0;handleFloorTwo('exit',null);return{prompt:document.querySelector('#prompt').textContent,mantle:floorTwoTraversalSurfaces.some(surface=>surface.kind==='mantle'),platforms:hotelStairPlatforms.length}})()`);
if(!ballroom.prompt.includes('SPACE TO MANTLE')||!ballroom.mantle||ballroom.platforms<1)throw new Error(`Ballroom mantle gate failed: ${JSON.stringify(ballroom)}`);

const landmarks={};
for(const destination of ['floor2-watcher','floor2-garden','floor2-window','floor2-guests','floor2-fuse','floor2-spotlights','floor2-crane']){stage=`landmark ${destination}`;landmarks[destination]=await evaluate(`(()=>{adminTeleport(${JSON.stringify(destination)});return{surfaces:floorTwoTraversalSurfaces.length,moving:floorTwoMovingPlatforms.length,title:document.querySelector('#title').textContent}})()`)};
for(const [destination,state] of Object.entries(landmarks))if(state.surfaces<1)throw new Error(`${destination} did not receive marked parkour: ${JSON.stringify(state)}`);
if(landmarks['floor2-fuse'].moving<1||landmarks['floor2-spotlights'].moving<1)throw new Error(`Fixed moving-platform upgrades missing: ${JSON.stringify(landmarks)}`);

const unexpected=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock')&&!error.includes('requestPointerLock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({generated,fireEscape,traversal,checkpoint,moving,ballroom,landmarks,browserExceptions:0},null,2));
