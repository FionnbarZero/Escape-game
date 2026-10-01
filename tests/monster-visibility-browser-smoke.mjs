const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9256';
const gameUrl=process.env.HOTEL_GAME_URL||'http://127.0.0.1:8765/';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const gameOrigin=new URL(gameUrl).origin;
const page=pages.find(entry=>entry.type==='page'&&entry.url.startsWith(gameOrigin))||pages.find(entry=>entry.type==='page'&&entry.url==='about:blank');
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
if(process.env.HOTEL_SKIP_NAVIGATION!=='1'){
 await send('Page.navigate',{url:`${gameUrl}?quality=low&verify=monster-visibility&cache=${Date.now()}`});
 await wait(6000);
}
for(let attempt=0;attempt<180;attempt++){
 if(await evaluate(`document.readyState==='complete'&&typeof repairActiveMonsterVisibility==='function'&&typeof optimizeConnectedHotelWorld==='function'&&typeof updateAdminMonsters==='function'`))break;
 await wait(100);
 if(attempt===179)throw new Error(`Game did not initialize: ${exceptions.join(' | ')}`);
}
exceptions.length=0;
const result=await evaluate(`(()=>{
 if(dlg.open)dlg.close();hideStorySelection();activeStory='hotel';inLobby=false;room=8;resetHotelSideScene();roomGroup=new THREE.Group();scene.add(roomGroup);
 const warningMesh=new THREE.Group();roomGroup.add(warningMesh);warningMesh.visible=false;adminMonsters=[{mesh:warningMesh,type:'bash',name:'Bash',phase:'warning',timer:1,natural:false}];journalPaused=false;updateAdminMonsters(.016,0);const warningVisible=warningMesh.visible;
 warningMesh.visible=false;repairActiveMonsterVisibility();const adminRecovered=warningMesh.visible;
 const current=roomGroup;current.visible=false;hotelConnectedChunks=[current];optimizeConnectedHotelWorld();const currentChunkSafe=current.visible&&!hotelConnectedChunks.includes(current)&&!current.userData.connectedChunkRetired;
 const addRoot=()=>{const root=new THREE.Group();current.add(root);root.visible=false;return root};collector={complete:false};collectorEntity=addRoot();clockmaker={complete:false};clockmakerEntity=addRoot();drowned={complete:false,dying:false};drownedEntity=addRoot();pursuer={complete:false,dying:false};pursuerEntity=addRoot();molly={dying:false};mollyEntity=addRoot();floorTwo={phase:11,windowPreview:false,windowCreatureIndex:2};floorTwoWindowCreature=addRoot();repairActiveMonsterVisibility();
 const campaignRecovered=[collectorEntity,clockmakerEntity,drownedEntity,pursuerEntity,mollyEntity,floorTwoWindowCreature].every(entity=>entity.visible);
 const hiddenNoise=addRoot();noiseEntity=hiddenNoise;const previewCreature=addRoot();floorTwoWindowCreature=previewCreature;floorTwo.windowPreview=true;const warningPurge=addRoot();eviction={phase:'warning'};evictionEntity=warningPurge;repairActiveMonsterVisibility();const intentionalHidden=!hiddenNoise.visible&&!previewCreature.visible&&!warningPurge.visible;
 return{warningVisible,adminRecovered,currentChunkSafe,campaignRecovered,intentionalHidden}
})()`);
if(Object.values(result).some(value=>!value))throw new Error(`Monster visibility recovery failed: ${JSON.stringify(result)}`);
const unexpected=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({...result,gameplayExceptions:0},null,2));
