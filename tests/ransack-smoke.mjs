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
await send('Page.bringToFront');
await send('Emulation.setFocusEmulationEnabled',{enabled:true});
await send('Page.reload',{ignoreCache:true});
for(let attempt=0;attempt<150;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-ransack')?.onclick==='function'`))break;
 await wait(200);
 if(attempt===149)throw new Error('Game module did not finish initializing');
}
exceptions.length=0;
await evaluate(`(()=>{const teleport=document.querySelector('#admin-teleport');teleport.value='floor5-entry';document.querySelector('#admin-teleport-go').onclick();document.querySelector('#admin-ransack').onclick()})()`);
await wait(90);
const warning=await evaluate(`(()=>({phase:document.body.dataset.ransackPhase,active:document.querySelector('#ransack-hud').classList.contains('active'),sign:document.querySelector('#ransack-sign').textContent,time:document.querySelector('#ransack-time').textContent}))()`);
if(warning.phase!=='warning'||!warning.active||warning.sign!=='STOP'||Number(warning.time)>3)throw new Error('Ransack warning failed: '+JSON.stringify(warning));
let passed;
for(let attempt=0;attempt<150;attempt++){await wait(100);passed=await evaluate(`(()=>({phase:document.body.dataset.ransackPhase,passed:document.querySelector('#ransack-hud').classList.contains('passed'),copy:document.querySelector('#ransack-instruction').textContent,still:document.body.dataset.ransackStill,motion:document.body.dataset.ransackMotion,time:document.querySelector('#ransack-time').textContent}))()`);if(passed.phase==='passed')break}
if(passed.phase!=='passed'||!passed.passed||!passed.copy.includes('challenge'))throw new Error('Stopping did not pass Ransack: '+JSON.stringify(passed));
await wait(2600);
await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW',bubbles:true}));document.querySelector('#admin-ransack').onclick()})()`);
let failed;
for(let attempt=0;attempt<300;attempt++){await wait(100);failed=await evaluate(`(()=>({phase:document.body.dataset.ransackPhase,failed:document.querySelector('#ransack-hud').classList.contains('failed'),sign:document.querySelector('#ransack-sign').textContent,count:document.querySelector('#ransack-time').textContent,copy:document.querySelector('#ransack-instruction').textContent,stability:document.querySelector('#stability-text').textContent,still:document.body.dataset.ransackStill,motion:document.body.dataset.ransackMotion}))()`);if(failed.phase==='collect')break}
await evaluate(`document.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW',bubbles:true}))`);
if(failed.phase!=='collect'||!failed.failed||failed.sign!=='FAILED'||failed.count!=='0 / 3'||!failed.copy.includes('three red marks')||failed.stability!=='COMPOSURE 100%')throw new Error('Ransack non-lethal collection consequence failed: '+JSON.stringify(failed));
const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));

socket.close();
console.log(JSON.stringify({warning,passed,failed,browserExceptions:0},null,2));
