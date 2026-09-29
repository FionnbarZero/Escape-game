import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const state=read('../game/01-state.js');
const ransack=read('../game/04-ransack.js');
const admin=read('../game/05-admin.js');
const purge=read('../game/09-eviction.js');
const noiseArc=read('../game/10-noise-arc.js');
const collector=read('../game/12-collector.js');
const clockmaker=read('../game/13-clockmaker.js');
const drowned=read('../game/14-drowned-guest.js');
const pursuer=read('../game/15-pursuer.js');
const floorOne=read('../game/16-floor-one.js');
const floorTwo=read('../game/17-floor-two.js');
const molly=read('../game/18-molly.js');
const hotel=read('../game/19-hotel-run.js');
const jailbreak=read('../game/21-jailbreak.js');
const cabin=read('../game/24-cabin-maze.js');
const runtime=read('../game/25-runtime.js');

const expected=[
 'bash','purge','noise','chef','collector','clockmaker','drowned-guest','pursuer','molly','stair-monster','cable-mass',
 'ballroom-guest','watcher','water-creature','gardener','window-creature','false-guest','spider','root',
 'luggage-warden','empty-porter','black-bellhop','reflection','hotel-manager','night-auditor'
];
const catalogBlock=state.slice(state.indexOf('const ADMIN_MONSTER_CATALOG='),state.indexOf('const ADMIN_MONSTER_BEHAVIOR_COPY='));
for(const id of expected)if(!catalogBlock.includes(`${id.includes('-')?`'${id}'`:id}:{`))throw new Error(`Monster missing from behavior catalog: ${id}`);
if((catalogBlock.match(/behavior:/g)||[]).length!==expected.length)throw new Error('Monster catalog does not contain exactly one behavior per roster entry');
for(const id of ['purge','cable-mass','reflection'])if(!new RegExp(`${id.includes('-')?`'${id}'`:id}:\\{[^}]*phaseWalls:true`).test(catalogBlock))throw new Error(`${id} must phase through walls`);
for(const id of expected.filter(id=>!['purge','cable-mass','reflection'].includes(id)))if(new RegExp(`${id.includes('-')?`'${id}'`:id}:\\{[^}]*phaseWalls:true`).test(catalogBlock))throw new Error(`${id} must respect solid walls`);

const checks=[
 ['Bash commits to a warned lane',admin,"BASH LOCKED ONE LANE · MOVE SIDEWAYS"],
 ['Bash ends when a wall blocks the rush',admin,'finishAdminMonsterRush(monster,true)'],
 ['Purge requires hiding for its campaign sweep',purge,"if(reached&&!hotelHideState)"],
 ['phasing monsters ignore cover for contact',admin,'coverBlocks=!monster.phaseWalls'],
 ['spawned Noise remembers an audible position',admin,'adminMonsterInvestigateSound'],
 ['Noise arc targets the last sound',noiseArc,'rememberHotelNoiseArcSound'],
 ['Chef visibly aims before throwing',floorOne,"chefKnifeMode='aim'"],
 ['Chef knives commit to a snapshot',floorOne,'chefKnifeTarget={x:camera.position.x,z:camera.position.z}'],
 ['Collector retrieves dropped possessions',collector,"collector.recovery.stage==='fetch'"],
 ['Clockmaker advances on discrete ticks',clockmaker,"tick!==clockmaker.lastBossTick"],
 ['Drowned Guest uses warned land bursts',drowned,"document.body.classList.toggle('drowned-rush',bursting)"],
 ['Pursuer predicts the player route',pursuer,'pursuerInterceptTarget'],
 ['Molly investigates recorded sounds',molly,"moveMollyToward(molly.lastSound"],
 ['Molly exposes numbered computer intent',molly,"SELECTED · ${molly.display}"],
 ['Staircase Monster alternates zigzags',runtime,'zigzagSign'],
 ['Staircase Monster climbs platform heights',runtime,'closestHotelStairPlatformIndex'],
 ['Cable Mass bends during its charge',admin,"monster.behavior==='cable-charge'"],
 ['tagged Ballroom Guests freeze visibly',floorTwo,'freezeFloorTwoBallroomGuest'],
 ['Watcher freezes under direct observation',floorTwo,'if(!watched&&distance>.1)'],
 ['Water Creature swims side to side',admin,"monster.behavior==='water-slither'"],
 ['Gardener moss suppresses footsteps',admin,'mossMuffles:true'],
 ['Window Creature punishes its occupied switch',floorTwo,'index===floorTwo.windowCreatureIndex'],
 ['False Guest reveals into a chase',floorTwo,'floorTwo.falseGuestChase=true'],
 ['spawned False Guest feints and circles',admin,"monster.behavior==='false-feint'"],
 ['Giant Spider requires five returned hits',runtime,'if(combat.hits>=5)'],
 ['Root Stalker respects the Heart chamber',cabin,'THE HEART PROTECTS YOU'],
 ['spawned Root Stalker slows while watched',admin,"monster.behavior==='root-stalk'"],
 ['Luggage Warden blocks the route ahead',admin,"monster.behavior==='luggage-block'"],
 ['Empty Porter performs periodic blinks',admin,"monster.behavior==='porter-blink'"],
 ['Black Bellhop has ring, charge, and recovery phases',admin,"monster.behavior==='bellhop-charge'"],
 ['Reflection reverses player movement',admin,"monster.behavior==='mirror-copy'"],
 ['Hotel Manager targets the viewed route',admin,"monster.behavior==='manager-cutoff'"],
 ['Night Auditor alternates scan and approach',admin,"monster.behavior==='audit-search'"],
 ['Ransack STOP is a movement rule',ransack,'RANSACK SAYS STOP'],
 ['Vent Crawler pressures a timed route',jailbreak,'vent-chaser'],
 ['Cellblock Guard uses patrol and searchlight',jailbreak,'jailbreakGuardLap'],
 ['Staircase campaign starts the climbing pursuit',hotel,"userData.platformIndex=-1"]
];
for(const [label,source,needle] of checks)if(!source.includes(needle))throw new Error(`${label}: missing ${needle}`);

console.log(JSON.stringify({roster:expected.length,wallPhasers:['purge','cable-mass','reflection'],campaignContracts:checks.length,status:'all monster behavior contracts present'},null,2));
