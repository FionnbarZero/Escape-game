let selectedLobbyGame='hotel',selectedLobbyMode='normal';
const LOBBY_PROGRESSION_DOORS=Object.freeze([
 {id:'journals',roman:'I',x:-5,meshName:'cabin story door',requirement:'DISCOVER EVERY JOURNAL RECORD'},
 {id:'campaign',roman:'II',x:0,meshName:'jailbreak story door',requirement:'COMPLETE HOTEL NOCTURNE'},
 {id:'badges',roman:'III',x:5,meshName:'hotel story door',requirement:'EARN EVERY BADGE'}
]);
let lobbyOpenedProgressDoors=new Set();
function lobbyBadgeDefinitions(){
 return[
  {id:'first-check-in',glyph:'I',name:'FIRST CHECK-IN',copy:'Receive the key to Room 304.',earned:hotelArrivalItems.has('room304-key')||hotelArrivalItems.has('room304-key-used')},
  {id:'scrap-metal',glyph:'P',name:'SCRAP METAL',copy:'Survive The Purge.',earned:hotelProgress.has('purge-survived')||sessionStorage.getItem('infinite-hotel-purge-complete-v1')==='true'||hotelRunItems.has('purge-survived')},
  {id:'last-service',glyph:'C',name:'LAST SERVICE',copy:'Escape the Chef’s kitchen.',earned:hotelProgress.has('floor-one-checkout')},
  {id:'severed-facade',glyph:'Ⅱ',name:'SEVERED FAÇADE',copy:'Reach the Room 140 vault.',earned:hotelProgress.has('floor-two-room140')},
  {id:'no-vacancy',glyph:'∞',name:'NO VACANCY',copy:'Complete a numbered hotel run.',earned:hotelProgress.has('doors-style-run-escaped')}
 ]
}
function lobbyJournalUnlockProgress(){if(typeof syncJournalDiscovery==='function')syncJournalDiscovery();const total=SURVIVOR_JOURNAL_ENTRIES?.length||0,done=SURVIVOR_JOURNAL_ENTRIES?.filter(entry=>journalLevel(entry.id)>0).length||0;return{done,total,unlocked:total>0&&done===total}}
function lobbyBadgeUnlockProgress(){const badges=lobbyBadgeDefinitions(),done=badges.filter(badge=>badge.earned).length;return{done,total:badges.length,unlocked:badges.length>0&&done===badges.length}}
const LOBBY_BADGE_NOTICE_KEY='hotel-badge-notifications-v1';
let lobbyBadgeNotified=(()=>{try{const savedNotice=localStorage.getItem(LOBBY_BADGE_NOTICE_KEY);if(savedNotice)return new Set(JSON.parse(savedNotice));const earned=new Set(lobbyBadgeDefinitions().filter(badge=>badge.earned).map(badge=>badge.id));localStorage.setItem(LOBBY_BADGE_NOTICE_KEY,JSON.stringify([...earned]));return earned}catch{return new Set()}})();
function syncLobbyBadgeNotifications(){const badges=lobbyBadgeDefinitions(),newBadges=badges.filter(badge=>badge.earned&&!lobbyBadgeNotified.has(badge.id));if(!newBadges.length)return false;for(const badge of newBadges){lobbyBadgeNotified.add(badge.id);const done=badges.filter(entry=>entry.earned).length;queueProgressNotice(`BADGE EARNED · ${done} / ${badges.length}`,`${badge.name} — ${badge.copy}`)}localStorage.setItem(LOBBY_BADGE_NOTICE_KEY,JSON.stringify([...lobbyBadgeNotified]));if(badges.every(badge=>badge.earned))queueProgressNotice('ALL FIVE BADGES COMPLETE','Door III has unlocked in the Night Lobby. It leads through the Sunroom to Sub-Floor One.');if(inLobby)refreshLobbyProgressionDoors();return true}
setInterval(syncLobbyBadgeNotifications,400);
function lobbyCampaignComplete(){return hotelProgress.has('floor-two-room140')||hotelProgress.has('escaped')}
function lobbyProgressDoorState(id){
 if(id==='journals'){const progress=lobbyJournalUnlockProgress();return{...progress,detail:`${progress.done} / ${progress.total} JOURNAL RECORDS`}}
 if(id==='campaign')return{done:lobbyCampaignComplete()?1:0,total:1,unlocked:lobbyCampaignComplete(),detail:lobbyCampaignComplete()?'HOTEL NOCTURNE COMPLETE':'COMPLETE HOTEL NOCTURNE'};
 const progress=lobbyBadgeUnlockProgress();return{...progress,detail:`${progress.done} / ${progress.total} BADGES`}
}
function ensureBadgeSunroomPassage(){
 const existing=roomGroup.getObjectByName('badge sunroom passage trigger');if(existing){if(!interactables.includes(existing))interactables.push(existing);objectLabel('DOOR III · SUNROOM',[5,4.25,-8.25],.48);objectLabel('ALL FIVE BADGES · E OPEN',[5,.58,-7.95],.2);return existing}
 const fake=roomGroup.getObjectByName('hotel story door')||roomGroup.getObjectByName('lobby progression door badges');if(fake){fake.removeFromParent();solidColliders=solidColliders.filter(collider=>collider.mesh!==fake)}
 const trigger=addSeamlessHotelPassage({depth:18,width:24,height:5,x:5,doorWidth:4,wall:0x51485a,floor:0x3c3042,door:0x62513b,label:'DOOR III · SUNROOM',type:'lobby-progression-door',part:'badges'});trigger.name='badge sunroom passage trigger';trigger.userData.hotelPassage.door.name='badge sunroom passage door';objectLabel('ALL FIVE BADGES · E OPEN',[5,.58,-7.95],.2);return trigger
}
function refreshLobbyProgressionDoors(){
 if(!inLobby||!roomGroup)return;interactables=interactables.filter(item=>item.userData.type!=='story-choice'&&(item.userData.type!=='lobby-progression-door'||Boolean(item.userData.hotelPassage)));
 for(const child of [...roomGroup.children])if(['label:THE CABIN THAT WATCHES','label:THE INFINITE HOTEL · ROOM 13','label:JAILBREAK · BLACKRIDGE','label:WEST LOUNGE','label:EAST LOUNGE','label:SERVICE ELEVATOR · CLOSED'].includes(child.name)||child.name.startsWith('label:DOOR ')||child.name==='label:E · OPEN'||LOBBY_PROGRESSION_DOORS.some(door=>child.name.startsWith(`label:${door.requirement}`)))child.removeFromParent();
 for(const door of LOBBY_PROGRESSION_DOORS){
  const state=lobbyProgressDoorState(door.id);if(door.id==='badges'&&state.unlocked){ensureBadgeSunroomPassage();continue}const mesh=roomGroup.getObjectByName(door.meshName)||roomGroup.getObjectByName(`lobby progression door ${door.id}`);if(!mesh)continue;const opened=state.unlocked&&lobbyOpenedProgressDoors.has(door.id);mesh.name=`lobby progression door ${door.id}`;mesh.userData.progressionDoorId=door.id;mesh.material.color.setHex(state.unlocked?0x62513b:0x2c292d);mesh.material.emissive.setHex(state.unlocked?0x382810:0x120c0d);mesh.material.emissiveIntensity=state.unlocked?.72:.24;if(opened){mesh.rotation.y=-Math.PI*.43;solidColliders=solidColliders.filter(collider=>collider.mesh!==mesh)}
  const trigger=interactive([door.x,1.9,-8.05],[door.id==='campaign'?3.5:4.3,4.1,1],0,'lobby-progression-door',door.id);trigger.name=`lobby progression trigger ${door.id}`;objectLabel(`DOOR ${door.roman} · ${state.unlocked?'UNLOCKED':'LOCKED'}`,[door.x,4.25,-8.25],.48);objectLabel(state.unlocked?'E · OPEN':`${door.requirement} · ${state.detail}`,[door.x,.58,-7.95],.2)
 }
}
function handleLobbyProgressionDoor(id,trigger){
 const definition=LOBBY_PROGRESSION_DOORS.find(door=>door.id===id);if(!definition)return;const state=lobbyProgressDoorState(id);if(!state.unlocked){controls.unlock();return message(`DOOR ${definition.roman} · LOCKED`,`${definition.requirement}. Progress: ${state.detail}.`)}
 if(id==='badges'){lobbyOpenedProgressDoors.add(id);hideStorySelection();document.querySelector('#prompt').textContent='DOOR III OPENING · WALK INTO THE SUNROOM';controls.lock();return beginHotelRoomPassage(trigger,buildBadgeSunroom)}
 if(lobbyOpenedProgressDoors.has(id)){controls.unlock();return message(`DOOR ${definition.roman} · UNLOCKED`,'The lock is open. The room beyond this doorway will be connected after its contents are defined.')}
 lobbyOpenedProgressDoors.add(id);pickupTone();playPurgeCrash();refreshLobbyProgressionDoors();document.querySelector('#prompt').textContent=`DOOR ${definition.roman} UNLOCKED · ROOM CONNECTION PENDING`
}
function lobbyCampaignProgress(){if(hotelProgress.has('floor-two-room140'))return'ROOM 150 CLEARED';if(hotelProgress.has('floor-one-checkout'))return'FLOOR 2 UNLOCKED';if(loadFloorFive()?.phase==='complete')return'FLOOR 1 UNLOCKED';if(hotelArrivalItems.has('room304-key'))return'ROOM 304 ASSIGNED';return'CAMPAIGN READY'}
function lobbyRunProgress(game,mode){if(mode==='sandbox')return'ADMIN TOOLS ENABLED';if(mode==='endless')return hotelRunFloor?`FLOOR ${hotelRunFloor} · ROOM ${hotelRunRoom||1}`:'NEW PROCEDURAL RUN';if(game==='hotel')return lobbyCampaignProgress();if(game==='jailbreak')return`ACT ${Math.min(9,jailbreakStage+1)} / 9`;return`${saved.slice(0,8).filter(Boolean).length} / 8 CHAPTERS`}
function lobbyPreviewDefinition(game,mode){const definition=lobbyGames[game];if(mode==='sandbox')return{floor:'CUSTOM RUN',title:`${definition.label} SANDBOX`,copy:`Explore ${definition.title} with teleports, monster spawning, infinite health, and item controls.`};if(mode==='endless')return{floor:'PROCEDURAL',title:'ENDLESS DESCENT',copy:'Continue through numbered hotel rooms while the building rearranges its threats and supplies.'};return definition}
function updateLobbyPreview(){
 const definition=lobbyPreviewDefinition(selectedLobbyGame,selectedLobbyMode),preview=storySelect.querySelector('.lobby-preview');preview.dataset.previewGame=selectedLobbyGame;preview.dataset.previewMode=selectedLobbyMode;document.querySelector('#lobby-preview-floor').textContent=definition.floor;document.querySelector('#lobby-preview-title').textContent=definition.title;document.querySelector('#lobby-preview-copy').textContent=definition.copy;document.querySelector('#lobby-mode-progress').textContent=lobbyRunProgress(selectedLobbyGame,selectedLobbyMode);document.querySelector('#lobby-notice').textContent=`${lobbyGames[selectedLobbyGame].label} · ${selectedLobbyMode.toUpperCase()}`
}
function selectLobbyGame(game){
 if(!lobbyGames[game])return;selectedLobbyGame=game;storySelect.querySelectorAll('[data-lobby-game]').forEach(button=>{const active=button.dataset.lobbyGame===game;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});document.querySelector('#lobby-selected-game').textContent=lobbyGames[game].label;const endless=storySelect.querySelector('[data-lobby-rule="endless"]');endless.disabled=game!=='hotel';endless.setAttribute('aria-disabled',String(endless.disabled));if(endless.disabled&&selectedLobbyMode==='endless')selectedLobbyMode='normal';selectLobbyMode(selectedLobbyMode)
}
function selectLobbyMode(mode){
 if(!['normal','endless','sandbox'].includes(mode)||mode==='endless'&&selectedLobbyGame!=='hotel')return;selectedLobbyMode=mode;storySelect.querySelectorAll('[data-lobby-rule]').forEach(button=>{const active=button.dataset.lobbyRule===mode;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});updateLobbyPreview()
}
function renderLobbyBadges(){
	 const badges=lobbyBadgeDefinitions(),grid=document.querySelector('#lobby-badge-grid');grid.replaceChildren();for(const {glyph,name,copy,earned} of badges){const badge=document.createElement('article');badge.className=`lobby-badge${earned?'':' locked'}`;const icon=document.createElement('i'),text=document.createElement('span'),title=document.createElement('strong'),description=document.createElement('small');icon.textContent=earned?glyph:'?';title.textContent=name;description.textContent=earned?copy:'LOCKED · '+copy;text.append(title,description);badge.append(icon,text);grid.append(badge)}
}
function closeLobbyPanels(){storySelect.querySelectorAll('[data-lobby-panel]').forEach(panel=>panel.hidden=true);storySelect.querySelectorAll('[data-lobby-panel-target]').forEach(button=>button.classList.remove('active'))}
function toggleLobbyPanel(name){const target=storySelect.querySelector(`[data-lobby-panel="${name}"]`),opening=target?.hidden;closeLobbyPanels();if(opening&&target){target.hidden=false;storySelect.querySelector(`[data-lobby-panel-target="${name}"]`)?.classList.add('active');if(name==='badges')renderLobbyBadges()}}
function leaveActiveRunForLobby(){
 keyboardMovementFallback=false;if(floorFive)saveFloorFive();if(floorOne)saveFloorOne();if(floorTwo)saveFloorTwo();if(drowned)saveDrowned();if(pursuer)savePursuer();if(dlg.open)dlg.close();exitHotelHidingSpot(false);cancelEviction();cancelNoise();cancelHotelNoiseArc();floorFive=null;floorOne=null;floorTwo=null;collector=null;clockmaker=null;drowned=null;pursuer=null;hotelSideScene='';setBossEncounterHud(false);document.body.classList.remove('floor-one-panic','floor-one-exhausted','floor-one-cough','floor-two-storm','floor-two-gust','floor-two-lightning','noise-hunt','chef-lockdown','chef-freezer','chef-blackout','chef-final-service','chef-elevator-finale','drowned-rush','drowned-drain','pursuer-reveal','pursuer-chase','pursuer-impact');for(const id of ['#floor-one-hud','#floor-two-hud','#noise-hud','#boss-hud','#clockmaker-hud'])document.querySelector(id)?.classList.remove('active')
}
function decorateLobbyLounge(){
	 lobbyOpenedProgressDoors=new Set();for(const name of ['label:THE CABIN THAT WATCHES','label:THE INFINITE HOTEL · ROOM 13','label:CHOOSE YOUR STORY'])roomGroup.getObjectByName(name)?.removeFromParent();interactables=interactables.filter(item=>item.userData.type!=='story-choice');objectLabel('HOTEL NOCTURNE · NIGHT LOUNGE',[0,3.5,-2],.72);
	 const brass=0xb68b48,velvet=0x40242c;box('lobby lounge rug',[2,.02,-.4],[10,.05,6],0x4c2430,false);box('lobby lounge sofa',[6,.7,-1],[4.6,1.4,1.4],velvet,true);box('lobby lounge sofa back',[6,1.35,-1.55],[4.6,1.5,.35],velvet,true);box('lobby lounge table',[2,.48,-1],[2.5,.16,1.4],0x38261d,true);for(const x of [1.1,2.9])box('lounge table leg',[x,.22,-1],[.12,.5,.12],brass,false);const avatar=new THREE.Group();avatar.name='local lobby avatar';const body=new THREE.Mesh(new THREE.CapsuleGeometry(.3,.82,6,10),mat(0x4a3338,.65));body.position.y=1.2;avatar.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.27,16,10),mat(0xb48669,.7));head.position.y=1.95;avatar.add(head);for(const side of [-1,1]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.8,8),mat(0x17191b,.8));leg.position.set(side*.14,.42,0);avatar.add(leg)}avatar.position.set(3.3,0,-1.7);avatar.rotation.y=-.2;roomGroup.add(avatar);light([3,3,1],0xd0a362,9,9);setTimeout(()=>{if(!inLobby||!roomGroup)return;roomGroup.getObjectByName('label:JAILBREAK · BLACKRIDGE')?.removeFromParent();interactables=interactables.filter(item=>item.userData.type!=='story-choice');if(!roomGroup.getObjectByName('label:SERVICE ELEVATOR · CLOSED'))objectLabel('SERVICE ELEVATOR · CLOSED',[0,4.2,-8.25],.54)},260)
	 refreshLobbyProgressionDoors();setTimeout(()=>{if(!inLobby||!roomGroup)return;refreshLobbyProgressionDoors()},260)
}
function showStorySelection(){controls.unlock();document.body.classList.add('story-select-mode');document.body.classList.remove('lobby-hud-hidden');storySelect.hidden=false;closeLobbyPanels();selectLobbyGame(selectedLobbyGame);storySelect.querySelector(`[data-lobby-game="${selectedLobbyGame}"]`)?.focus({preventScroll:true})}
function hideStorySelection(){storySelect.hidden=true;document.body.classList.remove('story-select-mode','lobby-hud-hidden');closeLobbyPanels()}
let keyboardMovementFallback=false;
function armGameplayControls(){
 if(dlg.open)return;keyboardMovementFallback=true;canvas.tabIndex=0;canvas.focus({preventScroll:true});try{controls.lock()}catch{}setTimeout(()=>{if(!storySelect.hidden||dlg.open||controls.isLocked)return;document.querySelector('#prompt').textContent='WASD MOVE · CLICK THE GAME TO ENABLE MOUSE LOOK'},260)
}
controls.addEventListener('lock',()=>{keyboardMovementFallback=false});addEventListener('keydown',event=>{if(event.code==='Escape')keyboardMovementFallback=false},true);
function startLobbyMode(){
 document.querySelector('#lobby-notice').textContent='PREPARING RUN…';document.body.classList.toggle('sandbox-run',selectedLobbyMode==='sandbox');if(selectedLobbyMode==='endless'){hideStorySelection();setAdminHotelContext();return startHotelRun()}chooseStory(selectedLobbyGame);if(selectedLobbyMode==='sandbox')document.querySelector('#prompt').textContent='SANDBOX ACTIVE · F2 ADMIN · WASD MOVE';armGameplayControls()
}
async function inviteLobbyFriend(){const notice=document.querySelector('#lobby-notice'),data={title:'Hotel Nocturne',text:'Join my Hotel Nocturne lobby.',url:location.href};try{if(navigator.share)await navigator.share(data);else if(navigator.clipboard){await navigator.clipboard.writeText(location.href);notice.textContent='INVITE LINK COPIED'}else notice.textContent='COPY THE PAGE URL TO INVITE'}catch(error){if(error?.name!=='AbortError')notice.textContent='INVITE COULD NOT BE SHARED'}}
const buildStoryLobbyScene=buildStoryLobby;buildStoryLobby=function(){leaveActiveRunForLobby();const lock=controls.lock;controls.lock=()=>{};try{buildStoryLobbyScene()}finally{controls.lock=lock}decorateLobbyLounge();controls.unlock();showStorySelection()};
const chooseStoryScene=chooseStory;chooseStory=function(story){hideStorySelection();return chooseStoryScene(story)};
storySelect.querySelectorAll('[data-lobby-game]').forEach(button=>{button.addEventListener('focus',()=>selectLobbyGame(button.dataset.lobbyGame));button.addEventListener('click',()=>selectLobbyGame(button.dataset.lobbyGame))});storySelect.querySelectorAll('[data-lobby-rule]').forEach(button=>button.addEventListener('click',()=>selectLobbyMode(button.dataset.lobbyRule)));
storySelect.querySelector('#lobby-start').addEventListener('click',startLobbyMode);storySelect.querySelector('#lobby-invite').addEventListener('click',inviteLobbyFriend);storySelect.querySelectorAll('[data-lobby-panel-target]').forEach(button=>button.addEventListener('click',()=>toggleLobbyPanel(button.dataset.lobbyPanelTarget)));storySelect.querySelectorAll('.lobby-modal__close').forEach(button=>button.addEventListener('click',closeLobbyPanels));
addEventListener('keydown',event=>{if(event.code!=='KeyH'||event.repeat||['INPUT','SELECT','TEXTAREA'].includes(event.target.tagName))return;event.preventDefault();if(!storySelect.hidden)return document.body.classList.toggle('lobby-hud-hidden');clearTimeout(hudCompactHandle);hudRevealToken++;document.body.classList.toggle('hud-compact')});
