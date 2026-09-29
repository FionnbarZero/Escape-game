import fs from 'node:fs';

import { readGameSource } from './source-bundle.mjs';

const source=readGameSource();
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../escape-ui.css',import.meta.url),'utf8');

const requirements=[
 ['story-aware HUD identities','const STORY_HUD_IDENTITIES='],
 ['Hotel Nocturne identity',"hotel:{mark:'N',brand:'HOTEL<br>NOCTURNE'"],
 ['Blackridge identity',"jailbreak:{mark:'B',brand:'BLACKRIDGE<br>ESCAPE'"],
 ['Cabin identity',"cabin:{mark:'C',brand:'THE CABIN<br>THAT WATCHES'"],
 ['dynamic location label','function refreshStoryHud()'],
 ['room-transition HUD reveal','function revealStoryHud()'],
 ['five-second compact delay','},5200)'],
 ['gameplay HUD toggle',"document.body.classList.toggle('hud-compact')"],
 ['surface material classification','function surfaceTextureForName'],
 ['wood bump detail','material.bumpMap=surface.detail'],
 ['local light fill position','fill.position.set(pos[0]'],
 ['occluded world labels','depthTest:true'],
 ['spatial interaction Foley','function playWorldFoley'],
 ['drawer movement Foley',"playWorldFoley('drawer'"],
 ['pickup movement Foley',"playWorldFoley('pickup'"],
 ['lower camera controller','group.position.set(.18,-.13,.035)'],
 ['lower drone controller','group.position.set(.1,-.14,.04)'],
 ['immediate Floor 2 exposure state',"const exposureLabel=outdoor?(sheltered?'SHELTERED':'EXPOSED'):'INSIDE'"],
 ['Molly progress refresh','setMollyHud();refreshStoryHud()'],
 ['Jailbreak sector location',"setRoomNumber(jailbreakStage===8?'OUTSIDE'"],
 ['Cabin current-room location',"roomNumber.textContent=room===8?'INFINITE HOTEL'"],
];

for(const [name,needle] of requirements)if(!source.includes(needle))throw new Error(`Missing ${name}`);
if(!html.includes('id="story-mark"')||!html.includes('id="story-brand"')||!html.includes('id="progress-label"')||!html.includes('id="room-label"'))throw new Error('Story HUD semantic elements are incomplete');
if(html.includes('<title>The Cabin That Watches — 3D</title>'))throw new Error('Browser title still defaults to Cabin branding');
if(!css.includes('body.hud-compact .caption')||!css.includes('body.room-nav-empty>nav'))throw new Error('Compact HUD or unused room-navigation collapse is missing');
if(!css.includes('body[data-story="jailbreak"]')||!css.includes('body[data-story="cabin"]'))throw new Error('Story-specific visual themes are missing');
if(css.includes(".status:before{content:'CLUES FOUND'"))throw new Error('Static Cabin progress label remains in shared HUD');

console.log(JSON.stringify({hud:'story-aware and compactible',themes:['hotel','jailbreak','cabin'],presentation:['material bump detail','local fill lights','occluded signs','spatial interaction Foley','lower held controllers'],floorTwoState:'synchronous'},null,2));
