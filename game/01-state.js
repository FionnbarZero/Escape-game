let room=0,inLobby=false,activeStory='forest',roomGroup,interactables=[],dolls=[],keys={},velocity=new THREE.Vector3(),previous=performance.now(),dustCloud=null,flickerLights=[],horrorProps=[],horrorMist=null,solidColliders=[],playroomPlatforms=[],mazeEscapePlatforms=[],hotelStairPlatforms=[],mazeEscape=false,mazeChaosHandle=null,hotelPieces=[],hotelPeople=[],hotelDialogueIndex=new Map(),hotelStairwell=false,hotelSideScene='',hotelRoom16Tasks=new Set(),hotelStairMonster=null,hotelShiftTimer=4,verticalVelocity=0,playerFeetY=0,playerGrounded=true,slideTimer=0,slideCooldown=0,doorways=[],doorTransitionCooldown=0,doorArrival=null,hotelRoomPassage=null;
const saved=JSON.parse(localStorage.getItem('cabin-3d-progress')||'[]');while(saved.length<9)saved.push(false);let stability=100,handlePieces=new Set(JSON.parse(localStorage.getItem('cabin-handle-pieces')||'[]')),bonusSolved=new Set(JSON.parse(localStorage.getItem('cabin-bonus-puzzles')||'[]')),cabinSecrets=new Set(JSON.parse(localStorage.getItem('cabin-secret-chain')||'[]')),hotelProgress=new Set(JSON.parse(localStorage.getItem('infinite-hotel-progress')||'[]')),hotelStage=Number(localStorage.getItem('infinite-hotel-stage')||0),hotelReality=Number(localStorage.getItem('infinite-hotel-reality')||0)%5,hotelDoorAnimating=false,pendingHotelDoor=null,hotelArrival=null,hotelElevatorInput=[],hotelKeyCourier=null,hotelRunFloor=Number(sessionStorage.getItem('infinite-hotel-run-floor')||0),hotelRunRoom=Number(sessionStorage.getItem('infinite-hotel-run-room')||0),hotelRunItems=new Set(JSON.parse(sessionStorage.getItem('infinite-hotel-run-items')||'[]')),batOwned=localStorage.getItem('cabin-baseball-bat')==='true',combat=null,creatureModel=null,thrownBall=null,batModel=null,rootChaser=null,chaseState=null;
let inJailbreak=false,jailbreakStage=Number(localStorage.getItem('jailbreak-stage')||0),jailbreakItems=new Set(JSON.parse(localStorage.getItem('jailbreak-items')||'[]')),jailbreakGuard=null,jailbreakGuardCooldown=0,jailbreakGuardLap=0,jailbreakChaser=null,jailbreakChaseCooldown=0,jailbreakFloorHoles=[],jailbreakHoleCooldown=0;
let funPickups=new Set(JSON.parse(localStorage.getItem('courage-shards')||'[]')),funAudio=null;
let eviction=null,evictionEntity=null,evictionShadowZones=[],evictionMirror=null,evictionMimic=null,evictionAudio=null,hotelHideState=null,hotelHideSpots=[],purgeSparks=[];
let noise=null,noiseEntity=null,noiseAudio=null,noiseHazards=[],noiseTVs=[];
let hotelNoiseArc=null,hotelNoiseArcEntity=null,hotelNoiseArcRoom=Number(sessionStorage.getItem('infinite-hotel-noise-arc-room')||0);
let hotelArrivalItems=new Set(JSON.parse(localStorage.getItem('infinite-hotel-arrival-items')||'[]')),hotelArrivalBellhop=null,hotelArrivalSuitcasePending=false;
let floorFive=null,floorFiveHazards=[],floorFivePortraits=[],floorFiveWater=null,floorFiveBoss=null;
let floorOne=null,floorOneHazards=[],floorOneEntity=null,floorOneChef=null,floorOneChefKnives=[],floorOneChefCover=[],floorOneChefSteam=[],floorOneChefGateParts=[],floorOneChefPanRack=null,floorOneChefBreakers=[],floorOneChefFans=[],floorOneChefCarts=[],floorOneChefStation=[],floorOneChefElevator=null;
let floorTwo=null,floorTwoHazards=[],floorTwoPortraits=[],floorTwoCrane=null,floorTwoGuests=[],floorTwoRain=null,floorTwoWatcher=null,floorTwoGardener=null,floorTwoMoss=[],floorTwoWindows=[],floorTwoWindowCreature=null,floorTwoFalseGuests=[],floorTwoFalseCreature=null;
let collector=null,collectorEntity=null,collectorItems=new Map(),collectorDecoys=[],collectorBells=[],collectorCarts=[],collectorWatchHit=null;
let clockmaker=null,clockmakerEntity=null,clockmakerPendulums=[],clockmakerGears=[],clockmakerPlatforms=[],clockmakerClocks=[],clockmakerAlcoves=[],clockmakerDebris=[],clockmakerMasterHands=null,clockmakerLavaFloor=null;
let drowned=null,drownedEntity=null,drownedWater=null,drownedWake=null,drownedPlatforms=[],drownedBarriers=[];
let pursuer=null,pursuerEntity=null,pursuerHazards=[],pursuerGates=[],pursuerExitPassageTrigger=null,pursuerCompletedScenes=new Set((()=>{try{return JSON.parse(localStorage.getItem('infinite-hotel-pursuer-scenes-v2')||'[]')}catch{return[]}})());
let molly=null,mollyEntity=null,mollyComputers=[],mollyIntercoms=[],mollyDoors=[],mollyLevers=[],mollyCameraReturn=null;
let ransack={phase:'waiting',cooldown:14,timer:0,deadline:0,stillStarted:0,stillTime:0,resolveTimer:0,collected:0,total:3,eventRoomGroup:null,lastPosition:new THREE.Vector3(),appearances:Number(sessionStorage.getItem('hotel-ransack-appearances')||0)},ransackEntity=null,ransackCollectibles=[];
let adminInvincible=false,adminMonsters=[],bashSpawnHandle=null,randomRoomMonsterHandle=null,adminHitCooldown=0,adminGrantedItems=new Set(JSON.parse(localStorage.getItem('escape-admin-items')||'[]'));
const ADMIN_MONSTER_CATALOG={
 bash:{name:'Bash',behavior:'bash-rush',speed:20,distance:11,warning:2.4,rush:true,hover:.15,radius:1.05},
 purge:{name:'The Purge',behavior:'purge-sweep',speed:15,distance:9,warning:.9,rush:true,hover:1.7,phaseWalls:true,radius:1.2},
 noise:{name:'The Noise',behavior:'sound-hunt',speed:2.7,hover:.4},
 chef:{name:'The Chef',behavior:'knife-flank',speed:3,radius:.72},
 collector:{name:'The Collector',behavior:'possessions-guard',speed:3.15,radius:.75},
 clockmaker:{name:'The Clockmaker',behavior:'clockwork-step',speed:3.25,radius:.68},
 'drowned-guest':{name:'The Drowned Guest',behavior:'water-heavy',speed:2.85,radius:.78},
 pursuer:{name:'The Pursuer',behavior:'relentless-cutoff',speed:4.45,radius:.68},
 molly:{name:'Molly',behavior:'molly-listen',speed:2.9,radius:.64},
 spider:{name:'Giant Spider',behavior:'spider-pounce',speed:3.4,radius:1},
 root:{name:'Root Stalker',behavior:'root-stalk',speed:2.7,hover:.5,radius:.72},
 'stair-monster':{name:'Staircase Monster',behavior:'stair-zigzag',speed:2.8,radius:.7,stepHeight:.9},
 'cable-mass':{name:'Cable Mass',behavior:'cable-charge',speed:13,distance:10,warning:1.2,rush:true,hover:2.25,phaseWalls:true,radius:1.05},
 'ballroom-guest':{name:'Ballroom Guest',behavior:'tag-circle',speed:3.1},
 watcher:{name:'The Watcher',behavior:'gaze-freeze',speed:3,radius:.62},
 'water-creature':{name:'Water Creature',behavior:'water-slither',speed:3.15,hover:.3,radius:.62},
 gardener:{name:'The Gardener',behavior:'garden-patrol',speed:2.75,radius:.68},
 'window-creature':{name:'Window Creature',behavior:'window-ambush',speed:3.25,radius:.62},
 'false-guest':{name:'False Guest',behavior:'false-feint',speed:3.4,radius:.62},
 'luggage-warden':{name:'The Luggage Warden',behavior:'luggage-block',speed:2.9,radius:.9},
 'empty-porter':{name:'The Empty Porter',behavior:'porter-blink',speed:3,radius:.6},
 'black-bellhop':{name:'The Black Bellhop',behavior:'bellhop-charge',speed:3.2,radius:.62},
 reflection:{name:'The Reflection',behavior:'mirror-copy',speed:3.35,radius:.6,phaseWalls:true},
 'hotel-manager':{name:'The Hotel Manager',behavior:'manager-cutoff',speed:2.8,radius:.64},
 'night-auditor':{name:'The Night Auditor',behavior:'audit-search',speed:3,radius:.62}
};
const ADMIN_MONSTER_BEHAVIOR_COPY={
 'bash-rush':'locks onto one lane, warns, then charges once',
 'purge-sweep':'phases through walls in a wide spinning sweep',
 'sound-hunt':'moves only when it hears careless movement',
 'knife-flank':'switches sides and attacks from a close flank',
 'possessions-guard':'circles nearby prey but guards its starting ground',
 'clockwork-step':'lunges only on sharp mechanical beats',
 'water-heavy':'shambles slowly, then surges in waterlogged bursts',
 'relentless-cutoff':'aims ahead of the player instead of following footprints',
 'molly-listen':'investigates the last sound and visibly travels to numbered computers',
 'spider-pounce':'compresses, pounces, and pauses to recover',
 'root-stalk':'nearly stops when watched and drifts when unseen',
 'stair-zigzag':'takes wide alternating steps and climbs larger ledges',
 'cable-charge':'phases through walls in a whipping serpentine charge',
 'tag-circle':'orbits closely before cutting into tagging range',
 'gaze-freeze':'becomes completely motionless under direct sight',
 'water-slither':'swims in a continuous side-to-side wave',
 'garden-patrol':'patrols moving points ahead of the player',
 'window-ambush':'waits motionless before a sudden window-length burst',
 'false-feint':'approaches, retreats, then circles from the false side',
 'luggage-block':'tries to occupy the route directly in front of the player',
 'porter-blink':'walks slowly and periodically blinks across open floor',
 'bellhop-charge':'rings in place, charges, then slows to recover',
 'mirror-copy':'answers player movement with a reversed reflection step',
 'manager-cutoff':'walks toward where the player is looking, not where they stand',
 'audit-search':'alternates between scanning arcs and direct inspection'
};
const hotelArrivalPlayerName=(new URLSearchParams(location.search).get('name')||localStorage.getItem('hotel-player-name')||'GUEST').replace(/[^a-z0-9 _-]/gi,'').slice(0,20).toUpperCase()||'GUEST';
const purgeQuietCursor={x:.5,y:.5};
const inventoryCatalog={
 'room-assignment':{label:'Room 304 Assignment',glyph:'304',kind:'Clue'},'room304-key':{label:'Room 304 Key',glyph:'K',kind:'Key'},flashlight:{label:'Flashlight',glyph:'FL',kind:'Tool'},brochure:{label:'Hotel Brochure',glyph:'BR',kind:'Guide'},matches:{label:'Matches',glyph:'M',kind:'Light'},gold:{label:'Gold Tokens',glyph:'G',kind:'Currency'},'elevator-key':{label:'Elevator Key',glyph:'K',kind:'Key'},vitamins:{label:'Vitamins',glyph:'V',kind:'Consumable'},medkit:{label:'First-Aid Kit',glyph:'+',kind:'Consumable'},bandage:{label:'Bandage',glyph:'BD',kind:'Consumable'},'energy-drink':{label:'Energy Drink',glyph:'EN',kind:'Consumable'},glowstick:{label:'Glow Stick',glyph:'GS',kind:'Light'},'wind-up-decoy':{label:'Wind-Up Decoy',glyph:'WD',kind:'Tool'},'flashlight-battery':{label:'Flashlight Battery',glyph:'B',kind:'Consumable'},lockpick:{label:'Lockpick',glyph:'LP',kind:'Tool'},'sheet-music':{label:'Blood-Ink Sheet Music',glyph:'♫',kind:'Clue'},'grounding-wire':{label:'Copper Grounding Wire',glyph:'W',kind:'Puzzle'},'cleaning-rag':{label:'Cleaning Rag',glyph:'RAG',kind:'Tool'},'electrical-hammer':{label:'Insulated Hammer',glyph:'H',kind:'Tool'},'drone-controller':{label:'Maintenance Drone',glyph:'DR',kind:'Tool'},
 'door-handle':{label:'Door Handle Pieces',glyph:'DH',kind:'Quest'},'baseball-bat':{label:'Baseball Bat',glyph:'BAT',kind:'Weapon'},compass:{label:'Compass',glyph:'C',kind:'Tool'},'ash-key':{label:'Ash Key',glyph:'K',kind:'Key'},batteries:{label:'Batteries',glyph:'B',kind:'Supply'},lantern:{label:'Lantern',glyph:'L',kind:'Light'},
 sheet:{label:'Torn Sheet',glyph:'SH',kind:'Tool'},spoon:{label:'Metal Spoon',glyph:'SP',kind:'Tool'},rope:{label:'Improvised Rope',glyph:'R',kind:'Tool'},cutters:{label:'Bolt Cutters',glyph:'BC',kind:'Tool'},baton:{label:'Stun Baton',glyph:'ST',kind:'Weapon'},'hall-key':{label:'North Gate Key',glyph:'K',kind:'Key'},code:{label:'Door Code 2174',glyph:'#',kind:'Clue'},'baton-code':{label:'Tool Code 4317',glyph:'#',kind:'Clue'},
 'key-102':{label:'Room 102 Key',glyph:'K',kind:'Key'},'maintenance-wire':{label:'Maintenance Wire',glyph:'W',kind:'Tool'},'key-104':{label:'Room 104 Key',glyph:'K',kind:'Key'},'floor-2-key':{label:'Floor 2 Key',glyph:'K',kind:'Key'},'key-202':{label:'Room 202 Key',glyph:'K',kind:'Key'},fuse:{label:'Brass Fuse',glyph:'F',kind:'Tool'},'key-204':{label:'Room 204 Key',glyph:'K',kind:'Key'},'floor-3-key':{label:'Floor 3 Key',glyph:'K',kind:'Key'},'key-302':{label:'Room 302 Key',glyph:'K',kind:'Key'},'brass-token':{label:'Service Token',glyph:'T',kind:'Token'},'key-304':{label:'Room 304 Key',glyph:'K',kind:'Key'},'master-key':{label:'Master Hotel Key',glyph:'MK',kind:'Key'},'noise-arc-radio':{label:'Radio Clock',glyph:'RC',kind:'Puzzle'},'noise-arc-keycard':{label:'Magnetic Keycard',glyph:'KC',kind:'Key'},'battery-pack':{label:'Battery Pack',glyph:'B',kind:'Supply'},'master-lockpick':{label:'Master Lockpick',glyph:'LP',kind:'Tool'}
};
let inventorySignature='',selectedInventoryId=null;
let firstPersonView=null,firstPersonHeldItem=null,firstPersonHeldId='',firstPersonAction=null,worldInteractionAnimations=[],hotelHideTransition=null;
let usableInventory=(()=>{try{return{spentGold:0,matchesBought:0,matchesUsed:0,vitamins:0,medkits:0,bandages:0,energyDrinks:0,glowsticks:0,decoys:0,batteries:0,lockpicks:0,flashlightOn:true,flashlightCharge:100,...JSON.parse(localStorage.getItem('escape-usable-inventory')||'{}')}}catch{return{spentGold:0,matchesBought:0,matchesUsed:0,vitamins:0,medkits:0,bandages:0,energyDrinks:0,glowsticks:0,decoys:0,batteries:0,lockpicks:0,flashlightOn:true,flashlightCharge:100}}})();
const inventoryEffects={matchTimer:0,glowTimer:0,batteryTimer:0,vitaminsTimer:0,energyTimer:0};let baseFlashlight=0,flashlightUiTimer=0,flashlightLowWarned=false;
