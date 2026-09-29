const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9249';
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
await send('Page.bringToFront');
await evaluate(`(()=>{localStorage.setItem('infinite-hotel-arrival-items',JSON.stringify(['flashlight']));localStorage.setItem('escape-usable-inventory',JSON.stringify({spentGold:0,matchesBought:0,matchesUsed:0,vitamins:0,medkits:0,batteries:1,lockpicks:0,flashlightOn:true,flashlightCharge:20}))})()`);
await send('Page.reload',{ignoreCache:true});
await send('Page.bringToFront');
exceptions.length=0;
for(let attempt=0;attempt<150;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await wait(200);
 if(exceptions.length)throw new Error('Game module initialization exception: '+exceptions.join(' | '));
 if(attempt===149)throw new Error('Game module did not finish initializing');
}

await evaluate(`(()=>{if(document.hidden)Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value='floor2-entry';document.querySelector('#admin-teleport-go').onclick()})()`);
await wait(1800);
const drained=await evaluate(`(()=>{const inventory=JSON.parse(localStorage.getItem('escape-usable-inventory'));return{charge:inventory.flashlightCharge,on:inventory.flashlightOn,label:document.querySelector('[data-item="flashlight"] span')?.textContent,battery:document.querySelector('[data-item="flashlight-battery"]')!==null,storyHidden:document.querySelector('#story-select').hidden,dialogOpen:document.querySelector('#puzzle').open,title:document.querySelector('#title').textContent}})()`);
if(!(drained.charge<20&&drained.charge>17)||!drained.on||!drained.label?.includes('%')||!drained.battery)throw new Error('Flashlight did not drain or display charge correctly: '+JSON.stringify({drained,exceptions}));

await evaluate(`(()=>{document.querySelector('[data-item="flashlight-battery"]').click();document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}))})()`);
await wait(150);
const recharged=await evaluate(`(()=>{const inventory=JSON.parse(localStorage.getItem('escape-usable-inventory'));return{charge:inventory.flashlightCharge,on:inventory.flashlightOn,batteries:inventory.batteries,label:document.querySelector('[data-item="flashlight"] span')?.textContent,prompt:document.querySelector('#prompt').textContent}})()`);
if(recharged.charge<99||!recharged.on||recharged.batteries!==0||!recharged.label?.includes('100%')||!recharged.prompt.includes('100%'))throw new Error('Battery did not recharge the flashlight: '+JSON.stringify(recharged));

const sourceCheck=await evaluate(`Promise.all(__GAME_SOURCE_FILES__.map(filename=>fetch('game/'+filename,{cache:'no-store'}).then(response=>response.text()))).then(parts=>parts.join('\\n')).then(source=>({beam:source.includes('new THREE.SpotLight(0xffedc2,240,100'),drain:source.includes('FLASHLIGHT_DRAIN_PER_SECOND=.8'),empty:source.includes('FLASHLIGHT DEAD')}))`);
if(!sourceCheck.beam||!sourceCheck.drain||!sourceCheck.empty)throw new Error('Enhanced flashlight configuration is missing: '+JSON.stringify(sourceCheck));
const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));

socket.close();
console.log(JSON.stringify({beamIntensity:240,beamRange:100,drainedFrom:20,drainedTo:Number(drained.charge.toFixed(2)),batteryRecharge:Number(recharged.charge.toFixed(2)),batteriesRemaining:recharged.batteries},null,2));
