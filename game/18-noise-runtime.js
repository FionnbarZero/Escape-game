function failNoise(reason='THE NOISE FOUND YOUR SIGNAL'){if(adminPreventDeath(reason))return;if(!noise||noise.phase==='failed')return;noise.phase='failed';noise.searching=false;hotelRunItems.delete(noise.def.item);hotelRunItems.delete('noise-door-open');saveHotelRun();stopNoiseAudio();document.body.classList.remove('noise-hunt');document.body.classList.add('noise-hit');document.querySelector('#noise-hud')?.classList.remove('active');document.querySelector('#noise-drawer')?.classList.remove('active');const overlay=document.querySelector('#noise-jumpscare');overlay.classList.add('active');overlay.setAttribute('aria-hidden','false');document.querySelector('#noise-death-reason').textContent=reason;controls.unlock();playNoiseBurst();noise.resetHandle=setTimeout(()=>{if(room===8&&hotelSideScene==='hotel-run')buildHotelRunRoom()},2200)}
function updateNoise(dt,time){if(!noise||noise.phase==='failed'||dlg.open)return;redrawNoiseStatic(time);noise.hazardCooldown=Math.max(0,noise.hazardCooldown-dt);if(noiseAudio){const volume=noise.phase==='hunt'?.46:.02+noise.meter*.0022;noiseAudio.gain.gain.setTargetAtTime(volume,noiseAudio.context.currentTime,.06);noiseAudio.filter.frequency.setTargetAtTime(noise.phase==='hunt'?3200:900+noise.meter*18,noiseAudio.context.currentTime,.08)}for(const [index,tv] of noiseTVs.entries())tv.screen.material.emissiveIntensity=(noise.phase==='hunt'?7:2.2)+Math.random()*(noise.phase==='hunt'?8:2)+Math.sin(time*22+index)*1.4;if(noiseEntity?.visible){noiseEntity.userData.limbs.forEach((limb,index)=>limb.rotation.z+=Math.sin(time*17+index)*dt*.9);noiseEntity.rotation.z=Math.sin(time*25)*.08}
 const crouched=keys.KeyC||keys.ControlLeft||keys.ControlRight,moving=keys.KeyW||keys.ArrowUp||keys.KeyS||keys.ArrowDown||keys.KeyA||keys.ArrowLeft||keys.KeyD||keys.ArrowRight,sprinting=(keys.ShiftLeft||keys.ShiftRight)&&moving&&!crouched;
 if(noise.phase==='quiet'){if(sprinting)addNoise(dt*34);else if(moving&&!crouched)addNoise(dt*3.5);else if(crouched)addNoise(-dt*(moving?4:8));for(const hazard of noiseHazards){const distance=Math.hypot(camera.position.x-hazard.position.x,camera.position.z-hazard.position.z);if(distance<hazard.radius){if(hazard.type==='porcelain'&&!hazard.used){hazard.used=true;addNoise(crouched?8:32);if(!crouched)playNoiseBurst()}else if(hazard.type==='board'&&moving)addNoise(dt*(crouched?1.2:sprinting?32:15))}}if(noise.searching){if(keys.KeyE){noise.drawerProgress=THREE.MathUtils.clamp(noise.drawerProgress+dt/3.1,0,1);noise.drawerMesh.position.z=noise.spot.z+.68+noise.drawerProgress*.72;document.querySelector('#noise-drawer-progress').style.transform=`scaleX(${noise.drawerProgress})`;if(!crouched)addNoise(dt*2.2);if(noise.drawerProgress>=1)completeNoiseDrawer()}else releaseNoiseDrawer()}if(noise.manifestTimer>0){noise.manifestTimer-=dt;noiseEntity.position.y=1.8+Math.sin(time*30)*.08;if(noise.manifestTimer<=0)noiseEntity.visible=false}noiseHud(noise.searching?'Hold E steadily. Releasing early will make the drawer creak.':noise.drawerOpened?'Reach the exit quietly. Do not run.':'Crouch-walk and hold E at the marked drawer.');return}
 if(noise.phase==='hunt'){noise.huntTimer-=dt;if(sprinting)return failNoise('YOU RAN WHILE THE SIGNAL WAS HUNTING');if(!hotelHideState&&(moving&&!crouched||noise.huntTimer%1.4<dt))noise.target.set(camera.position.x,1.7,camera.position.z);const direction=noise.target.clone().sub(noiseEntity.position);direction.y=0;if(direction.length()>.08)noiseEntity.position.add(direction.normalize().multiplyScalar(dt*5.4));noiseEntity.position.y=THREE.MathUtils.lerp(noiseEntity.position.y,1.8,dt*4);if(!hotelHideState&&Math.hypot(noiseEntity.position.x-camera.position.x,noiseEntity.position.z-camera.position.z)<1.05)return failNoise('THE SIGNAL FLATLINED AT YOUR LOCATION');noiseHud(hotelHideState?'The cabinet muffles your signal. Stay inside until the hunt ends.':'Seven seconds. Stay crouched and move away from the last sound it heard.');document.querySelector('#prompt').textContent=hotelHideState?`HIDDEN IN ${hotelHideState.kind.toUpperCase()} · THE SIGNAL CANNOT HEAR YOU`:`THE NOISE IS HUNTING · ${Math.max(0,noise.huntTimer).toFixed(1)} · DO NOT SPRINT`;if(noise.huntTimer<=0)endNoiseHunt()}}
const hotelRunFloors=[
 {name:'THE GUEST WING',wall:0x59463c,floor:0x641823,light:0xd9b76e,rooms:[
  {number:101,search:'the writing desk',item:'key-102',itemName:'ROOM 102 KEY',copy:'A brass key is taped beneath the desk drawer.'},
  {number:102,search:'the housekeeping cart',item:'maintenance-wire',itemName:'MAINTENANCE WIRE',copy:'A coil of wire is hidden under a folded towel.'},
  {number:103,search:'the crooked painting',item:'key-104',itemName:'ROOM 104 KEY',copy:'The painting opens like a safe. A room key waits behind the canvas.'},
  {number:104,search:'the service cupboard',item:'floor-2-key',itemName:'FLOOR 2 ELEVATOR KEY',copy:'A heavy key marked 2 is buried beneath the emergency blankets.'}
 ]},
 {name:'THE BLACK FLOOR',wall:0x3d4543,floor:0x263a32,light:0xa7d4b5,rooms:[
  {number:201,search:'the luggage bench',item:'key-202',itemName:'ROOM 202 KEY',copy:'The lining has been cut open. A cold key slides into your palm.'},
  {number:202,search:'the breaker cabinet',item:'fuse',itemName:'BRASS FUSE',copy:'The cabinet still hums. One brass fuse is warm enough to burn.'},
  {number:203,search:'the listening desk drawer',item:'key-204',itemName:'ROOM 204 KEY',copy:'The drawer opens without a creak. A key rests beneath a nest of severed antenna wire.'},
  {number:204,search:'the locked elevator panel',item:'floor-3-key',itemName:'FLOOR 3 ELEVATOR KEY',copy:'The fuse wakes the panel. The elevator key drops from a hidden slot.'}
 ]},
 {name:'THE MANAGERIAL FLOOR',wall:0x4b3a35,floor:0x451b20,light:0xf0a08a,rooms:[
  {number:301,search:'the guestbook',item:'key-302',itemName:'ROOM 302 KEY',copy:'Every guest crossed out their name except yours. A key is tucked in the spine.'},
  {number:302,search:'the coat closet',item:'brass-token',itemName:'BRASS SERVICE TOKEN',copy:'A bellhop uniform hangs empty. Its pocket contains a stamped token.'},
  {number:303,search:'the manager portrait',item:'key-304',itemName:'ROOM 304 KEY',copy:'The painted manager blinks. A key is pinned behind the frame.'},
  {number:304,search:'the manager’s safe',item:'master-key',itemName:'MASTER HOTEL KEY',copy:'The safe opens onto a key engraved with every room you survived.'}
 ]}
];
const hotelBossCatalog=[
 [
  {key:'warden-boss',name:'THE LUGGAGE WARDEN',copy:'The service cart unfolds into a tall thing wearing a bellhop cap. Read its movements and survive three choices.'},
  {key:'porter-boss',name:'THE EMPTY PORTER',copy:'A porter with no face blocks the elevator. It raises one gloved hand and waits for you to make the wrong choice.'}
 ],
 [
  {key:'bellhop-boss',name:'THE BLACK BELLHOP',copy:'The bellhop steps out of the breaker room carrying a bell that rings without being touched.'},
  {key:'mirror-boss',name:'THE REFLECTION',copy:'Your reflection steps out of the bathroom mirror and takes the key you just found.'}
 ],
 [
  {key:'manager-boss',name:'THE HOTEL MANAGER',copy:'The manager closes the safe and offers you one last rule: answer quickly, or stay here forever.'},
  {key:'night-auditor-boss',name:'THE NIGHT AUDITOR',copy:'The ledger turns its own pages. Something in a dinner jacket waits for your signature.'}
 ]
];
const storedHotelBosses=JSON.parse(sessionStorage.getItem('infinite-hotel-bosses')||'null')||{floor1:Math.floor(Math.random()*2),floor2:Math.floor(Math.random()*2),floor3:Math.floor(Math.random()*2)};sessionStorage.setItem('infinite-hotel-bosses',JSON.stringify(storedHotelBosses));let hotelBossSequence=[],hotelBossStep=0;
