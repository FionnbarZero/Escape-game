import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const sources={
 core:read('../game/00-core.js'),
 state:read('../game/01-state.js'),
 admin:read('../game/05-admin.js'),
 courtyard:read('../game/17-floor-two-parkour.js'),
 journal:read('../game/23-journal.js'),
 html:read('../index.html'),
 jumpscares:read('../monster-jumpscares.css')
};
for(const [name,source] of Object.entries(sources))for(const forbidden of ['water-creature','Water Creature','water-slither','water-breach','floorTwoCourseCreature','courtyard-valve'])if(source.includes(forbidden))throw new Error('Removed Water Creature reference remains in '+name+': '+forbidden);
if(!sources.courtyard.includes("'flooded-courtyard':{name:'The Flooded Courtyard'"))throw new Error('The environmental Flooded Courtyard route was removed with the creature');
if(!sources.courtyard.includes('FOLLOW THE RAISED ROUTE · WATER SLOWS MOVEMENT'))throw new Error('The creature-free courtyard does not explain its traversal rule');
console.log(JSON.stringify({waterCreature:'removed',floodedCourtyard:'environmental traversal preserved',adminSpawn:'removed',journalRecord:'removed'},null,2));
