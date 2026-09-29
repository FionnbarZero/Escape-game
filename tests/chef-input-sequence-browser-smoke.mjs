const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9245';
const gamePort=process.env.HOTEL_GAME_PORT||'8766';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=[...pages].reverse().find(entry=>entry.type==='page'&&entry.url.includes(`127.0.0.1:${gamePort}`));
if(!page)throw new Error(`Hotel Nocturne page not found on port ${gamePort}`);

const socket=new WebSocket(page.webSocketDebuggerUrl),pending=new Map(),exceptions=[];
let nextId=0;
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
socket.addEventListener('message',event=>{
 const message=JSON.parse(event.data);
 if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
 if(!message.id)return;
 const request=pending.get(message.id);if(!request)return;
 pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)
});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
const key=async(type,code,keyValue,virtualKey)=>send('Input.dispatchKeyEvent',{type,code,key:keyValue,windowsVirtualKeyCode:virtualKey,nativeVirtualKeyCode:virtualKey});
const tap=async(code,keyValue,virtualKey,hold=45)=>{await key('keyDown',code,keyValue,virtualKey);await wait(hold);await key('keyUp',code,keyValue,virtualKey)};

await send('Runtime.enable');await send('Page.enable');
for(let attempt=0;attempt<360;attempt++){
 if(await evaluate(`document.body?.dataset?.gameReady||'loading'`)==='true')break;
 if(attempt===359)throw new Error('Fresh game did not become ready: '+JSON.stringify({state:await evaluate(`document.body?.dataset?.gameReady||'missing-body'`),exceptions}));
 await wait(250)
}

await evaluate(`adminTeleport('floor1-chef');keyboardMovementFallback=true`);
await wait(350);
const coldLoad=await evaluate(`({ready:document.body.dataset.gameReady,stage:floorOne.chefStage,health:floorOne.chefHealth,zones:floorOneChefCoolingZones.length,noise:document.querySelector('#noise-hud').classList.contains('active'),scripts:[...document.scripts].filter(script=>script.src.includes('/game/')).length})`);
if(coldLoad.ready!=='true'||coldLoad.stage!=='combat'||coldLoad.health!==100||coldLoad.zones!==3||coldLoad.noise)throw new Error('Fresh-load Chef setup failed: '+JSON.stringify(coldLoad));

// Stage a single visible ring at a known distance. The avoidance input itself
// travels through the real key handlers and player-height simulation.
const groundedRing=await evaluate(`(()=>{clearFloorOneChefArenaAttacks();floorOne.chefAction='recovery';floorOne.chefActionTimer=30;floorOneChef.position.set(0,0,0);camera.position.set(3,1.7,0);playerFeetY=0;playerGrounded=true;verticalVelocity=0;setStability(100);floorOne.chefDamageCooldown=0;spawnFloorOneChefShockwave(0);floorOneChefShockwaves[0].radius=2.7;updateFloorOneChefShockwaves(.04);return{stability,feet:playerFeetY,waves:floorOneChefShockwaves.length}})()`);
if(groundedRing.stability>=100)throw new Error('Grounded player was not damaged by passing shockwave: '+JSON.stringify(groundedRing));

await evaluate(`(()=>{clearFloorOneChefArenaAttacks(false);floorOne.chefAction='recovery';floorOne.chefActionTimer=30;camera.position.set(3,1.7,0);playerFeetY=0;playerGrounded=true;verticalVelocity=0;setStability(100);floorOne.chefDamageCooldown=0;spawnFloorOneChefShockwave(0)})()`);
await key('keyDown','Space',' ',32);await wait(80);await key('keyUp','Space',' ',32);await wait(50);
const jumpedRing=await evaluate(`(()=>{const inputStartedJump=!playerGrounded&&verticalVelocity>0;for(let step=0;step<8;step++)updateBasicPlayerHeight(.016);floorOneChefShockwaves[0].radius=2.7;updateFloorOneChefShockwaves(.04);return{stability,feet:playerFeetY,grounded:playerGrounded,jumpCharging,inputStartedJump}})()`);
if(!jumpedRing.inputStartedJump||jumpedRing.feet<=.48||jumpedRing.stability<100)throw new Error('Space-key jump did not avoid the shockwave: '+JSON.stringify(jumpedRing));

// Exercise the normal crouch key path against the active sweep volume.
const panBefore=await evaluate(`(()=>{clearFloorOneChefArenaAttacks(false);floorOne.chefAction='pan-active';floorOne.chefActionTimer=30;floorOne.chefPanHitApplied=false;floorOneChef.position.set(0,0,0);camera.position.set(0,1.7,2.8);playerFeetY=0;setStability(100);floorOne.chefDamageCooldown=0;return stability})()`);
await key('keyDown','KeyC','c',67);await wait(80);
const crouchHeld=await evaluate(`({held:keys.KeyC,cameraY:camera.position.y})`);
await evaluate(`updateFloorOneChefPanHit()`);
const panCrouched=await evaluate(`({stability,hit:floorOne.chefPanHitApplied})`);
await key('keyUp','KeyC','c',67);await wait(50);
await evaluate(`(()=>{floorOne.chefPanHitApplied=false;floorOne.chefDamageCooldown=0;updateFloorOneChefPanHit()})()`);
const panStanding=await evaluate(`({stability,hit:floorOne.chefPanHitApplied,held:keys.KeyC})`);
if(!crouchHeld.held||panCrouched.stability!==panBefore||panCrouched.hit||!panStanding.hit||panStanding.stability>=panCrouched.stability)throw new Error('Crouch-key pan counterplay failed: '+JSON.stringify({panBefore,crouchHeld,panCrouched,panStanding}));

async function counterWithValve(index){
 const staged=await evaluate(`(()=>{clearFloorOneChefArenaAttacks(false);const zone=floorOneChefCoolingZones[${index}],spec=FLOOR_ONE_CHEF_STATIONS[${index}];floorOne.chefActionSerial++;floorOne.chefCounteredSerial=-1;floorOne.chefAction='recovery';floorOne.chefActionTimer=30;floorOne.chefRecoveryZone=${index};floorOne.chefZoneCooldowns[${index}]=0;floorOneChef.position.set(zone.x,0,zone.z);camera.position.set(spec.station[0],1.7,spec.station[1]+4);camera.lookAt(spec.station[0],1.45,spec.station[1]+1.5);camera.updateMatrixWorld(true);roomGroup.updateMatrixWorld(true);return{health:floorOne.chefHealth,phase:floorOne.chefCombatPhase,zone:floorOne.chefRecoveryZone}})()`);
 await tap('KeyE','e',69);await wait(140);
 const result=await evaluate(`({health:floorOne.chefHealth,phase:floorOne.chefCombatPhase,count:floorOne.chefCounterCount,stage:floorOne.chefStage,exit:floorOne.chefExitUnlocked})`);
 return {staged,result}
}
const counters=[];
for(let index=0;index<3;index++)counters.push(await counterWithValve(index));
if(counters[0].result.health!==66||counters[0].result.phase!==2||counters[1].result.health!==32||counters[1].result.phase!==3||counters[2].result.health!==0||counters[2].result.stage!=='defeated'||!counters[2].result.exit)throw new Error('E-key cooling counter progression failed: '+JSON.stringify(counters));

await evaluate(`(()=>{camera.position.set(0,1.7,-14.2);camera.lookAt(0,1.7,-18.05);camera.updateMatrixWorld(true);roomGroup.updateMatrixWorld(true)})()`);
await tap('KeyE','e',69);await wait(180);
const elevator=await evaluate(`({stage:floorOne.chefStage,timer:floorOne.chefFinaleTimer,knives:floorOneChefKnives.length,waves:floorOneChefShockwaves.length,title:document.querySelector('#title').textContent})`);
if(elevator.stage!=='elevator-finale'||elevator.timer<=0||elevator.knives||elevator.waves||elevator.title!=='Elevator Escape')throw new Error('E-key elevator escape failed: '+JSON.stringify(elevator));

const unexpected=exceptions.filter(error=>!error.includes('Pointer Lock')&&!error.includes('requestPointerLock')&&!error.includes('WrongDocumentError'));
if(unexpected.length)throw new Error('Browser exceptions: '+unexpected.join(' | '));
socket.close();
console.log(JSON.stringify({coldLoad,groundedRing,jumpedRing,crouch:{crouchHeld,panCrouched,panStanding},counters,elevator,classification:'fresh cold launch; real Space/C/E input; debug-assisted arena access and scenario staging; not a normal campaign playthrough'},null,2));
