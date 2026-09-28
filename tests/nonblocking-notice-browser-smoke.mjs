const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('verify=nonblocking-notice'));
if(!page)throw new Error('Non-blocking notice test page not found');

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

const state=await evaluate(`(()=>{const select=document.querySelector('#admin-teleport');select.value='floor1-entry';document.querySelector('#admin-teleport-go').onclick();document.querySelector('#hint').onclick();const notice=document.querySelector('#game-notice'),text=notice.querySelector('span');return{dialogOpen:document.querySelector('#puzzle').open,noticeActive:notice.classList.contains('active'),ariaHidden:notice.getAttribute('aria-hidden'),title:notice.querySelector('strong').textContent,copy:text.textContent,fontSize:getComputedStyle(text).fontSize,pointerEvents:getComputedStyle(notice).pointerEvents}})()`);
if(state.dialogOpen||!state.noticeActive||state.ariaHidden!=='false'||state.fontSize!=='14px'||state.pointerEvents!=='none')throw new Error(`Informational message remained blocking: ${JSON.stringify(state)}`);

socket.close();
console.log(JSON.stringify(state,null,2));
