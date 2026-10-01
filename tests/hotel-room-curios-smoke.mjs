import { readGameSource } from './source-bundle.mjs';

const source=readGameSource();
const curioIds=[...source.matchAll(/id:'(curio-\d{3})',label:/g)].map(match=>match[1]);
const roomNames=[...source.matchAll(/number:(\d{3}),roomName:'([^']+)',feature:'([^']+)'/g)].map(match=>({number:Number(match[1]),name:match[2],feature:match[3]}));
if(curioIds.length!==12||new Set(curioIds).size!==12)throw new Error(`Expected 12 unique numbered-room keepsakes, found ${curioIds.length}`);
if(roomNames.length!==12||new Set(roomNames.map(room=>room.name)).size!==12||new Set(roomNames.map(room=>room.feature)).size!==12)throw new Error('Every numbered room needs a distinct name and visual feature');
for(const id of curioIds)if(!source.includes(`'${id}':{label:`))throw new Error(`Keepsake is missing from inventory: ${id}`);
for(const contract of ["interactive([-6.5,1.3,-6.4],[1.8,2.4,1.8],8,'hotel-run-curio'","journalDiscoverCurio(def.special.id)","OPTIONAL KEEPSAKE","buildHotelRunRoomIdentity(def);buildHotelRunSpecialItem(def)"])if(!source.includes(contract))throw new Error(`Missing room-keepsake contract: ${contract}`);
if(source.includes('function buildSubFloor')||source.includes("hotelSideScene='sub-floor'"))throw new Error('Sub-floors were made playable before their design was requested');
console.log(JSON.stringify({rooms:roomNames,keepsakes:curioIds.length,journalArchive:'persistent',subFloors:'Infinite Cinema implemented separately'},null,2));
