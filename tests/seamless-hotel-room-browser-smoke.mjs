const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1:8765'));
if(!page)throw new Error('Seamless hotel test page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map();
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value};

await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:`http://127.0.0.1:8765/?quality=low&verify=seamless-hotel&cache=${Date.now()}`});
for(let attempt=0;attempt<600;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await new Promise(resolve=>setTimeout(resolve,100));
 if(attempt===599)throw new Error('Game module did not initialize');
}

const rendered=[];
for(const destination of ['floor5-entry','floor1-entry','floor2-entry']){
 const state=await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value=${JSON.stringify(destination)};document.querySelector('#admin-teleport-go').onclick();return{destination:${JSON.stringify(destination)},transition:document.body.dataset.hotelTransition,title:document.querySelector('#title').textContent,blackout:document.querySelector('#blackout').classList.contains('show'),layout:${destination==='floor5-entry'?"JSON.parse(sessionStorage.getItem('infinite-hotel-floor-five')).opening[0].layout":'null'}}})()`);
 if(state.transition!=='door-ready'||state.blackout)throw new Error(`Connected doorway failed to render: ${JSON.stringify(state)}`);
 rendered.push(state);
 await new Promise(resolve=>setTimeout(resolve,120));
}

const continuity=await evaluate(`(()=>{
 cancelEviction();cancelNoise();cancelHotelNoiseArc();sessionStorage.setItem('infinite-hotel-purge-complete-v1','true');hotelRunFloor=1;hotelRunRoom=1;hotelRunItems=new Set(['key-102','purge-survived']);buildHotelRunRoom();
 const sourceGroup=roomGroup,trigger=interactables.find(object=>object.userData.type==='hotel-run-exit');if(!trigger)throw new Error('Hotel run exit trigger missing');
 handleHotelRun('hotel-run-exit',trigger);if(!hotelRoomPassage)throw new Error('Walking passage did not open');hotelRoomPassage.progress=1;camera.position.set(hotelRoomPassage.x,1.7,hotelRoomPassage.threshold-.08);camera.updateMatrixWorld(true);const before=camera.getWorldPosition(new THREE.Vector3()).toArray();updateHotelRoomPassage(.016);camera.updateMatrixWorld(true);const after=camera.getWorldPosition(new THREE.Vector3()).toArray();
 const first={transition:document.body.dataset.hotelTransition,sourcePreserved:sourceGroup.parent===scene&&hotelConnectedChunks.includes(sourceGroup),newChunk:roomGroup!==sourceGroup,cameraInChunk:camera.parent===roomGroup,room:hotelRunRoom,worldDelta:new THREE.Vector3(...before).distanceTo(new THREE.Vector3(...after)),newOrigin:roomGroup.position.toArray()};
 hotelRunItems.add('maintenance-wire');const secondSource=roomGroup,secondTrigger=interactables.find(object=>object.userData.type==='hotel-run-exit');handleHotelRun('hotel-run-exit',secondTrigger);hotelRoomPassage.progress=1;camera.position.set(hotelRoomPassage.x,1.7,hotelRoomPassage.threshold-.08);camera.updateMatrixWorld(true);const secondBefore=camera.getWorldPosition(new THREE.Vector3()).toArray();updateHotelRoomPassage(.016);camera.updateMatrixWorld(true);const secondAfter=camera.getWorldPosition(new THREE.Vector3()).toArray();
 return{...first,chunkCount:hotelConnectedChunks.length+1,datasetChunks:Number(document.body.dataset.hotelWorldChunks),secondSourcePreserved:secondSource.parent===scene&&hotelConnectedChunks.includes(secondSource),secondRoom:hotelRunRoom,secondWorldDelta:new THREE.Vector3(...secondBefore).distanceTo(new THREE.Vector3(...secondAfter)),secondOrigin:roomGroup.position.toArray(),blackout:document.querySelector('#blackout').classList.contains('show'),prompt:document.querySelector('#prompt').textContent}
})()`);
if(continuity.transition!=='connected'||continuity.chunkCount!==3||continuity.datasetChunks!==3||!continuity.sourcePreserved||!continuity.secondSourcePreserved||!continuity.newChunk||!continuity.cameraInChunk||continuity.room!==2||continuity.secondRoom!==3||continuity.worldDelta>.001||continuity.secondWorldDelta>.001||Math.abs(continuity.newOrigin[2])<1||Math.abs(continuity.secondOrigin[2])<=Math.abs(continuity.newOrigin[2])||continuity.blackout)throw new Error(`Physical room continuity failed: ${JSON.stringify(continuity)}`);

socket.close();
console.log(JSON.stringify({rendered,continuity,blackoutUsed:false,cameraTeleport:false},null,2));
