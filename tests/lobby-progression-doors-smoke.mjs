import fs from 'node:fs';

const lobby=fs.readFileSync(new URL('../game/23-lobby.js',import.meta.url),'utf8');
const world=fs.readFileSync(new URL('../game/22-story-world.js',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../game/24-cabin-maze.js',import.meta.url),'utf8');
const purge=fs.readFileSync(new URL('../game/09-eviction.js',import.meta.url),'utf8');

const required=[
 ['three progression door definitions',/id:'journals'[\s\S]*id:'campaign'[\s\S]*id:'badges'/],
 ['all discovered journal records',/journalLevel\(entry\.id\)>0/],
 ['journal exact completion gate',/done===total/],
 ['current and legacy campaign completion',/floor-two-room140'[\s\S]*hotelProgress\.has\('escaped'/],
 ['shared badge definitions',/function lobbyBadgeDefinitions\(\)/],
 ['persistent numbered-run badge',/hotelProgress\.has\('doors-style-run-escaped'\)/],
 ['locked progress feedback',/Progress: \$\{state\.detail\}/],
 ['unlocked door open state',/lobbyOpenedProgressDoors\.add\(id\)/],
 ['destination intentionally pending',/room beyond this doorway will be connected after its contents are defined/]
];
for(const [name,pattern] of required)if(!pattern.test(lobby))throw new Error(`Missing lobby door contract: ${name}`);
if(!input.includes("data.type==='lobby-progression-door'"))throw new Error('Lobby progression doors are not routed through normal interaction input');
if((world.match(/lobby progression door campaign/g)||[]).length<2)throw new Error('Delayed lobby construction does not recognize the renamed center progression door');
if(!purge.includes("saveHotelProgress('purge-survived')"))throw new Error('Purge badge is not persisted for later lobby sessions');
const badgeIds=[...lobby.matchAll(/id:'(first-check-in|scrap-metal|outclimb|last-service|severed-facade|no-vacancy)'/g)].map(match=>match[1]);
if(new Set(badgeIds).size!==6)throw new Error(`Expected six unique badge requirements, found ${JSON.stringify(badgeIds)}`);

console.log(JSON.stringify({doors:['journals','campaign','badges'],journalRule:'all 32 records discovered',campaignRule:'current Room 140 endpoint or legacy completed ending',badges:badgeIds.length,destinations:'pending user room definitions'},null,2));
