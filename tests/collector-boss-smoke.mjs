const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9241';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1'));
if(!page)throw new Error('Hotel Nocturne page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown'){const details=message.params.exceptionDetails;exceptions.push(`${details.exception?.description||details.text} at ${details.url||'unknown'}:${details.lineNumber+1}:${details.columnNumber+1}`)}if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value};
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

const phaseChecks=[
 ['collector-entry','THE LOST PROPERTY DEPARTMENT','PHASE ONE',1],
 ['collector-medallion','THE LOST PROPERTY DEPARTMENT','PHASE THREE',3],
 ['collector-watch','THE LOST PROPERTY DEPARTMENT','PHASE FOUR',4],
 ['collector-room','THE COLLECTION ROOM','PHASE SIX',6],
 ['collector-release','EVERYTHING IS RELEASED','PHASE SEVEN',7],
 ['collector-escape','THE BAGGAGE CORRIDOR','PHASE EIGHT',8]
];
const phases=[];
for(const [destination,expectedTitle,expectedPhase,expectedStage] of phaseChecks){
 await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value=${JSON.stringify(destination)};document.querySelector('#admin-teleport-go').onclick()})()`);
 await wait(220);
 const state=await evaluate(`(()=>({title:document.querySelector('#title').textContent,phase:document.querySelector('#boss-phase').textContent,boss:document.querySelector('#boss-hud').classList.contains('active'),bossName:document.querySelector('#boss-name').textContent,noise:document.querySelector('#noise-hud').classList.contains('active'),run:JSON.parse(sessionStorage.getItem('infinite-hotel-collector'))}))()`);
 if(state.title!==expectedTitle||!state.phase.includes(expectedPhase)||state.run?.phase!==expectedStage||!state.boss||state.bossName!=='THE COLLECTOR'||state.noise)throw new Error('Collector phase failed: '+JSON.stringify({destination,state}));
 phases.push(state.run.phase);
}
const controls=await evaluate(`(()=>({teleports:[...document.querySelector('#admin-teleport').options].filter(option=>option.value.startsWith('collector-')).map(option=>option.value),monster:[...document.querySelector('#admin-monster').options].some(option=>option.value==='collector'),room140:[...document.querySelector('#admin-teleport').options].some(option=>option.value==='room140')}))()`);
if(controls.teleports.length!==6||!controls.monster||!controls.room140)throw new Error('Collector admin controls are incomplete: '+JSON.stringify(controls));
const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));

socket.close();
console.log(JSON.stringify({boss:'THE COLLECTOR',phases,adminTeleports:controls.teleports.length,monsterSpawnOption:controls.monster,noiseMeter:'disabled'},null,2));
