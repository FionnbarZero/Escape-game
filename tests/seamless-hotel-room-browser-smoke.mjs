const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('verify=seamless-hotel'));
if(!page)throw new Error('Seamless hotel test page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map();
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value};

await send('Runtime.enable');
for(let attempt=0;attempt<50;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await new Promise(resolve=>setTimeout(resolve,100));
 if(attempt===49)throw new Error('Game module did not initialize');
}

const rendered=[];
for(const destination of ['floor5-entry','floor1-entry','floor2-entry']){
 const state=await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value=${JSON.stringify(destination)};document.querySelector('#admin-teleport-go').onclick();return{destination:${JSON.stringify(destination)},transition:document.body.dataset.hotelTransition,title:document.querySelector('#title').textContent,blackout:document.querySelector('#blackout').classList.contains('show'),layout:${destination==='floor5-entry'?"JSON.parse(sessionStorage.getItem('infinite-hotel-floor-five')).opening[0].layout":'null'}}})()`);
 if(state.transition!=='door-ready'||state.blackout)throw new Error(`Connected doorway failed to render: ${JSON.stringify(state)}`);
 rendered.push(state);
 await new Promise(resolve=>setTimeout(resolve,120));
}

socket.close();
console.log(JSON.stringify({rendered,blackoutUsed:false},null,2));
