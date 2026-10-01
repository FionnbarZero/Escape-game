const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9250';
const gameUrl=process.env.HOTEL_GAME_URL||'http://127.0.0.1:8765/';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.startsWith(new URL(gameUrl).origin))||pages.find(entry=>entry.type==='page'&&entry.url==='about:blank')||pages.find(entry=>entry.type==='page');
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
await send('Page.navigate',{url:`${gameUrl}?quality=low&verify=hotel-run-encounters&cache=${Date.now()}`});
for(let attempt=0;attempt<600;attempt++){
 if(await evaluate(`document.body.dataset.gameReady==='true'&&typeof buildHotelRunRoom==='function'&&typeof maybeStartHotelRunPursuer==='function'`))break;
 await wait(100);
 if(attempt===599)throw new Error(`Game did not initialize: ready=${await evaluate('document.body.dataset.gameReady')} prompt=${await evaluate("document.querySelector('#prompt')?.textContent")} exceptions=${exceptions.join(' | ')}`);
}
exceptions.length=0;
const result=await evaluate(`(async()=>{
 if(dlg.open)dlg.close();hideStorySelection();activeStory='hotel';inLobby=false;room=8;sessionStorage.setItem('infinite-hotel-purge-complete-v1','true');hotelRunItems=new Set(['purge-survived']);hotelRunEncounters=newHotelRunEncounterState();hotelRunFloor=1;hotelRunRoom=2;buildHotelRunRoom();clearAdminMonsters();const curioTrigger=interactables.find(object=>object.userData.type==='hotel-run-curio');handleHotelRun('hotel-run-curio',curioTrigger);const curio={inventory:hotelRunItems.has('curio-102'),journal:journalCurios.has('curio-102'),roomTitle:document.querySelector('#title').textContent};if(dlg.open)dlg.close();
 scheduleRandomRoomMonster('browser:forced',hotelRunEncounters,saveHotelRunEncounters,{chance:1,cooldownRooms:1,allowed:['bash']});
 await new Promise(resolve=>setTimeout(resolve,2900));
 const monster={count:adminMonsters.length,visible:adminMonsters[0]?.mesh.visible===true,type:adminMonsters[0]?.type,pending:document.body.dataset.randomMonsterPending||''};
 clearAdminMonsters();hotelRunFloor=1;hotelRunRoom=4;hotelRunItems.add('floor-2-key');buildHotelRunRoom();const boss=roomGroup.children.find(child=>child.name.startsWith('hotel run boss'));
 const bossResult={name:boss?.name||'',visible:boss?.visible===true,meshCount:boss?.children.filter(child=>child.isMesh).length||0};
 hotelRunFloor=1;hotelRunRoom=4;hotelRunEncounters.pursuerRooms=[];const chaseStarted=maybeStartHotelRunPursuer(1,3),chase={started:chaseStarted,origin:pursuer?.origin,scene:pursuer?.scene,hotelScene:hotelSideScene};
 resumePursuerOrigin();
 return{curio,monster,boss:bossResult,chase,returned:{floor:hotelRunFloor,room:hotelRunRoom,scene:hotelSideScene,title:document.querySelector('#title').textContent}}
})()`);
if(!result.curio.inventory||!result.curio.journal||!result.curio.roomTitle.includes('THE HOUSEKEEPING DEPOT'))throw new Error(`Room keepsake failed: ${JSON.stringify(result)}`);
if(result.monster.count!==1||!result.monster.visible||result.monster.type!=='bash'||result.monster.pending)throw new Error(`Natural monster failed to appear: ${JSON.stringify(result)}`);
if(!result.boss.visible||result.boss.meshCount<3)throw new Error(`Boss model did not render: ${JSON.stringify(result)}`);
if(!result.chase.started||result.chase.origin!=='hotel-run'||!result.chase.hotelScene.startsWith('pursuer-'))throw new Error(`Pursuer milestone failed: ${JSON.stringify(result)}`);
if(result.returned.scene!=='hotel-run'||result.returned.floor!==1||result.returned.room!==4)throw new Error(`Pursuer did not return to the run: ${JSON.stringify(result)}`);
const unexpected=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({...result,gameplayExceptions:0},null,2));
