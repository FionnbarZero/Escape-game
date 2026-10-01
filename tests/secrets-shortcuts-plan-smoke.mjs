import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const molly=read('../game/18-molly.js');
const journal=read('../game/23-journal.js');
const docs=read('../docs/secrets-shortcuts-update.md');

for(const [label,source,needle] of [
 ['saved drawer state',molly,'searchedDrawers:[]'],
 ['forgotten suite key state',molly,'secretSuiteKey:false'],
 ['observation clue state',molly,'observationClue:false'],
 ['persistent run shortcut',molly,'maintenanceShortcutOpen:false'],
 ['drawer animation binding',molly,'trigger.userData.drawerMesh=drawer'],
 ['forgotten suite',molly,"part==='secret-suite-door'"],
 ['observation room',molly,"part==='observation-log'"],
 ['far-side shortcut rule',molly,'camera.position.z>=17.7'],
 ['shortcut does not replace objective',molly,'requiredLevers:3'],
 ['place archive',journal,"hotel-survivor-places-v1"],
 ['places page',journal,'function journalPlacesMarkup()'],
 ['three place records',journal,"id:'electrical-shortcut'"],
 ['scope documentation',docs,'Implemented first slice'],
])if(!source.includes(needle))throw new Error(`Missing ${label}: ${needle}`);

if((journal.match(/id:'(?:forgotten-suite|maintenance-observation|electrical-shortcut)'/g)||[]).length!==3)throw new Error('Expected exactly three initial place discoveries');
const secretHandler=molly.slice(molly.indexOf('function handleMollySecretInteraction'),molly.indexOf('function handleMolly(part,trigger)'));
if(secretHandler.includes('finalUnlocked')||secretHandler.includes('levers.push'))throw new Error('Optional discovery handler must not complete Molly objectives');

console.log(JSON.stringify({slice:'Molly Electrical Section',secretRooms:2,shortcut:'far-side persistent per attempt',drawers:3,journalPlaces:3,objective:'three Molly levers unchanged'},null,2));
