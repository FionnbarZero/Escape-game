const endpoint=process.env.HOTEL_CDP_ENDPOINT||'http://127.0.0.1:9254';
const gameUrl=process.env.HOTEL_GAME_URL||'http://127.0.0.1:8765/';
const pages=await fetch(endpoint+'/json/list').then(response=>response.json());
const page=pages.find(entry=>entry.type==='page'&&entry.url.startsWith(new URL(gameUrl).origin))||pages.find(entry=>entry.type==='page'&&entry.url==='about:blank')||pages.find(entry=>entry.type==='page');
if(!page)throw new Error('Hotel Nocturne browser page not found');
const socket=new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true})});
const fail=message=>{socket.close();throw new Error(message)};
let nextId=0;
const pending=new Map(),exceptions=[];
socket.addEventListener('message',event=>{const message=JSON.parse(event.data);if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);if(!message.id)return;const request=pending.get(message.id);if(!request)return;pending.delete(message.id);message.error?request.reject(new Error(message.error.message)):request.resolve(message.result)});
const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++nextId;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}))});
const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(result.exceptionDetails)throw new Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);return result.result.value};
const wait=milliseconds=>new Promise(resolve=>setTimeout(resolve,milliseconds));
await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
await send('Page.navigate',{url:`${gameUrl}?quality=low&verify=progress-notifications&cache=${Date.now()}`});
for(let attempt=0;attempt<900;attempt++){if(await evaluate(`document.body.dataset.gameReady==='true'&&typeof queueProgressNotice==='function'&&typeof syncLobbyBadgeNotifications==='function'`))break;await wait(100);if(attempt===899)fail(`Game did not initialize: ${exceptions.join(' | ')}`)}
exceptions.length=0;
const result=await evaluate(`(async()=>{
 const notice=()=>{const element=document.querySelector('#game-notice');return{active:element.classList.contains('active'),title:element.querySelector('strong').textContent,copy:element.querySelector('span').textContent,ariaHidden:element.getAttribute('aria-hidden')}};
 progressNoticeQueue=[];progressNoticeActive=false;hideGameNotice();delete journalDiscoveries['false-guest'];saveJournalDiscoveries();journalDiscover('false-guest',1);await new Promise(resolve=>setTimeout(resolve,80));const journal=notice();
 progressNoticeQueue=[];progressNoticeActive=false;hideGameNotice();hotelArrivalItems.add('room304-key-used');for(const id of ['purge-survived','floor-one-checkout','floor-two-room140'])hotelProgress.add(id);hotelProgress.delete('doors-style-run-escaped');lobbyBadgeNotified=new Set(lobbyBadgeDefinitions().filter(badge=>badge.id!=='no-vacancy').map(badge=>badge.id));localStorage.setItem(LOBBY_BADGE_NOTICE_KEY,JSON.stringify([...lobbyBadgeNotified]));hotelProgress.add('doors-style-run-escaped');syncLobbyBadgeNotifications();await new Promise(resolve=>setTimeout(resolve,80));const badge=notice();
 hotelArrivalItems.delete('room304-key');hotelArrivalItems.add('room304-key-used');const usedKeyStillEarned=lobbyBadgeDefinitions().find(entry=>entry.id==='first-check-in').earned;
 return{journal,badge,usedKeyStillEarned,queued:progressNoticeQueue.map(item=>item.name)}
})()`);
if(!result.journal.active||result.journal.title!=='JOURNAL ENTRY DISCOVERED'||!result.journal.copy.includes('False Guest')||result.journal.ariaHidden!=='false')fail(`Journal notification failed: ${JSON.stringify(result)}`);
if(!result.badge.active||!result.badge.title.startsWith('BADGE EARNED')||!result.badge.copy.includes('NO VACANCY'))fail(`Badge notification failed: ${JSON.stringify(result)}`);
if(!result.usedKeyStillEarned)fail(`Used Room 304 key lost First Check-In badge: ${JSON.stringify(result)}`);
if(!result.queued.includes('ALL FIVE BADGES COMPLETE'))fail(`Five-badge completion notification was not queued: ${JSON.stringify(result)}`);
const unexpected=exceptions.filter(error=>!error.toLowerCase().includes('pointer lock'));if(unexpected.length)fail(`Browser exceptions: ${unexpected.join(' | ')}`);
socket.close();console.log(JSON.stringify({...result,gameplayExceptions:0},null,2));
