const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9248';
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
await evaluate(`(()=>{localStorage.removeItem('escape-admin-items');localStorage.removeItem('infinite-hotel-arrival-items');localStorage.removeItem('escape-usable-inventory');sessionStorage.removeItem('infinite-hotel-run-items');location.reload()})()`);
for(let attempt=0;attempt<150;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await wait(200);
 if(attempt===149)throw new Error('Game module did not finish initializing');
}
exceptions.length=0;
await evaluate(`(()=>{const teleport=document.querySelector('#admin-teleport');teleport.value='floor5-entry';document.querySelector('#admin-teleport-go').onclick();const item=document.querySelector('#admin-item');item.value='flashlight';document.querySelector('#admin-give-item').onclick()})()`);
await wait(120);
const held=await evaluate(`(()=>({held:document.body.dataset.heldItem,slot:Boolean(document.querySelector('.inventory-slot[data-item="flashlight"]')),action:document.body.dataset.handAction}))()`);
if(held.held!=='flashlight'||!held.slot)throw new Error('Flashlight was not synchronized into the first-person held-item state: '+JSON.stringify(held));
await evaluate(`document.querySelector('.inventory-slot[data-item="flashlight"]').onclick()`);
await wait(80);
const equipAction=await evaluate(`document.body.dataset.handAction`);
if(equipAction!=='equip')throw new Error(`Expected equip hand animation, received ${equipAction}`);
const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));

socket.close();
console.log(JSON.stringify({heldItem:held.held,inventorySlot:held.slot,equipAnimation:equipAction,browserExceptions:0},null,2));
