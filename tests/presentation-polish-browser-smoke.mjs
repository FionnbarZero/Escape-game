const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1:8765'));
if(!page)throw new Error('Hotel Nocturne browser page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown'){const details=message.params.exceptionDetails,description=details.exception?.description||details.exception?.value||details.text;exceptions.push(`${description} @ ${details.url||'unknown'}:${details.lineNumber||0}`)}if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const waitFor=async(expression,label)=>{for(let attempt=0;attempt<60;attempt++){if(await evaluate(expression))return;await new Promise(resolve=>setTimeout(resolve,200))}throw new Error(`Timed out waiting for ${label}`)};

await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:`http://127.0.0.1:8765/?quality=low&verify=presentation-polish&cache=${Date.now()}`});
await waitFor(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`,'game initialization');

const snapshot=()=>evaluate(`(()=>({story:document.body.dataset.story,inLobby,sideScene:hotelSideScene,mark:document.querySelector('#story-mark').textContent,brand:document.querySelector('#story-brand').innerHTML.replace(/<br\\s*\\/?>/gi,' ').replace(/\\s+/g,' ').trim(),progressLabel:document.querySelector('#progress-label').textContent,progress:document.querySelector('#count').textContent,roomLabel:document.querySelector('#room-label').textContent,room:document.querySelector('#room-number strong').textContent,sceneTitle:document.querySelector('#title').textContent,objectiveDisplay:getComputedStyle(document.querySelector('body>aside')).display,navOpacity:getComputedStyle(document.querySelector('body>nav')).opacity,compact:document.body.classList.contains('hud-compact'),title:document.title}))()`);
const lobby=await snapshot();
if(lobby.story!=='lobby'||lobby.brand!=='NIGHT LOBBY'||lobby.progress!=='READY')throw new Error(`Lobby HUD identity is stale: ${JSON.stringify(lobby)}`);

await evaluate(`chooseStory('hotel')`);
const hotel=await snapshot();
if(hotel.story!=='hotel'||hotel.mark!=='N'||hotel.brand!=='HOTEL NOCTURNE'||hotel.room!=='ARRIVAL'||hotel.objectiveDisplay==='none'||hotel.navOpacity!=='0')throw new Error(`Hotel HUD identity/navigation failed: ${JSON.stringify(hotel)}`);

await evaluate(`buildJailbreak(0)`);
const jailbreak=await snapshot();
if(jailbreak.story!=='jailbreak'||jailbreak.sideScene!==''||jailbreak.mark!=='B'||jailbreak.brand!=='BLACKRIDGE ESCAPE'||jailbreak.room!=='SECTOR 01'||jailbreak.progress!=='ACT 1 / 9'||jailbreak.objectiveDisplay==='none')throw new Error(`Jailbreak HUD identity/navigation failed: ${JSON.stringify(jailbreak)}`);

await evaluate(`buildRoom(0)`);
const cabin=await snapshot();
if(cabin.story!=='cabin'||cabin.sideScene!==''||cabin.mark!=='C'||cabin.brand!=='THE CABIN THAT WATCHES'||cabin.room!=='ROOM 01'||cabin.objectiveDisplay==='none')throw new Error(`Cabin HUD identity/navigation failed: ${JSON.stringify(cabin)}; exceptions=${JSON.stringify(exceptions)}`);

await evaluate(`adminTeleport('floor2-fireescape')`);
const exterior=await evaluate(`(()=>{let bump=false,occludedLabel=false;roomGroup.traverse(object=>{if(object.material?.bumpMap)bump=true;if(object.name?.startsWith('label:')&&object.material?.depthTest===true)occludedLabel=true});return{state:document.querySelector('#floor-two-room').textContent,title:document.querySelector('#title').textContent,bump,occludedLabel}})()`);
if(exterior.state!=='EXPOSED'||!exterior.title.startsWith('Room ')||!exterior.bump||!exterior.occludedLabel)throw new Error(`Floor 2 presentation/state failed: ${JSON.stringify(exterior)}`);

await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH',bubbles:true}))`);
const compact=await snapshot();
if(!compact.compact)throw new Error('H did not collapse the field HUD');
await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH',bubbles:true}))`);
const expanded=await snapshot();
if(expanded.compact)throw new Error('H did not restore the field HUD');

const gameplayExceptions=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock'));
if(gameplayExceptions.length)throw new Error(`Browser exceptions: ${JSON.stringify(gameplayExceptions)}`);
socket.close();
console.log(JSON.stringify({lobby,hotel,jailbreak,cabin,exterior,hudToggle:'passed',gameplayExceptions:0,pointerLockRejections:exceptions.length-gameplayExceptions.length},null,2));
