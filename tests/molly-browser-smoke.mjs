const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9231';
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
await send('Page.reload',{ignoreCache:true});
exceptions.length=0;
for(let attempt=0;attempt<150;attempt++){
 if(await evaluate(`typeof document.querySelector('#admin-teleport-go')?.onclick==='function'`))break;
 await wait(200);
 if(exceptions.length)throw new Error('Game module initialization exception: '+exceptions.join(' | '));
 if(attempt===149)throw new Error('Game module did not finish initializing');
}

await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'F2',bubbles:true}));const select=document.querySelector('#admin-teleport');select.value='molly-electrical';document.querySelector('#admin-teleport-go').onclick()})()`);
await wait(300);
const entry=await evaluate(`(()=>({title:document.querySelector('#title').textContent,boss:document.querySelector('#boss-name').textContent,bossActive:document.querySelector('#boss-hud').classList.contains('active'),noiseActive:document.querySelector('#noise-hud').classList.contains('active'),run:JSON.parse(sessionStorage.getItem('hotel-molly-run')),computers:mollyComputers.length,intercoms:mollyIntercoms.length,doors:mollyDoors.length,wires:mollyEntity.userData.wires.length,arms:mollyEntity.userData.arms.length,screen:molly.display,model:mollyEntity.name}))()`);
if(entry.title!=='Molly · The Blind Computer'||entry.boss!=='MOLLY'||!entry.bossActive||entry.noiseActive||entry.computers!==6||entry.intercoms!==4||entry.doors!==3||entry.wires!==16||entry.arms!==2||entry.screen!=='00'||!entry.model.includes('blind computer monster'))throw new Error('Molly scene did not initialize correctly: '+JSON.stringify(entry));

const sound=await evaluate(`(()=>{mollyHearSound(new THREE.Vector3(7,0,-3),1.4,'test beep');return{lastSound:molly.lastSound,strength:molly.soundStrength,display:molly.display,phase:molly.phase,flare:molly.flare?.style}})()`);
if(sound.lastSound.join(',')!=='7,0,-3'||sound.strength!==1.4||sound.display!=='00'||sound.phase!=='listening'||sound.flare!=='focused')throw new Error('Molly did not investigate the supplied sound location: '+JSON.stringify(sound));

const selection=await evaluate(`(()=>{cancelMollyFlare();molly.targetComputer=4;mollySetDisplay(4);molly.phase='computer-travel';return{display:molly.display,phase:molly.phase,code:mollyComputerCode(4)}})()`);
if(selection.display!=='04'||selection.phase!=='computer-travel'||selection.code!=='0417')throw new Error('Molly computer selection is not trustworthy: '+JSON.stringify(selection));

const ending=await evaluate(`(()=>{molly.overridden=[2,4,6];pullMollyLever(0);pullMollyLever(1);pullMollyLever(2);return{levers:molly.levers.length,finalUnlocked:molly.finalUnlocked,phase:molly.phase,doorY:roomGroup.getObjectByName('Molly final exit door')?.position.y,blocker:Boolean(roomGroup.getObjectByName('Molly final exit blocker'))}})()`);
if(ending.levers!==3||!ending.finalUnlocked||ending.phase!=='final-travel'||ending.doorY!==6||ending.blocker)throw new Error('Molly final lever sequence failed: '+JSON.stringify(ending));

const unexpectedExceptions=exceptions.filter(error=>!error.includes('user gesture is required to request Pointer Lock'));
if(unexpectedExceptions.length)throw new Error('Browser exceptions: '+unexpectedExceptions.join(' | '));
socket.close();
console.log(JSON.stringify({scene:'Electrical Section',terminals:entry.computers,wireBundles:entry.wires,soundTarget:sound.lastSound,selectedComputer:selection.display,finalExit:'raised and unblocked',noiseMeter:'disabled'},null,2));
