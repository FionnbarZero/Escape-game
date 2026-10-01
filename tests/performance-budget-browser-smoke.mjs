const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9250';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1:8765'));
if(!page)throw new Error('Hotel Nocturne browser page not found');
const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:`http://127.0.0.1:8765/?quality=medium&verify=performance-budget&cache=${Date.now()}`});
await wait(500);
for(let attempt=0;attempt<180;attempt++){
 if(await evaluate(`document.readyState==='complete'&&typeof optimizeConnectedHotelWorld==='function'&&typeof buildHotelRunRoom==='function'&&typeof updateAdaptiveGraphicsPerformance==='function'`))break;
 await wait(100);
 if(attempt===179)throw new Error(`Game did not initialize: ${exceptions.join(' | ')}`);
}
exceptions.length=0;

const result=await evaluate(`(async()=>{
 if(dlg.open)dlg.close();hideStorySelection();clearConnectedHotelWorld();cancelEviction();cancelNoise();cancelHotelNoiseArc();sessionStorage.setItem('infinite-hotel-purge-complete-v1','true');activeStory='hotel';inLobby=false;room=8;hotelRunFloor=1;hotelRunRoom=1;hotelRunItems=new Set(['key-102','maintenance-wire','elevator-pass','guest-ledger','purge-survived',...hotelBossCatalog.flat().map(boss=>boss.key)]);buildHotelRunRoom();
 const deltas=[];
 for(let index=0;index<8;index++){
  const sourceGroup=roomGroup,fakeDoor=new THREE.Object3D();sourceGroup.add(fakeDoor);hotelRoomPassage={door:fakeDoor,blocker:null,threshold:-10,boundary:12,x:0,doorWidth:3.2,progress:1,sourceGroup,advance:()=>{hotelRunRoom=hotelRunRoom%4+1;buildHotelRunRoom()}};camera.position.set(0,1.7,-10.1);camera.updateMatrixWorld(true);const before=camera.getWorldPosition(new THREE.Vector3());updateHotelRoomPassage(.016);camera.updateMatrixWorld(true);const after=camera.getWorldPosition(new THREE.Vector3());deltas.push(before.distanceTo(after));
 }
 renderer.render(scene,camera);
 let visibleObjects=0,visibleLights=0,shadowLights=0;scene.traverseVisible(object=>{visibleObjects++;if(object.isLight){visibleLights++;if(object.castShadow)shadowLights++}});
 const renderStarted=performance.now();for(let index=0;index<20;index++)renderer.render(scene,camera);const renderMean=(performance.now()-renderStarted)/20;
 return{chunks:hotelConnectedChunks.length+1,detailed:Number(document.body.dataset.hotelWorldDetailedChunks),visible:Number(document.body.dataset.hotelWorldVisibleChunks),retired:hotelConnectedChunks.filter(chunk=>chunk.userData.connectedChunkRetired).length,maximumCameraDelta:Math.max(...deltas),render:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,visibleObjects,visibleLights,shadowLights,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,meanCpuMs:renderMean},graphics:graphicsSnapshot(),transition:document.body.dataset.hotelTransition}
})()`);
if(result.chunks!==9||result.detailed>2||result.visible>1||result.retired<7||result.maximumCameraDelta>.001||result.render.shadowLights>1||result.render.calls>220||result.transition!=='connected')throw new Error(`Performance budget failed: ${JSON.stringify(result)}`);
const unexpected=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({...result,gameplayExceptions:0},null,2));
