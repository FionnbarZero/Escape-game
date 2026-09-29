import fs from 'node:fs';
import path from 'node:path';

const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9250';
const phase=process.env.HOTEL_GRAPHICS_PHASE||'before';
const gameUrl=process.env.HOTEL_GRAPHICS_URL||'http://127.0.0.1:8765/';
const overwrite=process.env.HOTEL_GRAPHICS_OVERWRITE==='1';
const outputRoot=path.resolve(process.env.HOTEL_GRAPHICS_OUTPUT||`docs/graphics-pass-1/evidence/${phase}`);
fs.mkdirSync(outputRoot,{recursive:true});

const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.startsWith(gameUrl));
if(!page)throw new Error('Hotel Nocturne browser page not found');
const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
let nextId=0;
const pending=new Map(),exceptions=[],failedRequests=[];
socket.addEventListener('message',event=>{
 const message=JSON.parse(event.data);
 if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);
 if(message.method==='Network.loadingFailed')failedRequests.push({url:message.params.requestId,error:message.params.errorText,blockedReason:message.params.blockedReason||''});
 if(!message.id)return;
 const request=pending.get(message.id);if(!request)return;pending.delete(message.id);
 message.error?request.reject(new Error(message.error.message)):request.resolve(message.result);
});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
await send('Runtime.enable');await send('Page.enable');await send('Network.enable');
if(process.env.HOTEL_GRAPHICS_REUSE!=='1'){
 await send('Emulation.setDeviceMetricsOverride',{width:Number(process.env.HOTEL_GRAPHICS_WIDTH)||1280,height:Number(process.env.HOTEL_GRAPHICS_HEIGHT)||720,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:`${gameUrl}?quality=high&graphicsEvidence=${phase}&cache=${Date.now()}`});
 await wait(500);
 for(let attempt=0;attempt<100;attempt++){if(await evaluate(`document.readyState==='complete'&&typeof hideStorySelection==='function'&&typeof startMolly==='function'&&typeof renderer==='object'`))break;await wait(150);if(attempt===99)throw new Error('Game did not initialize')}
 await evaluate(`(()=>{if(typeof adminTeleport==='function')adminTeleport('molly-electrical');else{hideStorySelection();inLobby=false;activeStory='hotel';startMolly(true,'graphics-evidence')}if(dlg.open)dlg.close();if(typeof applyGraphicsQuality==='function'){graphicsRenderScale=1;graphicsOptionalEffects=true;applyGraphicsQuality('high',{persist:false})}else{renderer.shadowMap.enabled=true;renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setSize(innerWidth,innerHeight)}molly.grace=999;molly.selectionTimer=999;controls.lock=()=>{};controls.unlock=()=>{};document.body.classList.remove('admin-open','story-select-mode');for(const selector of ['.caption','body>aside','#molly-status','#molly-code-record','#inventory-hud','#prompt']){const element=document.querySelector(selector);if(element){element.style.transition='none';element.style.animation='none'}}document.body.classList.add('hud-compact');void document.body.offsetWidth;const style=document.createElement('style');style.textContent='body.graphics-evidence-clean>header,body.graphics-evidence-clean>.caption,body.graphics-evidence-clean>aside,body.graphics-evidence-clean>nav,body.graphics-evidence-clean #inventory-hud,body.graphics-evidence-clean #boss-hud,body.graphics-evidence-clean #molly-status,body.graphics-evidence-clean #molly-code-record,body.graphics-evidence-clean #prompt,body.graphics-evidence-clean #crosshair,body.graphics-evidence-clean #admin-toggle,body.graphics-evidence-clean #hint,body.graphics-evidence-clean #story-lobby,body.graphics-evidence-clean #reset-game,body.graphics-evidence-clean #journal-toggle,body.graphics-evidence-clean #escape-badge{display:none!important}';document.head.append(style);return true})()`);
 await wait(400);
}

const views=[
 {name:'01-molly-entrance',position:[0,1.7,20.8],look:[0,1.65,13],held:''},
 {name:'02-terminal-intercom',position:[-9.2,1.7,11.8],look:[-15.7,1.65,8.1],held:''},
 {name:'03-lever-approach',position:[-11.5,1.7,-18.2],look:[-18,1.6,-27.4],held:''},
 {name:'04-molly-model',position:[3.4,1.8,10.4],look:[0,2.15,13],held:''},
 {name:'05-held-camera-controller',position:[0,1.7,20.8],look:[0,1.65,13],held:'camera-controller'}
];
async function capture(view,hud=true){
 await evaluate(`(()=>{camera.position.fromArray(${JSON.stringify(view.position)});camera.lookAt(...${JSON.stringify(view.look)});selectedInventoryId=${JSON.stringify(view.held)};syncFirstPersonHeldItem(true);const heldView=ensureFirstPersonView();if(${Boolean(view.held)}){if(heldView.parent!==camera)camera.add(heldView);heldView.visible=true}else camera.remove(heldView);if(firstPersonHeldItem)firstPersonHeldItem.visible=true;document.body.classList.toggle('graphics-evidence-clean',${!hud});renderer.render(scene,camera);return true})()`);
 await wait(140);
 const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,fromSurface:true});
 fs.writeFileSync(path.join(outputRoot,`${view.name}${hud?'-hud':'-clean'}.png`),Buffer.from(result.data,'base64'));
}
for(const view of views){
 const hudPath=path.join(outputRoot,`${view.name}-hud.png`);
 if(overwrite||!fs.existsSync(hudPath))await capture(view,true);
 if(view.name==='04-molly-model'){
  const cleanPath=path.join(outputRoot,`${view.name}-clean.png`);
  if(overwrite||!fs.existsSync(cleanPath))await capture(view,false);
 }
}

let metrics=null;
if(process.env.HOTEL_GRAPHICS_SKIP_METRICS!=='1')metrics=await evaluate(`(async()=>{
 const gl=renderer.getContext(),extension=gl.getExtension('WEBGL_debug_renderer_info'),frameTimes=[];
 await new Promise(resolve=>{let previous=performance.now(),count=0;const sample=now=>{if(count++)frameTimes.push(now-previous);previous=now;if(count<13)requestAnimationFrame(sample);else resolve()};requestAnimationFrame(sample)});
 frameTimes.sort((a,b)=>a-b);let meshes=0,lights=0,materials=new Set(),geometries=new Set();scene.traverse(object=>{if(object.isMesh){meshes++;if(object.geometry)geometries.add(object.geometry);if(Array.isArray(object.material))object.material.forEach(value=>materials.add(value));else if(object.material)materials.add(object.material)}if(object.isLight)lights++});
 renderer.render(scene,camera);
 return{phase:${JSON.stringify(phase)},capturedAt:new Date().toISOString(),viewport:[innerWidth,innerHeight],devicePixelRatio,pixelRatio:renderer.getPixelRatio(),drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],quality:new URLSearchParams(location.search).get('quality'),hotelSeed:typeof HOTEL_VISIT_SEED!=='undefined'?HOTEL_VISIT_SEED:null,renderScale:typeof graphicsRenderScale!=='undefined'?graphicsRenderScale:null,flashlightOn:Boolean(usableInventory.flashlightOn),renderer:extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),vendor:extension?gl.getParameter(extension.UNMASKED_VENDOR_WEBGL):gl.getParameter(gl.VENDOR),toneMapping:renderer.toneMapping,exposure:renderer.toneMappingExposure,shadows:renderer.shadowMap.enabled,shadowType:renderer.shadowMap.type,fogDensity:scene.fog?.density,scene:{meshes,lights,materials:materials.size,geometries:geometries.size},rendererInfo:{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,lines:renderer.info.render.lines,points:renderer.info.render.points,memory:{...renderer.info.memory}},frameMs:{mean:frameTimes.reduce((sum,value)=>sum+value,0)/frameTimes.length,median:frameTimes[Math.floor(frameTimes.length*.5)],p95:frameTimes[Math.floor(frameTimes.length*.95)],samples:frameTimes.length},molly:{wires:mollyEntity.userData.wires.length,computers:mollyComputers.length,intercoms:mollyIntercoms.length,levers:mollyLevers.length},url:location.href}
 })()`);
if(metrics)fs.writeFileSync(path.join(outputRoot,'metrics.json'),JSON.stringify({...metrics,exceptions,failedRequests},null,2));
socket.close();
console.log(JSON.stringify(metrics||{phase,output:outputRoot,screenshotsOnly:true},null,2));
