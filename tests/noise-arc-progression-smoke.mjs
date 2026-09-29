const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9250';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1'));
if(!page)throw new Error('Hotel Nocturne page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

await send('Runtime.enable');
await send('Page.reload',{ignoreCache:true});
for(let attempt=0;attempt<100;attempt++){
 if(await evaluate(`typeof buildHotelNoiseArcRoom==='function'&&typeof updateHotelRoomPassage==='function'&&typeof saveHotelRun==='function'&&typeof dlg==='object'&&typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await wait(100);
 if(attempt===99)throw new Error(`Game module did not finish initializing: ${exceptions.join(' | ')}`);
}
exceptions.length=0;

const room55=await evaluate(`(()=>{
 buildHotelNoiseArcRoom(54);
 camera.position.set(0,1.7,-8);camera.lookAt(0,1.7,-10.05);camera.updateMatrixWorld(true);roomGroup.updateMatrixWorld(true);interact();
 const spawn=camera.position.clone(),blockedAtSpawn=playerHitsSolid(spawn),steps=[];
 const movement=[];
 for(const crouched of [false,true])for(const [direction,amount] of [['forward',.16],['forward',-.16],['right',.16],['right',-.16]]){keys.KeyC=crouched;playerFeetY=0;camera.position.set(0,crouched?.95:1.7,8.5);const before=camera.position.clone();controls[direction==='forward'?'moveForward':'moveRight'](amount);movement.push({crouched,direction,amount,moved:camera.position.distanceTo(before)})}
 keys.KeyC=false;playerFeetY=0;camera.position.copy(spawn);
 for(const [x,z] of [[0,8],[0,7],[0,6],[0,5],[-1,5],[-2,5],[-3,5],[-4,5],[-5,5]])steps.push({x,z,blocked:playerHitsSolid(new THREE.Vector3(x,1.7,z))});
 const parts=[...interactables].filter(item=>item.userData.type==='noise-arc').map(item=>item.userData.part);
 const step=.5,key=(x,z)=>x.toFixed(1)+':'+z.toFixed(1),start=[0,8.5],queue=[start],seen=new Set([key(...start)]),targets={radio:[-6.7,4.45],distraction:[6.6,-4.75],keycard:[0,-5.95],exit:[0,-10.05]};
 while(queue.length){const [x,z]=queue.shift();for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const next=[x+dx,z+dz],id=key(...next);if(Math.abs(next[0])>10.25||Math.abs(next[1])>10.25||seen.has(id)||playerHitsSolid(new THREE.Vector3(next[0],1.7,next[1])))continue;seen.add(id);queue.push(next)}}
 const reachable=Object.fromEntries(Object.entries(targets).map(([name,target])=>[name,[...seen].some(id=>{const [x,z]=id.split(':').map(Number);return Math.hypot(x-target[0],z-target[1])<2.2})]));
 return{room:hotelNoiseArcRoom,spawn:spawn.toArray(),blockedAtSpawn,blockedSteps:steps.filter(step=>step.blocked),movement,parts,reachable};
})()`);
if(room55.room!==55||room55.blockedAtSpawn||room55.blockedSteps.length||room55.movement.some(attempt=>attempt.moved<.15))throw new Error(`Room 55 entrance remains blocked: ${JSON.stringify(room55)}`);
for(const part of ['radio','place-radio','keycard','exit'])if(!room55.parts.includes(part))throw new Error(`Room 55 lost ${part}: ${JSON.stringify(room55.parts)}`);
if(Object.values(room55.reachable).some(value=>!value))throw new Error(`Room 55 objective route is disconnected: ${JSON.stringify(room55.reachable)}`);

await evaluate(`(()=>{adminInvincible=false;failHotelNoiseArc('ROOM 55 RETRY TEST')})()`);
await wait(2350);
const room55Retry=await evaluate(`(()=>({room:hotelNoiseArcRoom,blocked:playerHitsSolid(camera.position),spawn:camera.position.toArray(),parts:[...interactables].filter(item=>item.userData.type==='noise-arc').map(item=>item.userData.part)}))()`);
if(room55Retry.room!==55||room55Retry.blocked||!['radio','place-radio','keycard','exit'].every(part=>room55Retry.parts.includes(part)))throw new Error(`Room 55 retry is invalid: ${JSON.stringify(room55Retry)}`);

const room60=await evaluate(`(()=>{
 buildHotelNoiseArcRoom(60);
 const before={room:hotelNoiseArcRoom,side:hotelSideScene,hasPassage:!!hotelNoiseArc.exitTrigger?.userData.hotelPassage,parts:[...interactables].filter(item=>item.userData.type==='noise-arc').map(item=>item.userData.part)};
 camera.position.set(0,1.7,-8);camera.lookAt(0,1.7,-10.15);camera.updateMatrixWorld(true);roomGroup.updateMatrixWorld(true);interact();
 const opened=!!hotelRoomPassage;
 camera.position.set(hotelRoomPassage.x,1.7,hotelRoomPassage.threshold-.1);
 updateHotelRoomPassage(.5);
 return{before,opened,after:{side:hotelSideScene,floorOnePhase:floorOne?.phase,room:document.querySelector('#room-number strong')?.textContent,noiseArcActive:!!hotelNoiseArc}};
})()`);
if(!room60.before.hasPassage||!room60.before.parts.includes('exit')||!room60.opened||room60.after.side!=='floor-one-1'||room60.after.floorOnePhase!==1||room60.after.room!=='ROOM 1'||room60.after.noiseArcActive)throw new Error(`Room 60 did not connect to Floor 1: ${JSON.stringify(room60)}`);

const unexpected=exceptions.filter(error=>!error.includes('Pointer Lock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({room55,room55Retry,room60,browserExceptions:0},null,2));
