// Chef abilities overhaul. This file replaces the old task-chain runtime while
// retaining Floor 1's existing room, inventory, save, and rendering systems.
const FLOOR_ONE_CHEF_CONFIG=Object.freeze({
 maxHealth:100,
 phaseTwoAt:70,
 phaseThreeAt:35,
 counterDamage:34,
 landingTrackTime:.52,
 landingLockTime:.72,
 leapDuration:.68,
 landingRadius:2.05,
 landingDamage:24,
 shockwaveSpeed:7.2,
 shockwaveThickness:.48,
 shockwaveMaxRadius:19,
 shockwaveDamage:18,
 doubleWaveDelay:1.18,
 knifeAimTime:.82,
 fanAimTime:1.02,
 knifeSpeed:12.5,
 fanSpeed:11.8,
 fanAngles:[-.34,-.17,0,.17,.34],
 panWindup:.76,
 panActive:.3,
 panRecovery:.62,
 panReach:3.45,
 panDamage:22,
 recovery:[2.9,2.55,3.55],
 stationCooldown:6.5,
 attackGap:[1.35,1.12,.95]
});
const FLOOR_ONE_CHEF_STATIONS=Object.freeze([
 {station:[-8,-6],zone:[-8,-3.35]},
 {station:[7,-10],zone:[7,-7.35]},
 {station:[-3,-15],zone:[-3,-12.35]}
]);

function ensureFloorOneChefArenaState(){
 if(!floorOne)return;
 const defaults={chefHealth:FLOOR_ONE_CHEF_CONFIG.maxHealth,chefCombatPhase:1,chefAction:'idle',chefActionTimer:0,chefActionSerial:0,chefAttackCooldown:1.2,chefLandingTarget:{x:0,z:0},chefLandingLocked:false,chefLeapStart:{x:0,z:0},chefComboLeapsRemaining:0,chefPostWaveAction:'recovery',chefRecoveryZone:-1,chefCounteredSerial:-1,chefZoneCooldowns:[0,0,0],chefCounterCount:0,chefExitUnlocked:false,chefPanHitApplied:false};
 for(const [key,value] of Object.entries(defaults))if(floorOne[key]===undefined)floorOne[key]=Array.isArray(value)?[...value]:value&&typeof value==='object'?{...value}:value;
 floorOne.chefHealth=THREE.MathUtils.clamp(Number(floorOne.chefHealth)||0,0,FLOOR_ONE_CHEF_CONFIG.maxHealth);
 floorOne.chefZoneCooldowns=Array.from({length:3},(_,index)=>Math.max(0,Number(floorOne.chefZoneCooldowns?.[index])||0));
 if(floorOne.chefHealth<=0){floorOne.chefExitUnlocked=true;if(!['elevator-finale','survived'].includes(floorOne.chefStage))floorOne.chefStage='defeated'}
 else if(floorOne.chefTriggered&&!['waiting','combat'].includes(floorOne.chefStage))floorOne.chefStage='combat';
 updateFloorOneChefPhase(false)
}
function updateFloorOneChefPhase(announce=true){
 if(!floorOne)return 1;const previous=floorOne.chefCombatPhase||1,health=floorOne.chefHealth??100,next=health<=FLOOR_ONE_CHEF_CONFIG.phaseThreeAt?3:health<=FLOOR_ONE_CHEF_CONFIG.phaseTwoAt?2:1;floorOne.chefCombatPhase=next;
 if(announce&&next!==previous){clearFloorOneChefArenaAttacks(false);floorOne.chefAction='stagger';floorOne.chefActionTimer=1.6;floorOne.chefAttackCooldown=1.1;playPurgeCrash();document.querySelector('#prompt').textContent=next===2?'PHASE TWO · FAN KNIVES AND DOUBLE SHOCKWAVES':next===3?'PHASE THREE · FINAL SERVICE COMBINATION':'PHASE ONE · LEARN THE COUNTER'}return next
}
function clearFloorOneChefArenaVisuals(){
 for(const wave of floorOneChefShockwaves)wave.mesh?.removeFromParent();floorOneChefShockwaves=[];
 floorOneChefLandingMarker?.removeFromParent();floorOneChefLandingMarker=null;
 for(const mesh of floorOneChefFanPreview)mesh?.removeFromParent();floorOneChefFanPreview=[];
}
function clearFloorOneChefArenaAttacks(resetAction=true){
 clearFloorOneChefAttacks();clearFloorOneChefArenaVisuals();if(!floorOne)return;
 floorOne.chefLandingLocked=false;floorOne.chefComboLeapsRemaining=0;floorOne.chefPostWaveAction='recovery';floorOne.chefPanHitApplied=false;
 if(resetAction){floorOne.chefAction='idle';floorOne.chefActionTimer=0;floorOne.chefAttackCooldown=1.1}
 if(floorOneChef){floorOneChef.position.y=0;floorOneChef.rotation.z=0;if(floorOneChef.userData.pan)floorOneChef.userData.pan.visible=false}
}
function resetFloorOneChefAttempt(){
 clearFloorOneChefArenaAttacks();floorOne.chefTriggered=true;floorOne.chefStage='combat';floorOne.chefHealth=FLOOR_ONE_CHEF_CONFIG.maxHealth;floorOne.chefCombatPhase=1;floorOne.chefAction='idle';floorOne.chefActionTimer=0;floorOne.chefActionSerial=0;floorOne.chefAttackCooldown=1.2;floorOne.chefRecoveryZone=-1;floorOne.chefCounteredSerial=-1;floorOne.chefZoneCooldowns=[0,0,0];floorOne.chefCounterCount=0;floorOne.chefExitUnlocked=false;floorOne.gasValves=[];floorOne.chefRetryPending=false;floorOne.noise=0;floorOne.huntTimer=0;saveFloorOne()
}

const makeFloorOneChefBeforeAbilities=makeFloorOneChef;
makeFloorOneChef=function(){
 const chef=makeFloorOneChefBeforeAbilities(),rig=chef.userData,iron=mat(0x596064,.22),handle=mat(0x2b211d,.72),pan=new THREE.Group(),bowl=new THREE.Mesh(new THREE.CylinderGeometry(.72,.58,.14,20),iron),grip=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,1.05),handle);bowl.rotation.x=Math.PI/2;grip.position.z=-.92;pan.add(bowl,grip);pan.position.set(0,-.08,.48);pan.visible=false;rig.offElbow.add(pan);rig.pan=pan;rig.cleaver=rig.offElbow.children.find(child=>child!==pan&&child.geometry?.parameters?.width===.1)||null;
 rig.fanKnives=[];for(const angle of FLOOR_ONE_CHEF_CONFIG.fanAngles){const blade=new THREE.Mesh(new THREE.BoxGeometry(.055,.1,.66),iron);blade.position.set(Math.sin(angle)*.34,-.02,.42+Math.cos(angle)*.12);blade.rotation.y=angle;blade.visible=false;rig.throwHand.add(blade);rig.fanKnives.push(blade)}return chef
};

function chefArenaRing(name,x,z,inner,outer,color,opacity=.88){const mesh=new THREE.Mesh(new THREE.RingGeometry(inner,outer,48),new THREE.MeshBasicMaterial({color,transparent:true,opacity,side:THREE.DoubleSide,depthWrite:false}));mesh.name=name;mesh.position.set(x,.035,z);mesh.rotation.x=-Math.PI/2;roomGroup.add(mesh);return mesh}
function buildFloorOneChefArena(){
 clearFloorOneChefArenaVisuals();resetHotelSideScene();ensureFloorOneChefArenaState();if(floorOne.chefStage==='combat'){floorOne.chefAction='idle';floorOne.chefActionTimer=0;floorOne.chefAttackCooldown=Math.max(.8,floorOne.chefAttackCooldown||0);floorOne.chefLandingLocked=false;floorOne.chefComboLeapsRemaining=0;floorOne.chefRecoveryZone=-1}floorOneShell('THE CHEF · COOLING KITCHEN',28,38,5.5,0x4d4742,0x3f2625);document.body.classList.add('chef-lockdown');floorOneChefCoolingZones=[];floorOneChefSteam=[];
 for(const x of [-7,0,7])for(const z of [10,5]){const table=box('set dining table',[x,.75,z],[4.8,1.5,2.3],0x4b2d22,true);floorOneChefCover.push(table);for(const side of [-1,1])box('dining chair',[x+side*2,.5,z],[.8,1,1],0x39231d,true);for(const offset of [-1.3,0,1.3]){const plate=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.035,18),mat(0xd8d1c5,.28));plate.position.set(x+offset,1.53,z);roomGroup.add(plate)}const flame=new THREE.PointLight(0xff9f48,3.2,4,2);flame.position.set(x,2.2,z);roomGroup.add(flame)}
 for(const x of [-6,6]){const pillar=box('kitchen threshold pillar',[x,2.4,1.2],[1.1,4.8,1.1],0x67605a,true);floorOneChefCover.push(pillar)}
 for(const [index,spec] of FLOOR_ONE_CHEF_STATIONS.entries()){
  const [x,z]=spec.station,[zoneX,zoneZ]=spec.zone,station=box('cooling station '+(index+1),[x,.85,z],[4.5,1.7,2],0x646b6c,true);floorOneChefCover.push(station);const valve=new THREE.Group(),wheel=new THREE.Mesh(new THREE.TorusGeometry(.5,.1,8,18),mat(0xa72b21,.25)),stem=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,.45,8),mat(0x6a3a2c,.3));wheel.rotation.x=Math.PI/2;stem.rotation.x=Math.PI/2;stem.position.z=-.2;valve.add(wheel,stem);valve.position.set(x,1.55,z+1.1);roomGroup.add(valve);interactive([x,1.45,z+1.5],[2.2,2.2,1.4],8,'floor-one','valve:'+index);objectLabel(`COOLING VALVE ${index+1} · E ACTIVATE`,[x,2.45,z+1.55],.29);
  const ring=chefArenaRing('cooling counter zone '+(index+1),zoneX,zoneZ,1.72,2.05,0x4dc9df,.72),core=chefArenaRing('cooling zone core '+(index+1),zoneX,zoneZ,.18,.28,0xe8fbff,.95);floorOneChefCoolingZones.push({index,x:zoneX,z:zoneZ,radius:2.05,ring,core,wheel,burst:0});objectLabel(`COOLING ZONE ${index+1}`,[zoneX,.24,zoneZ],.22)
 }
 for(const [index,x,z] of [[0,-1,-5],[1,8,-13],[2,-10,-11]]){const pipe=box('phase two vent '+index,[x,3.9,z],[3.2,.18,.18],0x8a5639,false),strip=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.2),new THREE.MeshBasicMaterial({color:0xc66136,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));strip.rotation.x=-Math.PI/2;strip.position.set(x,.025,z);roomGroup.add(strip);floorOneChefSteam.push({mesh:pipe,strip,x,z,radius:1.55,phase:index*1.7,active:false})}
 for(const [index,x,z] of [[0,9,-2],[1,-10,-9],[2,8,-16]]){const lid=box('silver pot lid '+index,[x,1.5,z],[1.2,.12,1.2],0xa9b0b1,false);lid.rotation.x=.35;interactive([x,1.35,z],[1.8,1.7,1.8],8,'floor-one','lid:'+index);objectLabel(floorOne.opened.includes('chef-lid-'+index)?'POT LID · THROWN':'POT LID · E DISTRACT',[x,2.3,z],.27)}
 floorOneChefPanRack=box('hanging pan rack',[11,2.5,-15.2],[2.6,3,.42],0x53595b,true);floorOneChefCover.push(floorOneChefPanRack);objectLabel('PAN RACK · KNIFE COVER',[11,4.25,-14.8],.24);
 const exitDoor=box('chef escape elevator',[0,floorOne.chefExitUnlocked?5.1:2,-18.72],[5.8,4,.3],floorOne.chefExitUnlocked?0x6f765f:0x303637,false);floorOneChefGateParts=[exitDoor];interactive([0,1.8,-18.05],[5.5,3.9,1.3],8,'floor-one','chef-exit');objectLabel(floorOne.chefExitUnlocked?'ELEVATOR RELEASED · RUN':'ELEVATOR LOCKED · DEFEAT THE CHEF',[0,4.25,-18],.38);
 floorOneChef=makeFloorOneChef();floorOneChef.visible=floorOne.chefTriggered;floorOneChef.position.set(0,0,-2);camera.position.set(0,1.7,16);camera.lookAt(0,1.55,-7);setFloorOneCopy('The Chef','The dining room opens into a cooling kitchen. Marked floor zones connect to three red valves.','Bait a slam into a marked cooling zone, jump its wave, then activate that zone\'s valve during recovery.','LANDING CIRCLES LOCK BEFORE IMPACT · SPACE JUMPS · C CROUCHES');if(floorOne.chefTriggered)updateFloorOneChefHud();else setBossEncounterHud(false)
}

buildFloorOneKitchen=buildFloorOneChefArena;
const buildFloorOnePhaseBeforeChefAbilities=buildFloorOnePhase;
buildFloorOnePhase=function(){
 if(floorOne?.phase!==10)return buildFloorOnePhaseBeforeChefAbilities();
 if(floorOne.chefRetryPending)resetFloorOneChefAttempt();else ensureFloorOneChefArenaState();clearFloorOneChefArenaAttacks();document.body.classList.remove('floor-one-panic','floor-one-exhausted','floor-one-cough','noise-hunt','chef-freezer','chef-blackout','chef-final-service','chef-elevator-finale');document.querySelector('#noise-hud')?.classList.remove('active','danger');floorOne.drawerHolding=false;floorOne.drawerProgress=0;floorOne.activeValve=null;floorOne.lookDown=false;floorOne.dying=false;
 if(floorOne.chefStage==='elevator-finale'||floorOne.chefStage==='survived')return buildFloorOneChefElevator();return buildFloorOneChefArena()
};

function chefPhaseCopy(){const phase=floorOne.chefCombatPhase||1;if(floorOne.chefStage==='defeated')return['THE CHEF · STAGGERED','The service elevator has released. Run.'];if(floorOne.chefStage==='elevator-finale')return['ELEVATOR ESCAPE','The doors are closing.'];if(floorOne.chefStage==='survived')return['THE CHEF · SURVIVED','The kitchen recedes above the descending lift.'];return phase===1?['PHASE ONE · LEARN THE KITCHEN','Dodge the locked landing and jump the wave. Counter from the matching valve during recovery.']:phase===2?['PHASE TWO · CONTROL THE SPACE','Fan knives use lanes. Slams release two jumpable waves. Vent strips cycle with visible warnings.']:['PHASE THREE · FINAL SERVICE','Two marked leaps lead into a wave and a high pan sweep. Jump, then crouch or retreat.']}
updateFloorOneChefHud=function(){if(!floorOne?.chefTriggered)return;ensureFloorOneChefArenaState();const [phase,instruction]=chefPhaseCopy(),health=floorOne.chefHealth/FLOOR_ONE_CHEF_CONFIG.maxHealth;setBossEncounterHud(true,'THE CHEF · '+Math.ceil(floorOne.chefHealth)+'%',phase,instruction,health);const bar=document.querySelector('#boss-progress');if(bar){bar.style.transform=`scaleX(${health})`;bar.style.transformOrigin='left'}};

function setChefLandingMarker(x,z,locked=false){
 if(!floorOneChefLandingMarker){floorOneChefLandingMarker=chefArenaRing('Chef locked landing warning',x,z,.12,FLOOR_ONE_CHEF_CONFIG.landingRadius,0xdf3f2c,.48);floorOneChefLandingMarker.material.blending=THREE.AdditiveBlending}floorOneChefLandingMarker.position.x=x;floorOneChefLandingMarker.position.z=z;floorOneChefLandingMarker.material.color.setHex(locked?0xffc247:0xdf3f2c);floorOneChefLandingMarker.material.opacity=locked?.72:.42
}
function chefSafeLandingTarget(){return{x:THREE.MathUtils.clamp(camera.position.x,-11.1,11.1),z:THREE.MathUtils.clamp(camera.position.z,-16.1,12.5)}}
function beginFloorOneChefJump(comboLeaps=0){
 floorOne.chefActionSerial++;floorOne.chefAction='jump-track';floorOne.chefActionTimer=FLOOR_ONE_CHEF_CONFIG.landingTrackTime;floorOne.chefLandingLocked=false;floorOne.chefComboLeapsRemaining=comboLeaps;floorOne.chefLandingTarget=chefSafeLandingTarget();floorOne.chefLeapStart={x:floorOneChef.position.x,z:floorOneChef.position.z};setChefLandingMarker(floorOne.chefLandingTarget.x,floorOne.chefLandingTarget.z,false);floorOne.chefActionStage='jump targeting';document.querySelector('#prompt').textContent='THE CHEF CROUCHES · THE LANDING CIRCLE IS STILL TRACKING'
}
function lockFloorOneChefLanding(){floorOne.chefLandingLocked=true;floorOne.chefAction='jump-lock';floorOne.chefActionTimer=FLOOR_ONE_CHEF_CONFIG.landingLockTime;floorOne.chefLandingTarget=chefSafeLandingTarget();setChefLandingMarker(floorOne.chefLandingTarget.x,floorOne.chefLandingTarget.z,true);floorOne.chefActionStage='landing locked';pickupTone();document.querySelector('#prompt').textContent='LANDING LOCKED · LEAVE THE CIRCLE'}
function launchFloorOneChefLeap(){floorOne.chefAction='jump-air';floorOne.chefActionTimer=FLOOR_ONE_CHEF_CONFIG.leapDuration;floorOne.chefLeapStart={x:floorOneChef.position.x,z:floorOneChef.position.z};floorOne.chefActionStage='airborne';playPurgeCrash()}
function chefZoneAt(x,z){let match=-1,best=Infinity;for(const zone of floorOneChefCoolingZones){const distance=Math.hypot(x-zone.x,z-zone.z);if(distance<=zone.radius&&distance<best){best=distance;match=zone.index}}return match}
function spawnFloorOneChefShockwave(delay=0){const mesh=chefArenaRing('Chef visible shockwave',floorOneChef.position.x,floorOneChef.position.z,.82,1.18,0xf5b35f,.9);mesh.visible=delay<=0;floorOneChefShockwaves.push({mesh,originX:floorOneChef.position.x,originZ:floorOneChef.position.z,radius:.45,delay,hitApplied:false})}
function completeFloorOneChefLanding(){
 floorOneChef.position.set(floorOne.chefLandingTarget.x,0,floorOne.chefLandingTarget.z);floorOneChefLandingMarker?.removeFromParent();floorOneChefLandingMarker=null;playPurgeCrash();const distance=Math.hypot(camera.position.x-floorOneChef.position.x,camera.position.z-floorOneChef.position.z);if(distance<=FLOOR_ONE_CHEF_CONFIG.landingRadius&&playerFeetY<1.35&&floorOne.chefDamageCooldown<=0)damageFloorOneChef(FLOOR_ONE_CHEF_CONFIG.landingDamage,'THE CHEF LANDED ON YOU');
 if(floorOne.chefComboLeapsRemaining>0){floorOne.chefComboLeapsRemaining--;floorOne.chefAction='combo-pause';floorOne.chefActionTimer=.28;floorOne.chefActionStage='between marked leaps';document.querySelector('#prompt').textContent='FIRST IMPACT · A SECOND LANDING CIRCLE FORMS';return}
 const double=floorOne.chefCombatPhase===2;spawnFloorOneChefShockwave(0);if(double)spawnFloorOneChefShockwave(FLOOR_ONE_CHEF_CONFIG.doubleWaveDelay);floorOne.chefRecoveryZone=chefZoneAt(floorOneChef.position.x,floorOneChef.position.z);floorOne.chefAction=floorOne.chefPostWaveAction==='pan'?'combo-wave-wait':'wave-wait';floorOne.chefActionTimer=double?FLOOR_ONE_CHEF_CONFIG.doubleWaveDelay+.42:.42;floorOne.chefActionStage=double?'double shockwaves':'shockwave';document.querySelector('#prompt').textContent=double?'DOUBLE SHOCKWAVE · JUMP · LAND · JUMP AGAIN':'SHOCKWAVE · JUMP THE VISIBLE RING'
}
function updateFloorOneChefShockwaves(dt){
 for(const wave of [...floorOneChefShockwaves]){wave.delay-=dt;if(wave.delay>0){wave.mesh.visible=false;continue}wave.mesh.visible=true;wave.radius+=FLOOR_ONE_CHEF_CONFIG.shockwaveSpeed*dt;wave.mesh.scale.setScalar(wave.radius);wave.mesh.material.opacity=Math.max(.18,.95-wave.radius/FLOOR_ONE_CHEF_CONFIG.shockwaveMaxRadius*.72);const distance=Math.hypot(camera.position.x-wave.originX,camera.position.z-wave.originZ),onRing=Math.abs(distance-wave.radius)<=FLOOR_ONE_CHEF_CONFIG.shockwaveThickness;if(!wave.hitApplied&&onRing&&playerFeetY<.48){wave.hitApplied=true;if(floorOne.chefDamageCooldown<=0)damageFloorOneChef(FLOOR_ONE_CHEF_CONFIG.shockwaveDamage,'THE CHEF\'S SHOCKWAVE CAUGHT YOUR FEET')}if(wave.radius>=FLOOR_ONE_CHEF_CONFIG.shockwaveMaxRadius){wave.mesh.removeFromParent();floorOneChefShockwaves=floorOneChefShockwaves.filter(item=>item!==wave)}}
}

function beginFloorOneChefKnifeAttack(fan=false){
 floorOne.chefActionSerial++;floorOne.chefAction=fan?'fan-aim':'knife-aim';floorOne.chefActionTimer=fan?FLOOR_ONE_CHEF_CONFIG.fanAimTime:FLOOR_ONE_CHEF_CONFIG.knifeAimTime;floorOne.chefKnifeTarget={x:camera.position.x,z:camera.position.z};floorOne.chefKnifeMode='aim';floorOne.chefActionStage=fan?'fan preview':'aimed knife';floorOneChef.userData.handKnife.visible=!fan;for(const blade of floorOneChef.userData.fanKnives||[])blade.visible=fan;pickupTone();document.querySelector('#prompt').textContent=fan?'FAN THROW · FIND A GAP OR SOLID COVER':'AIMED KNIFE · SIDESTEP OR USE SOLID COVER'
}
function releaseFloorOneChefKnifeAttack(fan=false){
 if(fan){const origin=floorOneChef.position.clone(),base=new THREE.Vector3(floorOne.chefKnifeTarget.x-origin.x,0,floorOne.chefKnifeTarget.z-origin.z).normalize();for(const [index,angle] of FLOOR_ONE_CHEF_CONFIG.fanAngles.entries()){const direction=base.clone().applyAxisAngle(new THREE.Vector3(0,1,0),angle),target=origin.clone().addScaledVector(direction,28);spawnFloorOneChefKnife(target.x,target.z,FLOOR_ONE_CHEF_CONFIG.fanSpeed,'fan-'+index)}}else spawnFloorOneChefKnife(floorOne.chefKnifeTarget.x,floorOne.chefKnifeTarget.z,FLOOR_ONE_CHEF_CONFIG.knifeSpeed,'aimed');
 floorOneChef.userData.handKnife.visible=false;for(const blade of floorOneChef.userData.fanKnives||[])blade.visible=false;floorOne.chefKnifeMode='cooldown';floorOne.chefAction='attack-recovery';floorOne.chefActionTimer=fan?.72:.55;floorOne.chefRecoverTimer=.5;floorOne.chefActionStage=fan?'fan follow-through':'knife follow-through';playPurgeCrash();document.querySelector('#prompt').textContent=fan?'FAN RELEASED · THE LANES ARE COMMITTED':'KNIFE RELEASED · IT WILL NOT CURVE'
}
function beginFloorOneChefPanSweep(){floorOne.chefActionSerial++;floorOne.chefAction='pan-windup';floorOne.chefActionTimer=FLOOR_ONE_CHEF_CONFIG.panWindup;floorOne.chefPanHitApplied=false;floorOne.chefActionStage='high pan windup';floorOneChef.userData.pan.visible=true;monsterTurnToward(floorOneChef,new THREE.Vector3(camera.position.x,0,camera.position.z),1,20);document.querySelector('#prompt').textContent='HIGH PAN SWEEP · CROUCH OR RETREAT'}
function updateFloorOneChefPanHit(){const crouched=Boolean(keys.KeyC||keys.ControlLeft||keys.ControlRight||parkourLowProfile()),distance=Math.hypot(camera.position.x-floorOneChef.position.x,camera.position.z-floorOneChef.position.z);if(!floorOne.chefPanHitApplied&&!crouched&&distance<=FLOOR_ONE_CHEF_CONFIG.panReach){floorOne.chefPanHitApplied=true;if(floorOne.chefDamageCooldown<=0)damageFloorOneChef(FLOOR_ONE_CHEF_CONFIG.panDamage,'THE CHEF\'S HIGH PAN SWEEP STRUCK YOU')}}

function startFloorOneChefRecovery(){floorOne.chefAction='recovery';floorOne.chefActionTimer=FLOOR_ONE_CHEF_CONFIG.recovery[(floorOne.chefCombatPhase||1)-1];floorOne.chefActionStage=floorOne.chefRecoveryZone>=0?`vulnerable in cooling zone ${floorOne.chefRecoveryZone+1}`:'recovering outside cooling zones';document.querySelector('#prompt').textContent=floorOne.chefRecoveryZone>=0?`CHEF VULNERABLE · ACTIVATE COOLING VALVE ${floorOne.chefRecoveryZone+1}`:'RECOVERY · BAIT THE NEXT SLAM INTO A MARKED ZONE'}
function chooseFloorOneChefAttack(){
 const phase=floorOne.chefCombatPhase||1,cycle=floorOne.chefAttackCycle++;
 if(phase===1)return cycle%2===0?beginFloorOneChefKnifeAttack(false):beginFloorOneChefJump(0);
 if(phase===2)return cycle%3===0?beginFloorOneChefKnifeAttack(true):cycle%3===1?beginFloorOneChefJump(0):beginFloorOneChefKnifeAttack(false);
 floorOne.chefPostWaveAction='pan';return cycle%3===0?beginFloorOneChefJump(1):cycle%3===1?beginFloorOneChefKnifeAttack(true):beginFloorOneChefJump(1)
}
function updateFloorOneChefVents(dt){
 const enabled=floorOne.chefCombatPhase===2&&floorOne.chefStage==='combat';floorOne.chefSteamClock=(floorOne.chefSteamClock||0)+dt;for(const vent of floorOneChefSteam){const cycle=(floorOne.chefSteamClock+vent.phase)%6,warning=enabled&&cycle<1.05,active=enabled&&cycle>=1.05&&cycle<2.15;vent.active=active;vent.mesh.material.emissive.setHex(active?0xe5f8ff:warning?0xc66b43:0x000000);vent.mesh.material.emissiveIntensity=active?4:warning?1.4:0;vent.strip.material.opacity=active?.34:warning?.22:.08;if(active&&Math.hypot(camera.position.x-vent.x,camera.position.z-vent.z)<vent.radius&&floorOne.chefDamageCooldown<=0)damageFloorOneChef(12,'A MARKED KITCHEN VENT BURNED YOU')}
}
function chefBodyContactBlocked(){const start=floorOneChef.position.clone().setY(1),end=new THREE.Vector3(camera.position.x,playerFeetY+.8,camera.position.z);return solidColliders.some(collider=>monsterColliderHitFraction(start,end,collider,.32)!==null)}
function updateFloorOneChefArena(dt){
 ensureFloorOneChefArenaState();if(!floorOneChef)return;
 if(!floorOne.chefTriggered&&camera.position.z<11.5){floorOne.chefTriggered=true;floorOne.chefStage='combat';floorOne.chefAction='idle';floorOne.chefAttackCooldown=1.25;floorOne.noise=0;floorOne.huntTimer=0;if(floorOneEntity)floorOneEntity.visible=false;floorOneChef.visible=true;playPurgeCrash();horrorStinger();title.textContent='THE CHEF';objective.textContent='BAIT A SLAM INTO A COOLING ZONE · Jump the wave, then activate its red valve during recovery.';document.querySelector('#prompt').textContent='THE DOORS LOCK · THE NOISE SYSTEM SHUTS DOWN';saveFloorOne()}
 if(!floorOne.chefTriggered)return;floorOne.noise=0;floorOne.huntTimer=0;document.querySelector('#noise-hud')?.classList.remove('active','danger');floorOne.chefDamageCooldown=Math.max(0,floorOne.chefDamageCooldown-dt);floorOne.chefZoneCooldowns=floorOne.chefZoneCooldowns.map(value=>Math.max(0,value-dt));for(const zone of floorOneChefCoolingZones){zone.burst=Math.max(0,zone.burst-dt);zone.ring.material.color.setHex(zone.burst>0?0xd9fbff:floorOne.chefZoneCooldowns[zone.index]>0?0x50606a:0x4dc9df);zone.ring.material.opacity=zone.burst>0?.95:floorOne.chefZoneCooldowns[zone.index]>0?.28:.72;zone.wheel.rotation.z+=zone.burst>0?dt*12:0}
 if(floorOne.chefStage==='survived'){floorOne.chefTransitionTimer-=dt;if(floorOne.chefTransitionTimer<=0)finishHotelFloorOne();return}if(floorOne.chefStage==='elevator-finale')return updateFloorOneChefFinale(dt);updateFloorOneChefKnives(dt);updateFloorOneChefShockwaves(dt);updateFloorOneChefVents(dt);if(floorOne.chefStage==='defeated'){floorOneChef.userData.body.rotation.z=THREE.MathUtils.lerp(floorOneChef.userData.body.rotation.z,-.18,Math.min(1,dt*4));updateFloorOneChefHud();return}
 floorOne.chefActionTimer=Math.max(0,floorOne.chefActionTimer-dt);const action=floorOne.chefAction;
 if(action==='jump-track'){floorOne.chefLandingTarget=chefSafeLandingTarget();setChefLandingMarker(floorOne.chefLandingTarget.x,floorOne.chefLandingTarget.z,false);if(floorOne.chefActionTimer<=0)lockFloorOneChefLanding()}
 else if(action==='jump-lock'){if(floorOne.chefActionTimer<=0)launchFloorOneChefLeap()}
 else if(action==='jump-air'){const progress=1-floorOne.chefActionTimer/FLOOR_ONE_CHEF_CONFIG.leapDuration,start=floorOne.chefLeapStart,target=floorOne.chefLandingTarget;floorOneChef.position.x=THREE.MathUtils.lerp(start.x,target.x,progress);floorOneChef.position.z=THREE.MathUtils.lerp(start.z,target.z,progress);floorOneChef.position.y=Math.sin(progress*Math.PI)*4.2;if(floorOne.chefActionTimer<=0)completeFloorOneChefLanding()}
 else if(action==='combo-pause'){if(floorOne.chefActionTimer<=0)beginFloorOneChefJump(floorOne.chefComboLeapsRemaining)}
 else if(action==='wave-wait'){if(floorOne.chefActionTimer<=0)startFloorOneChefRecovery()}
 else if(action==='combo-wave-wait'){if(floorOne.chefActionTimer<=0)beginFloorOneChefPanSweep()}
 else if(action==='knife-aim'||action==='fan-aim'){monsterTurnToward(floorOneChef,new THREE.Vector3(floorOne.chefKnifeTarget.x,0,floorOne.chefKnifeTarget.z),dt,8);if(floorOne.chefActionTimer<=0)releaseFloorOneChefKnifeAttack(action==='fan-aim')}
 else if(action==='pan-windup'){if(floorOne.chefActionTimer<=0){floorOne.chefAction='pan-active';floorOne.chefActionTimer=FLOOR_ONE_CHEF_CONFIG.panActive;floorOne.chefActionStage='high pan active';playPurgeCrash()}}
 else if(action==='pan-active'){updateFloorOneChefPanHit();if(floorOne.chefActionTimer<=0){floorOne.chefAction='pan-recovery';floorOne.chefActionTimer=FLOOR_ONE_CHEF_CONFIG.panRecovery;floorOne.chefActionStage='pan follow-through'}}
 else if(action==='pan-recovery'){if(floorOne.chefActionTimer<=0){floorOneChef.userData.pan.visible=false;startFloorOneChefRecovery()}}
 else if(action==='recovery'){if(floorOne.chefActionTimer<=0){floorOne.chefRecoveryZone=-1;floorOne.chefAction='idle';floorOne.chefAttackCooldown=FLOOR_ONE_CHEF_CONFIG.attackGap[(floorOne.chefCombatPhase||1)-1]}}
 else if(action==='stagger'||action==='attack-recovery'){if(floorOne.chefActionTimer<=0){floorOne.chefAction='idle';floorOne.chefAttackCooldown=FLOOR_ONE_CHEF_CONFIG.attackGap[(floorOne.chefCombatPhase||1)-1]}}
 else{floorOne.chefAttackCooldown=Math.max(0,floorOne.chefAttackCooldown-dt);if(floorOne.chefAttackCooldown<=0)chooseFloorOneChefAttack()}
 const contactDistance=Math.hypot(floorOneChef.position.x-camera.position.x,floorOneChef.position.z-camera.position.z),sameFloor=Math.abs(floorOneChef.position.y-playerFeetY)<1.4;if(!['jump-air','recovery','stagger'].includes(floorOne.chefAction)&&contactDistance<1.05&&sameFloor&&!chefBodyContactBlocked())return failFloorOne('THE CHEF CAUGHT YOU BETWEEN ATTACKS');animateFloorOneChef(dt,performance.now()*.001);updateFloorOneChefHud()
}
updateFloorOneChef=updateFloorOneChefArena;

animateFloorOneChef=function(dt,time){
 if(!floorOneChef)return;const rig=floorOneChef.userData,previous=rig.lastPosition||floorOneChef.position.clone(),moved=previous.distanceTo(floorOneChef.position),moving=moved>.001&&floorOne.chefAction!=='jump-air';rig.lastPosition=floorOneChef.position.clone();rig.gait=(rig.gait||0)+Math.min(.2,moved)*8;const gait=Math.sin(rig.gait),action=floorOne.chefAction,aim=action==='knife-aim'||action==='fan-aim',jumping=['jump-track','jump-lock','jump-air'].includes(action),pan=['pan-windup','pan-active','pan-recovery'].includes(action),recover=action==='recovery'||action==='stagger',alpha=Math.min(1,dt*11);rig.body.rotation.z=THREE.MathUtils.lerp(rig.body.rotation.z,recover?-.12:moving?gait*.025:0,alpha);rig.head.rotation.y=THREE.MathUtils.lerp(rig.head.rotation.y,aim?0:Math.sin(time*1.7)*.035,Math.min(1,dt*5));rig.throwArm.rotation.x=THREE.MathUtils.lerp(rig.throwArm.rotation.x,aim?-1.28:jumping?.35:0,alpha);rig.throwArm.rotation.z=THREE.MathUtils.lerp(rig.throwArm.rotation.z,action==='fan-aim'?.45:aim?-.2:jumping?-.6:-.22,alpha);rig.throwElbow.rotation.x=THREE.MathUtils.lerp(rig.throwElbow.rotation.x,aim?-.42:0,alpha);const panAmount=action==='pan-windup'?-1.55:action==='pan-active'?.9:action==='pan-recovery'?.2:jumping?.35:0;rig.offArm.rotation.x=THREE.MathUtils.lerp(rig.offArm.rotation.x,panAmount,alpha);rig.offArm.rotation.z=THREE.MathUtils.lerp(rig.offArm.rotation.z,action==='pan-active'?1.05:-rig.offArm.position.x*.12,alpha);rig.offElbow.rotation.x=THREE.MathUtils.lerp(rig.offElbow.rotation.x,pan?-.6:0,alpha);rig.handKnife.visible=action==='knife-aim';if(rig.pan)rig.pan.visible=pan
};

function tryFloorOneChefCoolingCounter(index){
 ensureFloorOneChefArenaState();if(!floorOne.chefTriggered)return document.querySelector('#prompt').textContent='THE COOLING SYSTEM IS LOCKED UNTIL THE FIGHT BEGINS';if(floorOne.chefStage!=='combat')return document.querySelector('#prompt').textContent=floorOne.chefExitUnlocked?'THE ELEVATOR IS OPEN · RUN':'THE COOLING SYSTEM IS NOT AVAILABLE';if(floorOne.chefZoneCooldowns[index]>0)return document.querySelector('#prompt').textContent=`COOLING STATION ${index+1} RECHARGING · ${floorOne.chefZoneCooldowns[index].toFixed(1)}s`;if(floorOne.chefAction!=='recovery'||floorOne.chefRecoveryZone!==index)return document.querySelector('#prompt').textContent='NO TARGET IN THIS COOLING ZONE · BAIT THE CHEF HERE';if(floorOne.chefCounteredSerial===floorOne.chefActionSerial)return document.querySelector('#prompt').textContent='THIS RECOVERY HAS ALREADY BEEN COUNTERED';
 floorOne.chefCounteredSerial=floorOne.chefActionSerial;floorOne.chefZoneCooldowns[index]=FLOOR_ONE_CHEF_CONFIG.stationCooldown;floorOneChefCoolingZones[index].burst=1.25;floorOne.chefHealth=Math.max(0,floorOne.chefHealth-FLOOR_ONE_CHEF_CONFIG.counterDamage);floorOne.chefCounterCount++;floorOne.gasValves.push(index);floorOne.chefRecoveryZone=-1;clearFloorOneChefArenaAttacks(false);floorOne.chefAction='stagger';floorOne.chefActionTimer=floorOne.chefHealth<=0?999:2.15;floorOne.chefActionStage=`cooling counter ${floorOne.chefCounterCount}`;pickupTone();playPurgeCrash();if(floorOne.chefHealth<=0){floorOne.chefStage='defeated';floorOne.chefExitUnlocked=true;floorOne.chefAction='defeated';floorOne.chefActionTimer=0;if(floorOneChefGateParts[0])floorOneChefGateParts[0].position.y=5.1;objective.textContent='THE CHEF IS STAGGERED · RUN TO THE SERVICE ELEVATOR';document.querySelector('#prompt').textContent='COOLING LOCK · ELEVATOR RELEASED · RUN'}else{const oldPhase=floorOne.chefCombatPhase;updateFloorOneChefPhase(true);if(oldPhase===floorOne.chefCombatPhase)document.querySelector('#prompt').textContent=`COOLING COUNTER · CHEF HEALTH ${floorOne.chefHealth}%`}saveFloorOne();updateFloorOneChefHud()
}

const handleFloorOneBeforeChefAbilities=handleFloorOne;
handleFloorOne=function(part,trigger){
 if(floorOne?.phase===10&&part.startsWith('valve:'))return tryFloorOneChefCoolingCounter(Number(part.slice(6)));
 if(floorOne?.phase===10&&part==='chef-exit'){if(!floorOne.chefExitUnlocked||floorOne.chefHealth>0)return document.querySelector('#prompt').textContent='ELEVATOR LOCKED · DEFEAT THE CHEF WITH COOLING COUNTERS';clearFloorOneChefArenaAttacks();floorOne.chefStage='elevator-finale';floorOne.chefFinaleTimer=3.4;saveFloorOne();return buildFloorOnePhase()}
 return handleFloorOneBeforeChefAbilities(part,trigger)
};

buildFloorOneChefElevator=function(){
 clearFloorOneChefArenaVisuals();resetHotelSideScene();floorOneShell('SERVICE ELEVATOR',8,12,4.2,0x343638,0x2b2523);document.body.classList.add('chef-elevator-finale');const frontWall=roomGroup.children.find(child=>child.name==='floor one wall'&&child.position.z>5);if(frontWall){frontWall.visible=false;solidColliders=solidColliders.filter(collider=>collider.mesh!==frontWall)}box('elevator threshold outside',[0,-.12,8],[8,.24,5],0x241b19,false);box('elevator back wall',[0,2,-5.72],[7.5,4,.3],0x4a4e50,true);for(const x of [-3.6,3.6])box('elevator side rail',[x,2,0],[.18,3.8,10],0xa78a4b,false);const left=box('closing elevator door',[-2.05,2,5.65],[3.9,4,.24],0x707678,false),right=box('closing elevator door',[2.05,2,5.65],[3.9,4,.24],0x707678,false);floorOneChefElevator={left,right};floorOneChef=makeFloorOneChef();floorOneChef.visible=floorOne.chefStage!=='survived';floorOneChef.position.set(0,0,8.8);floorOneChef.userData.body.rotation.z=-.18;floorOne.chefFinaleTimer=floorOne.chefStage==='survived'?0:floorOne.chefFinaleTimer>0?floorOne.chefFinaleTimer:3.4;camera.position.set(0,1.7,2);camera.lookAt(0,1.6,7);setFloorOneCopy('Elevator Escape','The cooling lock has stalled the Chef. The service lift closes without another hidden task.','Stay inside the lift until its doors seal.','THE CHEF · SURVIVED');updateFloorOneChefHud()
};
updateFloorOneChefFinale=function(dt){
 floorOne.chefFinaleTimer=Math.max(0,floorOne.chefFinaleTimer-dt);const progress=1-floorOne.chefFinaleTimer/3.4;if(floorOneChefElevator){floorOneChefElevator.left.position.x=THREE.MathUtils.lerp(-2.05,-.15,progress);floorOneChefElevator.right.position.x=THREE.MathUtils.lerp(2.05,.15,progress)}if(floorOneChef){floorOneChef.position.z=THREE.MathUtils.lerp(8.8,6.1,Math.min(1,progress*.72));floorOneChef.userData.body.rotation.z=-.18}if(floorOne.chefFinaleTimer<=0){clearFloorOneChefArenaAttacks();floorOne.chefStage='survived';floorOne.chefTransitionTimer=2.5;if(floorOneChef)floorOneChef.visible=false;playPurgeCrash();objective.textContent='THE CHEF · SURVIVED';document.querySelector('#prompt').textContent='DING · THE DOORS CLOSE · THE KITCHEN RECEDES';saveFloorOne()}updateFloorOneChefHud()
};

const failFloorOneBeforeChefAbilities=failFloorOne;
failFloorOne=function(reason){if(floorOne?.phase===10&&floorOne.chefTriggered&&!['survived','elevator-finale'].includes(floorOne.chefStage))floorOne.chefRetryPending=true;return failFloorOneBeforeChefAbilities(reason)};

finishHotelFloorOne=function(){if(!floorOne||floorOne.phase===10&&floorOne.chefStage!=='survived')return;clearFloorOneChefArenaAttacks();floorOne.phase=11;saveFloorOne();saved[8]=true;saveHotelProgress('floor-one-checkout');localStorage.setItem('cabin-3d-progress',JSON.stringify(saved));updateHud();document.querySelector('#floor-one-hud')?.classList.remove('active');document.querySelector('#noise-hud')?.classList.remove('active');setBossEncounterHud(false);document.body.classList.remove('floor-one-panic','floor-one-exhausted','floor-one-cough','noise-hunt','chef-lockdown','chef-freezer','chef-blackout','chef-final-service','chef-elevator-finale');floorOne=null;startFloorTwo(true)};
