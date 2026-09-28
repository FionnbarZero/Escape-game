const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9250';
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
await evaluate(`(()=>{localStorage.setItem('infinite-hotel-arrival-items',JSON.stringify(['flashlight']));localStorage.setItem('escape-usable-inventory',JSON.stringify({spentGold:0,matchesBought:0,matchesUsed:0,vitamins:0,medkits:0,bandages:0,energyDrinks:0,glowsticks:0,decoys:0,batteries:0,lockpicks:0,flashlightOn:true,flashlightCharge:100}));localStorage.removeItem('escape-admin-items')})()`);
await send('Page.reload',{ignoreCache:true});
exceptions.length=0;
for(let attempt=0;attempt<50;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-give-item')?.onclick==='function'`))break;
 await wait(200);
 if(exceptions.length)throw new Error('Game module initialization exception: '+exceptions.join(' | '));
 if(attempt===49)throw new Error('Game module did not finish initializing: '+exceptions.join(' | '));
}

await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const teleport=document.querySelector('#admin-teleport');teleport.value='floor1-entry';document.querySelector('#admin-teleport-go').onclick();for(const id of ['bandage','energy-drink','glowstick','wind-up-decoy']){document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const item=document.querySelector('#admin-item');item.value=id;document.querySelector('#admin-give-item').onclick()}document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}))})()`);
await wait(250);
const expanded=await evaluate(`(()=>{const inventory=JSON.parse(localStorage.getItem('escape-usable-inventory'));return{inventory,slots:[...document.querySelectorAll('#inventory-slots .inventory-slot')].map(slot=>slot.dataset.item),adminItems:[...document.querySelectorAll('#admin-item option')].map(option=>option.value)}})()`);
for(const id of ['flashlight','bandage','energy-drink','glowstick','wind-up-decoy'])if(!expanded.slots.includes(id))throw new Error(`Five-slot Floor 1 inventory is missing ${id}: `+JSON.stringify(expanded));
for(const id of ['bandage','energy-drink','glowstick','wind-up-decoy'])if(!expanded.adminItems.includes(id))throw new Error(`Admin inventory is missing ${id}`);
if(expanded.inventory.bandages!==5||expanded.inventory.energyDrinks!==5||expanded.inventory.glowsticks!==5||expanded.inventory.decoys!==5)throw new Error('Admin did not grant functional item stacks: '+JSON.stringify(expanded.inventory));

await evaluate(`(()=>{document.querySelector('[data-item="energy-drink"]').click();document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}));document.querySelector('[data-item="glowstick"]').click();document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyQ',bubbles:true}))})()`);
await wait(100);
const used=await evaluate(`(()=>{const inventory=JSON.parse(localStorage.getItem('escape-usable-inventory'));return{energy:inventory.energyDrinks,glow:inventory.glowsticks,prompt:document.querySelector('#prompt').textContent}})()`);
if(used.energy!==4||used.glow!==4||!used.prompt.includes('GLOW STICK'))throw new Error('New consumables did not activate and decrement: '+JSON.stringify(used));

const sourceCheck=await evaluate(`Promise.all(__GAME_SOURCE_FILES__.map(filename=>fetch('game/'+filename,{cache:'no-store'}).then(response=>response.text()))).then(parts=>parts.join('\\n')).then(source=>({fiveSlots:source.includes('gear.slice(0,5)'),standardLoot:source.includes("function drawerLootFor(id,tier='standard')"),premiumLoot:source.includes("'floor-one','premium'"),floorFive:source.includes("grantDrawerLoot(id,'floor-five')"),floorTwo:source.includes("grantDrawerLoot(id,'floor-two')"),noiseArc:source.includes("'noise-arc','premium'"),decoy:source.includes('function useWindUpDecoy()')}))`);
if(Object.values(sourceCheck).some(value=>!value))throw new Error('Inventory or drawer integration is incomplete: '+JSON.stringify(sourceCheck));
const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));

socket.close();
console.log(JSON.stringify({floorOneSlots:expanded.slots,newStacks:{bandages:expanded.inventory.bandages,energyDrinks:expanded.inventory.energyDrinks,glowsticks:expanded.inventory.glowsticks,decoys:expanded.inventory.decoys},afterUse:used,drawerIntegration:sourceCheck},null,2));
