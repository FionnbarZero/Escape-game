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
 ['used Room 304 key keeps First Check-In',/room304-key-used/],
 ['persistent numbered-run badge',/hotelProgress\.has\('doors-style-run-escaped'\)/],
 ['locked progress feedback',/Progress: \$\{state\.detail\}/],
 ['unlocked door open state',/lobbyOpenedProgressDoors\.add\(id\)/],
 ['five-badge Sunroom passage',/id==='badges'[\s\S]*beginHotelRoomPassage\(trigger,buildBadgeSunroom\)/]
];
for(const [name,pattern] of required)if(!pattern.test(lobby))throw new Error(`Missing lobby door contract: ${name}`);
if(!input.includes("data.type==='lobby-progression-door')handleLobbyProgressionDoor(data.part,hit.object)"))throw new Error('Lobby progression doors do not receive their physical passage trigger');
if((world.match(/lobby progression door campaign/g)||[]).length<2)throw new Error('Delayed lobby construction does not recognize the renamed center progression door');
if(!purge.includes("saveHotelProgress('purge-survived')"))throw new Error('Purge badge is not persisted for later lobby sessions');
if(/journalLevel\(entry\.id\)\s*>=\s*3/.test(lobby)||/journalLevel\(entry\.id\)===3/.test(lobby))throw new Error('Door I must unlock from discovery, not completed/defeated records');
const badgeIds=[...lobby.matchAll(/id:'(first-check-in|scrap-metal|last-service|severed-facade|no-vacancy)'/g)].map(match=>match[1]);
if(lobby.includes("id:'outclimb'")||lobby.includes('OUTCLIMB THE PAST'))throw new Error('The removed Outclimb the Past badge is still present');
if(new Set(badgeIds).size!==5)throw new Error(`Expected five unique badge requirements, found ${JSON.stringify(badgeIds)}`);

console.log(JSON.stringify({doors:['journals','campaign','badges'],journalRule:'all 26 monster records discovered on encounter',campaignRule:'current Room 140 endpoint or legacy completed ending',badges:badgeIds.length,badgeDestination:'Sunroom then Infinite Cinema'},null,2));
