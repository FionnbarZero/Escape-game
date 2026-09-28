const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1'));
if(!page)throw new Error('Hotel Nocturne page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown'){const details=message.params.exceptionDetails;exceptions.push(`${details.exception?.description||details.text} at ${details.url||'unknown'}:${details.lineNumber+1}:${details.columnNumber+1}`)}if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

await send('Runtime.enable');
await send('Page.enable');
await send('Page.reload',{ignoreCache:true});
exceptions.length=0;
for(let attempt=0;attempt<150;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await wait(200);
 if(exceptions.length)throw new Error('Game module initialization exception: '+exceptions.join(' | '));
 if(attempt===149)throw new Error('Game module did not finish initializing');
}

await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value='molly-electrical';document.querySelector('#admin-teleport-go').onclick()})()`);
await wait(350);
const entry=await evaluate(`(()=>{const blockedRouteNodes=MOLLY_ROUTE_NODES.map((node,index)=>({index,blocked:playerHitsSolid(new THREE.Vector3(node[0],1.7,node[2]))})).filter(item=>item.blocked&&!mollyRouteNodeBlocked(item.index)).map(item=>item.index),seen=new Set([0]),queue=[0];while(queue.length){const current=queue.shift();for(const next of MOLLY_ROUTE_LINKS[current]||[]){if(mollyRouteNodeBlocked(next)||seen.has(next))continue;seen.add(next);queue.push(next)}}return{title:document.querySelector('#title').textContent,boss:document.querySelector('#boss-name').textContent,bossActive:document.querySelector('#boss-hud').classList.contains('active'),noiseActive:document.querySelector('#noise-hud').classList.contains('active'),run:JSON.parse(sessionStorage.getItem('hotel-molly-run')),computers:mollyComputers.length,intercoms:mollyIntercoms.length,doors:mollyDoors.length,cameras:mollyCameras.length,wires:mollyEntity.userData.wires.length,arms:mollyEntity.userData.arms.length,screen:molly.display,model:mollyEntity.name,doorOpen:mollyDoors.map(door=>door.open),routeBoard:Boolean(roomGroup.getObjectByName('electrical layout board')),fan:Boolean(roomGroup.getObjectByName('ventilation fan landmark')),codeMachine:Boolean(roomGroup.getObjectByName('DOOR OVERRIDE CODES machine')),finalStatus:mollyFinalStatus.userData.text,blockedRouteNodes,reachableRouteNodes:seen.size}})()`);
if(entry.title!=='Molly · Door Control Network'||entry.boss!=='MOLLY'||!entry.bossActive||entry.noiseActive||entry.computers!==6||entry.intercoms!==4||entry.doors!==3||entry.cameras!==6||entry.wires!==16||entry.arms!==2||entry.screen!=='00'||!entry.model.includes('blind computer monster')||entry.doorOpen.some(open=>!open)||!entry.routeBoard||!entry.fan||!entry.codeMachine||entry.finalStatus!=='EXIT POWER · 0/3 LEVERS'||entry.blockedRouteNodes.length||entry.reachableRouteNodes!==27)throw new Error('Molly section did not initialize correctly: '+JSON.stringify(entry));

const sound=await evaluate(`(()=>{mollyHearSound(new THREE.Vector3(17,0,-11),1.4,'test beep');return{lastSound:molly.lastSound,strength:molly.soundStrength,display:molly.display,phase:molly.phase,flare:molly.flare?.style,route:mollyPlanRoute([17,0,-11]).length}})()`);
if(sound.lastSound.join(',')!=='17,0,-11'||sound.strength!==1.4||sound.display!=='00'||sound.phase!=='listening'||sound.flare!=='focused'||sound.route<2)throw new Error('Molly did not plan a physical route to the supplied sound: '+JSON.stringify(sound));

const selection=await evaluate(`(()=>{cancelMollyFlare();molly.targetComputer=4;mollySetDisplay(4);molly.phase='computer-travel';return{display:molly.display,phase:molly.phase,code:mollyComputerCode(4),route:mollyPlanRoute(MOLLY_COMPUTER_POSITIONS[3]).length}})()`);
if(selection.display!=='04'||selection.phase!=='computer-travel'||selection.code!=='0417'||selection.route<1)throw new Error('Molly computer selection is not trustworthy: '+JSON.stringify(selection));

const shortcuts=await evaluate(`(()=>{molly.hammerTaken=true;handleMolly('window');endMollyCameraFeed();mollyDroneDistraction();const result={windowOpen:molly.brokenWindow,windowBlocker:Boolean(roomGroup.getObjectByName('Molly breakable window blocker')),latchOpen:molly.droneLatchOpen,latchBlocker:Boolean(roomGroup.getObjectByName('Molly drone shortcut blocker')),droneFeed:molly.cameraView?.kind,droneLabel:molly.cameraView?.label};endMollyCameraFeed();return result})()`);
if(!shortcuts.windowOpen||shortcuts.windowBlocker||!shortcuts.latchOpen||shortcuts.latchBlocker||shortcuts.droneFeed!=='drone'||!shortcuts.droneLabel)throw new Error('Molly shortcut systems failed: '+JSON.stringify(shortcuts));

const ending=await evaluate(`(()=>{cancelMollyFlare();molly.phase='patrol';pullMollyLever(0);pullMollyLever(1);pullMollyLever(2);const exitTrigger=interactables.find(object=>object.userData.type==='molly'&&object.userData.part==='exit');const before={levers:molly.levers.length,finalUnlocked:molly.finalUnlocked,phase:molly.phase,status:mollyFinalStatus.userData.text,lights:mollyProgressLights.map(light=>light.material.emissive.getHex()),blocker:Boolean(roomGroup.getObjectByName('Molly final exit blocker'))};handleMolly('exit',exitTrigger);return{...before,passage:Boolean(hotelRoomPassage),blockerAfter:Boolean(roomGroup.getObjectByName('Molly final exit blocker'))}})()`);
if(ending.levers!==3||!ending.finalUnlocked||ending.phase!=='final-travel'||ending.status!=='EXIT POWERED · DOOR READY'||ending.lights.some(value=>value!==0x25a96b)||!ending.blocker||!ending.passage||ending.blockerAfter)throw new Error('Molly final lever and protected exit sequence failed: '+JSON.stringify(ending));

const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));
socket.close();
console.log(JSON.stringify({scene:'connected Electrical Section',terminals:entry.computers,cameras:entry.cameras,wireBundles:entry.wires,soundRouteNodes:sound.route,selectedComputer:selection.display,shortcuts:['hammer window','drone latch'],shuttersInitially:'open',leverProgress:'permanent',finalExit:'walk-through protected connector',noiseMeter:'disabled'},null,2));
