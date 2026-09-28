import fs from 'node:fs';

import { readGameSource } from './source-bundle.mjs';
const source=readGameSource();
const definition=source.match(/function randomRoomMonsterPlan[\s\S]*?\n\}/)?.[0];
if(!definition)throw new Error('Random-room monster planner was not found');
if(!source.includes('run.randomMonsterCooldown=2'))throw new Error('Random-room monster cooldown is missing');
if(!source.includes("allowed:['purge','cable-mass']"))throw new Error('Dangerous-room spawn restriction is missing');
const closetCalls=source.match(/addGeneratedRoomCloset\(spec,/g)?.length||0;
if(closetCalls!==4)throw new Error(`Expected generated closets on three hotel floors, received ${Math.max(0,closetCalls-1)}`);
if((source.match(/!hotelHideState&&/g)?.length||0)<2)throw new Error('Closets do not protect hidden players from monster contact');

const buildPlanner=new Function('HOTEL_VISIT_SEED',`${definition};return randomRoomMonsterPlan`);
const roster=['bash','purge','cable-mass','empty-porter','black-bellhop','reflection','night-auditor'];
const counts=Object.fromEntries([...roster.map(kind=>[kind,0]),['none',0]]);
for(let visitSeed=1;visitSeed<=80;visitSeed++){
 const plan=buildPlanner(visitSeed);
 for(let room=0;room<50;room++){
  const key=`floor2:${visitSeed}:arrival:room-${room}`,first=plan(key),second=plan(key);
  if(JSON.stringify(first)!==JSON.stringify(second))throw new Error('Encounter planning is not stable within a visit');
  if(!first){counts.none++;continue}
  if(!(first.kind in counts))throw new Error('Unknown random-room monster: '+first.kind);
  if(first.delay<2200||first.delay>=5000)throw new Error('Encounter delay is outside the safe window');
  counts[first.kind]++;
  const restricted=plan(key,{chance:1,allowed:['purge','cable-mass']});
  if(restricted.kind==='bash')throw new Error('Bash was selected for a restricted hazard room');
 }
}
const total=Object.values(counts).reduce((sum,value)=>sum+value,0),encounters=total-counts.none,rate=encounters/total;
if(Object.entries(counts).some(([kind,count])=>kind!=='none'&&count<50))throw new Error('Encounter selection is not distributing the full temporary monster roster: '+JSON.stringify(counts));
if(rate<.19||rate>.25)throw new Error('Encounter rate drifted away from the configured 22% target: '+rate);
if(!source.includes('lifetime:options.natural?')||!source.includes('finishTransientMonster(monster)'))throw new Error('Temporary room monsters do not disappear after their moment');
if(!source.includes("activeHotelEncounter()||(adminMonsters.length?adminMonsters[0].name.toUpperCase():''"))throw new Error('Monster spawns are not mutually exclusive');
if(!source.includes('||adminMonsters.length||hotelRoomPassage||'))throw new Error('Ransack can interrupt another monster or a room transition');

console.log(JSON.stringify({counts,rate:Number(rate.toFixed(3)),delay:'2.2–5.0 seconds',cooldownRooms:2,lifetime:'8–13 seconds',overlap:'blocked',generatedClosetFloors:closetCalls-1},null,2));
