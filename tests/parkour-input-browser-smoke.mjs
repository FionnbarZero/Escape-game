const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9272';
const gameUrl=process.env.HOTEL_GAME_URL||'http://127.0.0.1:8773';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.startsWith(gameUrl));
if(!page)throw new Error('Hotel Nocturne browser page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);clearTimeout(request.timer);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId,timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout: ${method}`))},60000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};

await send('Runtime.enable');
for(let attempt=0;attempt<600;attempt++){
 if(await evaluate(`document.body?.dataset.gameReady==='true'&&typeof playerMovementInputActive==='function'`))break;
 await new Promise(resolve=>setTimeout(resolve,100));
 if(attempt===599)throw new Error('Game did not initialize');
}
exceptions.length=0;

const result=await evaluate(`(async()=>{
 if(!storySelect.hidden)hideStorySelection();if(dlg.open)dlg.close();if(intro.open)intro.close();inLobby=false;hotelHideState=null;molly=null;controls.unlock();keyboardMovementFallback=true;
 const key=(type,code)=>document.dispatchEvent(new KeyboardEvent(type,{code,bubbles:true,cancelable:true,repeat:false}));
 const jumpVelocity=async holdMs=>{playerFeetY=0;verticalVelocity=0;playerGrounded=true;jumpCharging=false;jumpChargeStarted=0;jumpHoldTimer=0;parkourAction='';keys.Space=false;key('keydown','Space');const beforeRelease={grounded:playerGrounded,velocity:verticalVelocity,charging:jumpCharging};if(holdMs)await new Promise(resolve=>setTimeout(resolve,holdMs));key('keyup','Space');return{...beforeRelease,launchVelocity:verticalVelocity,launched:!playerGrounded}};
 const tap=await jumpVelocity(0),hold=await jumpVelocity(500);
 playerGrounded=true;parkourAction='';parkourLastGroundTap=-1e9;key('keydown','KeyR');const dash=parkourAction;key('keyup','KeyR');key('keydown','KeyR');const roll=parkourAction;key('keyup','KeyR');
 playerGrounded=false;parkourAction='';parkourAirDiveUsed=false;verticalVelocity=2;key('keydown','KeyR');const dive=parkourAction,diveVelocity=verticalVelocity;key('keyup','KeyR');playerGrounded=true;resolveParkourLanding();const landing=parkourAction;
 keyboardMovementFallback=false;jumpCharging=false;keys.Space=false;keys.KeyR=false;return{tap,hold,dash,roll,dive,diveVelocity,landing,prompt:document.querySelector('#prompt').textContent}
})()`);
if(!result.tap.charging||!result.tap.grounded||result.tap.velocity!==0||!result.tap.launched||!result.hold.charging||!result.hold.grounded||result.hold.velocity!==0||!result.hold.launched||result.hold.launchVelocity<=result.tap.launchVelocity+1.5||result.dash!=='dash'||result.roll!=='roll'||result.dive!=='dive'||result.diveVelocity>=0||result.landing!=='roll')throw new Error(`Keyboard parkour failed: ${JSON.stringify(result)}`);
const unexpected=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock')&&!error.includes('requestPointerLock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({trigger:'Space release',tapVelocity:Number(result.tap.launchVelocity.toFixed(2)),holdVelocity:Number(result.hold.launchVelocity.toFixed(2)),ground:[result.dash,result.roll],air:result.dive,landing:result.landing,browserExceptions:0},null,2));
