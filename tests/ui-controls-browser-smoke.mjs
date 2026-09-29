const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9268';
const gameUrl=process.env.HOTEL_GAME_URL||'http://127.0.0.1:8772';
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
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));

await send('Runtime.enable');
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled',{cacheDisabled:true});
if(process.env.HOTEL_CDP_SKIP_NAVIGATION!=='1')await send('Page.navigate',{url:`${gameUrl}/?quality=low&verify=ui-controls&cache=${Date.now()}`});
for(let attempt=0;attempt<600;attempt++){
 if(await evaluate(`document.body.dataset.gameReady==='true'&&typeof setFieldJournal==='function'&&typeof startLobbyMode==='function'`))break;
 await wait(100);
 if(attempt===599)throw new Error(`Game did not become ready: ${JSON.stringify(await evaluate(`({ready:document.body.dataset.gameReady,error:document.body.dataset.gameLoadError||'',notice:document.querySelector('#lobby-notice')?.textContent,prompt:document.querySelector('#prompt')?.textContent})`))}`);
}
exceptions.length=0;

const lobby=await evaluate(`(()=>{if(storySelect.hidden)buildStoryLobby();const click=selector=>document.querySelector(selector).click(),hit=selector=>{const element=document.querySelector(selector),rect=element.getBoundingClientRect(),at=document.elementFromPoint(rect.left+rect.width/2,rect.top+rect.height/2);return Boolean(rect.width&&rect.height&&(at===element||element.contains(at))&&getComputedStyle(element).pointerEvents!=='none')},hitTargets=['[data-lobby-game="jailbreak"]','[data-lobby-rule="sandbox"]','#lobby-start','[data-lobby-panel-target="badges"]','[data-lobby-panel-target="credits"]','#lobby-invite','#journal-toggle'].map(hit);click('[data-lobby-game="jailbreak"]');const game=document.querySelector('#lobby-selected-game').textContent;click('[data-lobby-rule="sandbox"]');const mode=document.querySelector('.lobby-preview').dataset.previewMode;click('[data-lobby-panel-target="badges"]');const badges=!document.querySelector('[data-lobby-panel="badges"]').hidden;click('[data-lobby-panel="badges"] .lobby-modal__close');const badgesClosed=document.querySelector('[data-lobby-panel="badges"]').hidden;click('[data-lobby-panel-target="credits"]');const credits=!document.querySelector('[data-lobby-panel="credits"]').hidden;click('[data-lobby-panel="credits"] .lobby-modal__close');click('#lobby-invite');return{game,mode,badges,badgesClosed,credits,invite:document.querySelector('#lobby-notice').textContent,ready:document.body.dataset.gameReady,hitTargets}})()`);
if(lobby.game!=='JAILBREAK'||lobby.mode!=='sandbox'||!lobby.badges||!lobby.badgesClosed||!lobby.credits||lobby.hitTargets.some(value=>!value))throw new Error(`Lobby buttons failed: ${JSON.stringify(lobby)}`);

const lobbyJournal=await evaluate(`(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyJ',bubbles:true,cancelable:true}));const opened=journalPaused&&!document.querySelector('#survivor-journal').hidden;document.querySelector('#journal-close').click();const closed=!journalPaused&&document.querySelector('#survivor-journal').hidden;document.querySelector('#journal-toggle').click();const buttonOpened=journalPaused&&!document.querySelector('#survivor-journal').hidden;document.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',bubbles:true,cancelable:true}));return{opened,closed,buttonOpened,escapeClosed:!journalPaused,storyVisible:!storySelect.hidden}})()`);
if(!lobbyJournal.opened||!lobbyJournal.closed||!lobbyJournal.buttonOpened||!lobbyJournal.escapeClosed||!lobbyJournal.storyVisible)throw new Error(`Lobby journal controls failed: ${JSON.stringify(lobbyJournal)}`);

const run=await evaluate(`(async()=>{document.querySelector('[data-lobby-game="hotel"]').click();document.querySelector('[data-lobby-rule="normal"]').click();document.querySelector('#lobby-start').click();await new Promise(resolve=>setTimeout(resolve,40));const started=storySelect.hidden&&activeStory==='hotel';document.querySelector('#journal-toggle').click();const journal=journalPaused;document.dispatchEvent(new KeyboardEvent('keydown',{code:'Escape',bubbles:true,cancelable:true}));document.querySelector('#admin-toggle').click();const admin=!document.querySelector('#admin-panel').hidden;document.querySelector('#admin-close').click();const adminClosed=document.querySelector('#admin-panel').hidden;document.querySelector('#story-lobby').click();return{started,journal,journalClosed:!journalPaused,admin,adminClosed,lobbyReturned:!storySelect.hidden}})()`);
if(!run.started||!run.journal||!run.journalClosed||!run.admin||!run.adminClosed||!run.lobbyReturned)throw new Error(`In-game controls failed: ${JSON.stringify(run)}`);

const unexpected=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock')&&!error.includes('requestPointerLock'));
if(unexpected.length)throw new Error(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();
console.log(JSON.stringify({lobby,lobbyJournal,run,browserExceptions:0},null,2));
