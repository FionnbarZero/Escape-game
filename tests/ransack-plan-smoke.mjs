import fs from 'node:fs';

const source=fs.readFileSync(new URL('../three-game.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../escape-ui.css',import.meta.url),'utf8');

const requirements=[
 ['Ransack angel model',"angel.name='Ransack · the mean angel'"],
 ['three-second warning',"ransack.timer=3"],
 ['stop detection',"ransack.stillTime>=.28"],
 ['non-lethal collection consequence',"ransack.phase='collect'"],
 ['three red marks',"total:3"],
 ['route sealing',"RANSACK SEALED THE ROUTE"],
 ['direct admin trigger',"document.querySelector('#admin-ransack').onclick"],
 ['frame update','updateRansack(dt,time)']
];
for(const [name,needle] of requirements)if(!source.includes(needle))throw new Error(`Missing ${name}`);
if(!source.includes("eviction||noise||hotelNoiseArc||pursuer||collector||clockmaker||drowned"))throw new Error('Ransack is not excluded from major encounters');
if(!source.includes("hotelSideScene==='floor5-transition'")||!source.includes("[1,3,5,7,9].includes(floorOne.phase)")||!source.includes("[1,3,5,9,14,16,18].includes(floorTwo.phase)"))throw new Error('Ransack is not limited to ordinary generated hotel exploration');
if(!source.includes('I was never trying to kill you'))throw new Error('Ransack does not reveal his non-lethal intent');
if(!html.includes('id="ransack-hud"')||!html.includes('id="admin-ransack"'))throw new Error('Ransack HUD or admin control is missing');
if(!css.includes('#ransack-sign')||!css.includes('body.ransack-stop #game'))throw new Error('Ransack STOP presentation is missing');

console.log(JSON.stringify({angel:'Ransack',role:'mean challenge angel',warningSeconds:3,success:'stop moving',failure:'collect 3 red marks',lethal:false,excluded:['bosses','Pursuer','Noise','safe rooms','Night Lobby']},null,2));
