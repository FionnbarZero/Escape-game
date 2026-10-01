import { readGameSource } from './source-bundle.mjs';
import fs from 'node:fs';

const source=readGameSource();
const manifest=fs.readFileSync(new URL('../game/manifest.js',import.meta.url),'utf8');
if(!manifest.includes("'19-infinite-cinema.js'"))throw new Error('Infinite Cinema script is not in the game manifest');
const required=[
 "SUB-FLOOR ONE · THE INFINITE CINEMA",
 "const INFINITE_CINEMA_FILMS=[",
 "theme:'railway'",
 "theme:'ocean'",
 "theme:'crown'",
 "theme:'hotel'",
 "type:'infinite-cinema',part:'exit'",
 "type:'infinite-cinema',part:'sunroom-exit'",
 "function buildBadgeSunroom()",
 "beginHotelRoomPassage(trigger,buildBadgeSunroom)",
 "handleInfiniteCinema(data.part,hit.object)",
 "beginHotelRoomPassage(trigger,()=>",
 "journalDiscoverPlace('infinite-cinema')",
 "saveHotelProgress('subfloor-one-infinite-cinema')"
];
for(const contract of required)if(!source.includes(contract))throw new Error(`Missing Infinite Cinema contract: ${contract}`);
if(!source.includes("if(!infiniteCinema.foundNext.includes(infiniteCinema.room))return message('THE CINEMA DOOR WILL NOT OPEN'"))throw new Error('Cinema exit can open before the next film is found');
if(!source.includes("localStorage.setItem(INFINITE_CINEMA_KEY"))throw new Error('Cinema progress is not persistent');
console.log(JSON.stringify({unlock:'all five badges',gateway:'Night Lobby Door III → Sunroom',subfloor:1,rooms:4,loop:['insert film','room transforms','find next reel','walk to next room'],themes:['railway','ocean','coronation','hotel'],transition:'seamless connected passage',journal:'persistent place record'},null,2));
