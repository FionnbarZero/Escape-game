import { readGameSource } from './source-bundle.mjs';

const source=readGameSource();
const required=[
 "chance:.72,cooldownRooms:1",
 "allowed:['bash','cable-mass','empty-porter','black-bellhop','reflection','luggage-warden','hotel-manager','night-auditor']",
 "departedRoom!==3||![1,3].includes(departedFloor)",
 "startPursuerEncounter(scene,'hotel-run',true)",
 "makeAdminMonsterModel(hotelBossMonsterKind(boss))",
 "scheduleHotelRunMonster(def,bossGate,isNoiseRoom)"
];
for(const contract of required)if(!source.includes(contract))throw new Error(`Missing numbered-run encounter contract: ${contract}`);
if(!source.includes("if(bossGate||isNoiseRoom)return"))throw new Error('Random monsters can overlap a protected boss or Noise room');
if(!source.includes("pursuerRooms:[]"))throw new Error('Pursuer milestones are not persisted for the current run');
if(source.includes("if(noise&&noise.doorOpened)return beginHotelRoomPassage(trigger,buildHotelFloorOneArrival)"))throw new Error('Room 203 still diverts out of the numbered run before its later bosses');
if(!source.includes("ELEVATOR · ROOM 204 · OPEN"))throw new Error('The Noise elevator does not continue to Room 204');
console.log(JSON.stringify({randomMonsters:'warned and room-bound',randomChance:.72,cooldownRooms:1,pursuerMilestones:['Floor 1 Room 103','Floor 3 Room 303'],bossModels:'variant-specific',protectedRooms:['boss','Noise']},null,2));
