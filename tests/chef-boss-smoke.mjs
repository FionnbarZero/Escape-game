const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9239';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=[...pages].reverse().find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1:8765'))||pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1'));
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
 if(attempt===149){const state=await evaluate(`({ready:document.readyState,title:document.title,scripts:[...document.scripts].map(script=>script.src||'inline')})`);throw new Error('Game module did not finish initializing: '+JSON.stringify({state,exceptions}))}
}
await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value='floor1-chef';document.querySelector('#admin-teleport-go').onclick()})()`);
await wait(500);
const initial=await evaluate(`(()=>({title:document.querySelector('#title').textContent,boss:document.querySelector('#boss-hud').classList.contains('active'),noise:document.querySelector('#noise-hud').classList.contains('active')}))()`);
const triggered=await evaluate(`(()=>({title:document.querySelector('#title').textContent,boss:document.querySelector('#boss-hud').classList.contains('active'),bossName:document.querySelector('#boss-name').textContent,noise:document.querySelector('#noise-hud').classList.contains('active'),run:JSON.parse(sessionStorage.getItem('infinite-hotel-floor-one'))}))()`);
if(initial.title!=='The Chef'||!triggered.boss||triggered.bossName!=='THE CHEF'||triggered.noise||!triggered.run?.chefTriggered)throw new Error('Chef boss setup did not initialize correctly: '+JSON.stringify({initial,triggered}));
if(triggered.run.chefStage!=='ranged')throw new Error('Unexpected Chef opening stage: '+triggered.run.chefStage);
const phaseChecks=[['floor1-chef-freezer','The Freezer','freezer','PHASE FOUR'],['floor1-chef-final','The Final Service','final-service','PHASE FIVE'],['floor1-chef-elevator','Elevator Finale','elevator-finale','PHASE SIX']];
const phases=[];
for(const [destination,expectedTitle,expectedStage,expectedPhase] of phaseChecks){
 await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value=${JSON.stringify(destination)};document.querySelector('#admin-teleport-go').onclick()})()`);
 await wait(220);
 const state=await evaluate(`(()=>({title:document.querySelector('#title').textContent,phase:document.querySelector('#boss-phase').textContent,boss:document.querySelector('#boss-hud').classList.contains('active'),noise:document.querySelector('#noise-hud').classList.contains('active'),run:JSON.parse(sessionStorage.getItem('infinite-hotel-floor-one'))}))()`);
 if(state.title!==expectedTitle||state.run?.chefStage!==expectedStage||!state.phase.includes(expectedPhase)||!state.boss||state.noise)throw new Error('Chef advanced phase failed: '+JSON.stringify({destination,state}));
 phases.push(state.run.chefStage);
}
const expectedMonsters=['bash','purge','noise','chef','collector','clockmaker','drowned-guest','pursuer','stair-monster','cable-mass','ballroom-guest','watcher','water-creature','gardener','window-creature','false-guest','spider','root','luggage-warden','empty-porter','black-bellhop','reflection','hotel-manager','night-auditor'];
const monsterOptions=await evaluate(`[...document.querySelector('#admin-monster').options].map(option=>option.value)`);
if(JSON.stringify(monsterOptions)!==JSON.stringify(expectedMonsters))throw new Error('Admin monster catalog mismatch: '+JSON.stringify(monsterOptions));
const monsterBehaviors=await evaluate(`[...document.querySelector('#admin-monster').options].map(option=>({id:option.value,behavior:option.dataset.behavior,pattern:option.dataset.pattern,wallMode:option.dataset.wallMode}))`);
if(new Set(monsterBehaviors.map(monster=>monster.behavior)).size!==expectedMonsters.length)throw new Error('Every admin monster must have a distinct behavior: '+JSON.stringify(monsterBehaviors));
if(monsterBehaviors.some(monster=>!monster.pattern)||new Set(monsterBehaviors.map(monster=>monster.pattern)).size!==expectedMonsters.length)throw new Error('Every admin monster must have a distinct visible movement pattern: '+JSON.stringify(monsterBehaviors));
const wallPhasers=monsterBehaviors.filter(monster=>monster.wallMode==='phase').map(monster=>monster.id);
if(JSON.stringify(wallPhasers)!==JSON.stringify(['purge','cable-mass','reflection']))throw new Error('Unexpected wall-phasing monsters: '+JSON.stringify(wallPhasers));
for(const monster of expectedMonsters){
 await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-monster');select.value=${JSON.stringify(monster)};document.querySelector('#admin-spawn').onclick()})()`);
 await wait(120);
 await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));document.querySelector('#admin-clear-monsters').onclick();document.querySelector('#admin-close').onclick()})()`);
}
const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));

socket.close();
console.log(JSON.stringify({title:triggered.title,stage:triggered.run.chefStage,advancedPhases:phases,adminMonsters:monsterOptions.length,uniqueBehaviors:monsterBehaviors.length,wallPhasers,noiseMeter:'disabled',bossHud:'active'},null,2));
