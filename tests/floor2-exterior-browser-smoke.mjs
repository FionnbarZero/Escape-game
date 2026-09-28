const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('verify=exterior-rooms'));
if(!page)throw new Error('Floor 2 exterior test page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map();
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);return result.result.value};

await send('Runtime.enable');
for(let attempt=0;attempt<50;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await new Promise(resolve=>setTimeout(resolve,100));
 if(attempt===49)throw new Error('Game module did not initialize');
}

const results=[];
for(const destination of ['floor2-fireescape','floor2-rooftops','floor2-gauntlet']){
 const result=await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value=${JSON.stringify(destination)};document.querySelector('#admin-teleport-go').onclick();return{destination:${JSON.stringify(destination)},title:document.querySelector('#title').textContent,prompt:document.querySelector('#prompt').textContent,room:document.querySelector('#room-number strong').textContent,run:JSON.parse(sessionStorage.getItem('infinite-hotel-floor-two'))}})()`);
 if(!result.title.startsWith('Room ')||!result.prompt.includes('EXTERIOR'))throw new Error(`Custom exterior checkpoint failed: ${JSON.stringify(result)}`);
 if(result.run.version!==9||!result.run.routes.watcherExterior||!result.run.routes.fuseExterior)throw new Error('Updated Floor 2 route data is missing');
 results.push({destination,title:result.title,room:result.room});
 await new Promise(resolve=>setTimeout(resolve,120));
}

socket.close();
console.log(JSON.stringify({rendered:results,customExteriorRooms:18},null,2));
