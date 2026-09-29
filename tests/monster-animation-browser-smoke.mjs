const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9251';
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
await send('Page.reload',{ignoreCache:true});
for(let attempt=0;attempt<180;attempt++){
 if(await evaluate(`document.body?.dataset?.gameReady==='true'&&typeof message==='function'&&typeof startMolly==='function'&&typeof updateFloorOneChefKnives==='function'&&typeof updatePursuer==='function'&&typeof updateFloorTwo==='function'&&typeof updateMonsterDebugOverlay==='function'`))break;
 await wait(200);
 if(attempt===179)throw new Error(`Game did not initialize: ${exceptions.join(' | ')}`);
}
exceptions.length=0;

const molly=await evaluate(`(()=>{
 hideStorySelection();startMolly(true,'monster-animation-smoke');if(dlg.open)dlg.close();molly.grace=999;molly.selectionTimer=999;
 cancelMollyFlare();molly.targetComputer=2;molly.pendingComputer=0;molly.phase='hack';molly.timer=2;mollySetDisplay(2);mollyEntity.position.fromArray(MOLLY_COMPUTER_POSITIONS[1]);
 const sound=new THREE.Vector3(8,0,5);mollyHearSound(sound,1.4,'diagnostic window crash');
 const interrupted={pending:molly.pendingComputer,target:molly.targetComputer,display:molly.display,phase:molly.phase,lastSound:[...molly.lastSound],hacked:[...molly.hacked]};
 cancelMollyFlare();molly.phase='search';molly.timer=1;mollyEntity.position.copy(sound);updateMolly(.1,1);molly.phase='search-wait';molly.timer=.01;updateMolly(.02,1.02);
 const resumed={target:molly.targetComputer,display:molly.display,phase:molly.phase,hacked:[...molly.hacked],position:mollyEntity.position.toArray()};
 document.dispatchEvent(new KeyboardEvent('keydown',{code:'F4',bubbles:true}));updateMonsterDebugOverlay();
 const debug={enabled:aiDebugEnabled,visible:!document.querySelector('#ai-debug').hidden,entity:document.querySelector('[data-ai="entity"]').textContent,state:document.querySelector('[data-ai="state"]').textContent};
 document.dispatchEvent(new KeyboardEvent('keydown',{code:'F4',bubbles:true}));
 return{interrupted,resumed,debug};
})()`);
if(molly.interrupted.pending!==2||molly.interrupted.target!==0||molly.interrupted.display!=='00'||molly.interrupted.phase!=='listening'||molly.interrupted.lastSound.join(',')!=='8,0,5'||molly.interrupted.hacked.includes(2))throw new Error('Molly did not preserve an interrupted terminal target while investigating a fixed sound: '+JSON.stringify(molly));
if(molly.resumed.target!==2||molly.resumed.display!=='02'||molly.resumed.phase!=='select'||molly.resumed.hacked.includes(2))throw new Error('Molly did not physically resume the interrupted terminal route: '+JSON.stringify(molly));
if(!molly.debug.enabled||!molly.debug.visible||molly.debug.entity!=='MOLLY')throw new Error('AI developer overlay did not report Molly: '+JSON.stringify(molly.debug));

const chef=await evaluate(`(()=>{
 floorOne=newFloorOneRun();floorOne.phase=10;floorOne.chefStage='ranged';floorOne.chefTriggered=true;buildFloorOnePhase();floorOne.chefDamageCooldown=0;floorOneChef.visible=true;floorOneChef.position.set(0,0,0);floorOneChef.updateMatrixWorld(true);
 const expected=floorOneChef.userData.throwHand.getWorldPosition(new THREE.Vector3());spawnFloorOneChefKnife(0,9,12,'diagnostic');const released=floorOneChefKnives.at(-1),releaseDistance=new THREE.Vector3().fromArray(released.releaseOrigin).distanceTo(expected),velocityBefore=released.velocity.toArray();camera.position.set(10,1.7,-10);const committed=velocityBefore.join(',')===released.velocity.toArray().join(',');
 clearFloorOneChefAttacks();const material=new THREE.MeshBasicMaterial(),projectile=new THREE.Mesh(new THREE.BoxGeometry(.1,.14,1.05),material);projectile.position.set(0,1.45,0);roomGroup.add(projectile);const coverMesh=new THREE.Mesh(new THREE.BoxGeometry(1.2,2.4,.3),material);coverMesh.position.set(0,1.2,1);roomGroup.add(coverMesh);const cover={mesh:coverMesh,halfX:.6,halfZ:.15,bottom:0,top:2.4};solidColliders.push(cover);const covered={mesh:projectile,velocity:new THREE.Vector3(0,0,12),life:4,stuck:false,hitApplied:false,pattern:'diagnostic'};floorOneChefKnives.push(covered);camera.position.set(7,1.7,7);updateFloorOneChefKnives(.12);const coverStopped=covered.stuck&&covered.velocity.lengthSq()===0;solidColliders=solidColliders.filter(entry=>entry!==cover);coverMesh.removeFromParent();clearFloorOneChefAttacks();
 const hitMesh=new THREE.Mesh(new THREE.BoxGeometry(.1,.14,1.05),material);hitMesh.position.set(0,1.45,0);roomGroup.add(hitMesh);camera.position.set(0,1.7,1);playerFeetY=0;keys.KeyC=false;const hitKnife={mesh:hitMesh,velocity:new THREE.Vector3(0,0,12),life:4,stuck:false,hitApplied:false,pattern:'diagnostic'};floorOneChefKnives.push(hitKnife);const originalDamage=damageFloorOneChef;let hits=0;damageFloorOneChef=()=>{hits++};updateFloorOneChefKnives(.12);updateFloorOneChefKnives(.12);damageFloorOneChef=originalDamage;const oneHit=hits===1&&!floorOneChefKnives.includes(hitKnife);
 clearFloorOneChefAttacks();return{releaseDistance,committed,coverStopped,oneHit,hits,remaining:floorOneChefKnives.length};
})()`);
if(chef.releaseDistance>.001||!chef.committed||!chef.coverStopped||!chef.oneHit||chef.remaining)throw new Error('Chef physical knife regression: '+JSON.stringify(chef));

const pursuer=await evaluate(`(()=>{
 startPursuerEncounter(1,'admin',true);if(dlg.open)dlg.close();beginPursuerRunInPlace();pursuer.stun=0;pursuer.acceleration=0;pursuerEntity.position.set(0,0,12);camera.position.set(0,1.7,-5);playerFeetY=0;
 const before=pursuerEntity.position.clone();updatePursuer(.2,2);const after=pursuerEntity.position.clone(),performance={moved:before.distanceTo(after),acceleration:pursuer.acceleration,gait:pursuer.gaitDistance,stage:pursuer.actionStage};
 handlePursuer('gate:0');const barrierBefore=pursuerEntity.position.clone();updatePursuer(.1,2.1);const barrier={moved:barrierBefore.distanceTo(pursuerEntity.position),reaction:pursuer.barrierReaction,stage:pursuer.actionStage,gate:pursuer.gates.includes(0)};
 return{performance,barrier};
})()`);
if(pursuer.performance.moved<=0||pursuer.performance.acceleration<=0||pursuer.performance.acceleration>=1||pursuer.performance.gait<=0||pursuer.barrier.moved>.0001||pursuer.barrier.reaction<=0||!pursuer.barrier.gate)throw new Error('Pursuer performance regression: '+JSON.stringify(pursuer));

const floor2=await evaluate(`(()=>{
 floorTwo=newFloorTwoRun();floorTwo.phase=7;buildFloorTwoPhase();floorTwo.watcherSolved=false;const watcher=floorTwoWatcher;camera.position.set(0,1.7,8);camera.lookAt(watcher.position.x,1.8,watcher.position.z);const watchedBefore=watcher.position.clone();updateFloorTwo(.25,3,false);const frozen=watcher.userData.watched&&watcher.position.distanceTo(watchedBefore)<1e-7;
 floorTwo.phase=6;buildFloorTwoPhase();const guest=floorTwoGuests[0];guest.userData.tagged=true;floorTwo.ballroomTagged.push(guest.userData.index);guest.position.set(camera.position.x,0,camera.position.z);const originalFail=failFloorTwo;let taggedHits=0;failFloorTwo=()=>{taggedHits++};updateFloorTwo(.5,4,false);failFloorTwo=originalFail;return{watcherFrozen:frozen,taggedGuestHit:taggedHits,tagged:guest.userData.tagged};
})()`);
if(!floor2.watcherFrozen||floor2.taggedGuestHit!==0||!floor2.tagged)throw new Error('Floor 2 identity regression: '+JSON.stringify(floor2));

const unexpected=exceptions.filter(error=>!error.includes('Pointer Lock')&&!error.includes('requestPointerLock'));
if(unexpected.length)throw new Error('Browser exceptions: '+unexpected.join(' | '));

console.log(JSON.stringify({
 kind:'direct-state browser diagnostic (not a normal campaign playthrough)',
 molly,
 chef,
 pursuer,
 floor2,
 unexpectedExceptions:unexpected.length
},null,2));
socket.close();
await wait(50);
process.exit(0);
