const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9250';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.includes('127.0.0.1:8765'));
if(!page)throw new Error('Hotel Nocturne browser page not found');

const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:`http://127.0.0.1:8765/?quality=low&verify=monster-jumpscare&cache=${Date.now()}`});
for(let attempt=0;attempt<600;attempt++){if(await evaluate(`document.readyState==='complete'&&typeof playMonsterJumpscare==='function'`))break;await wait(100);if(attempt===599)throw new Error(`Game did not initialize: ${exceptions.join(' | ')}`)}
exceptions.length=0;

const generic=await evaluate(`(()=>{playMonsterJumpscare('false-guest','False Guest','THE FALSE GUEST FOUND YOU',5000);const overlay=document.querySelector('#monster-jumpscare'),face=overlay.querySelector('.monster-jumpscare__face');return{active:overlay.classList.contains('active'),hidden:overlay.getAttribute('aria-hidden'),variant:overlay.dataset.monster,name:document.querySelector('#monster-jumpscare-name').textContent,reason:document.querySelector('#monster-jumpscare-reason').textContent,visibility:getComputedStyle(overlay).visibility,z:Number(getComputedStyle(overlay).zIndex),animation:getComputedStyle(face).animationName}})()`);
if(!generic.active||generic.hidden!=='false'||generic.variant!=='false-guest'||generic.name!=='FALSE GUEST'||generic.reason!=='THE FALSE GUEST FOUND YOU'||generic.visibility!=='visible'||generic.z<50||!generic.animation.includes('impostor-unmask'))throw new Error(`False Guest jumpscare failed: ${JSON.stringify(generic)}`);

const molly=await evaluate(`(()=>{playMonsterJumpscare('molly','Molly','MOLLY SLAMMED THE TERMINAL INTO YOU',5000);const overlay=document.querySelector('#monster-jumpscare'),face=overlay.querySelector('.monster-jumpscare__face'),mark=overlay.querySelector('.monster-jumpscare__signature span');return{variant:overlay.dataset.monster,motion:overlay.dataset.motion,animation:getComputedStyle(face).animationName,mark:mark.textContent,markDisplay:getComputedStyle(mark).display,shape:getComputedStyle(face).borderRadius}})()`);
if(molly.variant!=='molly'||molly.motion!=='molly-monitor-kill'||!molly.animation.includes('molly-monitor-kill')||molly.mark!=='00'||molly.markDisplay==='none')throw new Error(`Molly terminal jumpscare failed: ${JSON.stringify(molly)}`);

const portraits=await evaluate(`(()=>{const kinds=['bash','chef','collector','clockmaker','drowned-guest','water-creature','pursuer','molly','stair-monster','cable-mass','giant-spider','root-stalker','gardener','watcher','ballroom-guest','false-guest','window-creature','reflection','luggage-warden','empty-porter','black-bellhop','hotel-manager','night-auditor','cellblock-guard','pursuit-guards','vent-crawler'];return kinds.map(kind=>{playMonsterJumpscare(kind,kind,'TEST',5000);const overlay=document.querySelector('#monster-jumpscare');return[kind,overlay.dataset.monster,overlay.dataset.motion,getComputedStyle(overlay.querySelector('.monster-jumpscare__face')).animationName]})})()`);
if(new Set(portraits.map(entry=>entry[1])).size!==portraits.length||new Set(portraits.map(entry=>entry[2])).size!==portraits.length||portraits.some(entry=>!entry[3].includes(entry[2])))throw new Error(`Character profiles are not unique: ${JSON.stringify(portraits)}`);

const purge=await evaluate(`(()=>{playMonsterJumpscare('purge','The Purge','THE PURGE SHOWED ITS TEETH',5000);const overlay=document.querySelector('#purge-jumpscare'),mouth=overlay.querySelector('.purge-mouth');return{active:overlay.classList.contains('active'),hidden:overlay.getAttribute('aria-hidden'),reason:overlay.querySelector('strong').textContent,visibility:getComputedStyle(overlay).visibility,topTeeth:getComputedStyle(mouth,'::before').content,bottomTeeth:getComputedStyle(mouth,'::after').content,teethAnimation:getComputedStyle(mouth,'::before').animationName}})()`);
if(!purge.active||purge.hidden!=='false'||purge.reason!=='THE PURGE SHOWED ITS TEETH'||purge.visibility!=='visible'||purge.topTeeth==='none'||purge.bottomTeeth==='none'||!purge.teethAnimation.includes('purge-teeth-rage'))throw new Error(`Purge jumpscare failed: ${JSON.stringify(purge)}`);

const noise=await evaluate(`(()=>{playMonsterJumpscare('noise','The Noise','SIGNAL LOST',5000);const overlay=document.querySelector('#noise-jumpscare');return{active:overlay.classList.contains('active'),hidden:overlay.getAttribute('aria-hidden'),reason:document.querySelector('#noise-death-reason').textContent,body:document.body.classList.contains('noise-hit'),visibility:getComputedStyle(overlay).visibility}})()`);
if(!noise.active||noise.hidden!=='false'||noise.reason!=='SIGNAL LOST'||!noise.body||noise.visibility!=='visible')throw new Error(`Noise jumpscare failed: ${JSON.stringify(noise)}`);

const reducedFlashing=await evaluate(`(()=>{document.body.classList.add('reduced-flashing');playMonsterJumpscare('bash','Bash','BASH RAN THROUGH YOU',5000);return getComputedStyle(document.querySelector('.monster-jumpscare__streaks')).display})()`);
if(reducedFlashing!=='none')throw new Error(`Reduced flashing failed: ${reducedFlashing}`);
await evaluate(`hideMonsterJumpscare();document.body.classList.remove('reduced-flashing')`);

const unexpected=exceptions.filter(error=>!error.includes('Pointer Lock')&&!error.includes('requestPointerLock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({falseGuest:generic,molly,uniquePortraits:portraits.length,purge,noise,reducedFlashing,browserExceptions:0},null,2));
