import fs from 'node:fs';

const read=relative=>fs.readFileSync(new URL(`../${relative}`,import.meta.url),'utf8');
const molly=read('game/18-molly.js');
const chef=read('game/16-floor-one.js');
const pursuer=read('game/15-pursuer.js');
const floorTwo=read('game/17-floor-two.js');
const collector=read('game/12-collector.js');
const clockmaker=read('game/13-clockmaker.js');
const drowned=read('game/14-drowned-guest.js');
const shared=read('game/18-monster-behavior.js');
const runtime=read('game/25-runtime.js');
const manifest=read('game/manifest.js');
const html=read('index.html');

function requireText(source,needle,label){
 if(!source.includes(needle))throw new Error(`Missing ${label}: ${needle}`);
}

// Molly: an interrupt stores a destination, investigates a fixed sound, then
// physically resumes the same terminal route before the hack completion event.
for(const [needle,label] of [
 ["['select','computer-travel','hack'].includes(molly.phase)",'interruptible computer actions'],
 ['molly.pendingComputer=molly.targetComputer','preserved interrupted destination'],
 ['molly.lastSound=[position.x??position[0],0,position.z??position[2]]','fixed sound location'],
 ["molly.phase='search-wait'",'finite local search'],
 ['molly.targetComputer=resume','physical terminal resume'],
 ['hackMollyComputer(molly.targetComputer)','hack completion at terminal'],
 ["mollySetDisplay('00')",'ordinary display restoration']
])requireText(molly,needle,`Molly ${label}`);

// Chef: the release point is the articulated hand; projectiles use swept
// collision, commit to their release target, stop on cover, and are removed
// after their one permitted player hit.
for(const [needle,label] of [
 ['userData.throwHand','visible throwing hand'],
 ['getWorldPosition(new THREE.Vector3())','hand-space release event'],
 ['releaseOrigin:origin.toArray()','recorded release origin'],
 ['monsterSegmentPlayerHitFraction(start,end,.12)','swept body collision'],
 ['monsterColliderHitFraction(start,end,collider,.12)','swept cover collision'],
 ['knife.hitApplied=true','single-hit latch'],
 ['clearFloorOneChefAttacks()','phase/reset projectile cleanup'],
 ["floorOne.chefActionStage='follow-through'",'follow-through stage'],
 ["triple?'triple-lead':'single'",'distinct multi-throw pattern']
])requireText(chef,needle,`Chef ${label}`);

// Pursuer: locomotion is distance-driven, acceleration is readable, barriers
// own their reaction, and capture checks body height plus intervening solids.
for(const [needle,label] of [
 ['function animatePursuerPerformance','performance animation'],
 ['rig.gaitDistance=(rig.gaitDistance||0)+moved','distance-driven gait'],
 ['pursuer.acceleration=Math.min(1','acceleration'],
 ["pursuer.barrierReaction=.8",'authored barrier reaction'],
 ['const moved=before.distanceTo(pursuerEntity.position)','blocked/stopped gait input'],
 ['const sameLevel=','vertical body overlap'],
 ['blocked=solidColliders.some','solid obstacle capture rejection']
])requireText(pursuer,needle,`Pursuer ${label}`);

// Distinct supporting identities.
for(const [needle,label] of [
 ['function moveFloorTwoMonsterSolid','shared solid-aware Floor 2 movement'],
 ["floorTwoWatcher.userData.watched=watched",'Watcher authoritative freeze state'],
 ["guest.userData.actionStage=reaching?'reach to tag':'pursue / evade'",'Ballroom tag windup'],
 ['if(!guest.userData.tagged&&guest.userData.tagWindup>=.32','tagged Guest exclusion'],
 ['data.lastSound=[camera.position.x,0,camera.position.z]','Gardener discrete sound memory'],
 ["data.state=distance<2?'search':'investigate'",'Gardener investigate state']
])requireText(floorTwo,needle,label);
for(const [needle,label] of [
 ["stage:'fetch'",'Collector fetch stage'],
 ["collector.recovery.stage='pickup'",'Collector pickup stage'],
 ["collector.recovery.stage='return'",'Collector return stage'],
 ["collector.recovery.stage='place'",'Collector place stage'],
 ["carriedPossession.visible=Boolean",'Collector visible carried object'],
 ['interactables=interactables.filter(object=>object!==entry.hit)','Collector removed-object interaction cleanup']
])requireText(collector,needle,label);
for(const [needle,label] of [
 ['tickChanged=tick!==clockmaker.lastTick','Clockmaker simulation-time tick event'],
 ['clockStepPulse=.34','Clockmaker visible segmented step cue'],
 ["clockActionStage=tick%4===3?'bell impact':'segmented tick'",'Clockmaker action-stage cue']
])requireText(clockmaker,needle,label);
for(const [needle,label] of [
 ['drownedActionStage','Drowned Guest readable action stage'],
 ["warning?'brace for burst':bursting?'burst forward':'dragging pursuit'",'Drowned Guest brace/burst sequence'],
 ['monsterTurnToward(drownedEntity,target','Drowned Guest target-oriented turning'],
 ['drownedWake.rotation.z','Drowned Guest directional wake']
])requireText(drowned,needle,label);

for(const [needle,label] of [
 ['function monsterPlayerBody','shared player body'],
 ['function monsterSegmentPlayerHitFraction','swept player collision'],
 ['function monsterColliderHitFraction','swept solid collision'],
 ['function updateMonsterDebugOverlay','developer AI trace'],
 ["event.code!=='F4'",'F4 overlay toggle']
])requireText(shared,needle,label);
requireText(runtime,'if(aiDebugEnabled)updateMonsterDebugOverlay()','throttled single-loop debug update');
requireText(runtime,'renderer.render(scene,camera)','single render loop');
requireText(manifest,"'18-monster-behavior.js'",'shared behavior module loading');
requireText(html,'id="ai-debug" hidden','debug overlay off by default');

console.log(JSON.stringify({
 kind:'source-contract regression (not a full playthrough)',
 molly:['interrupt memory','fixed-location investigation','physical terminal resume','completion event'],
 chef:['visible hand release','swept player/cover collision','single hit','attack cleanup'],
 pursuer:['acceleration','distance-driven gait','barrier reaction','body/cover capture'],
 supporting:['Collector pickup/return/place','Clockmaker segmented tick cue','Drowned wake/brace/burst','Watcher freeze','Ballroom tag windup','Gardener sound memory'],
 developerOverlay:'F4, hidden by default, updated in the existing render loop'
},null,2));
