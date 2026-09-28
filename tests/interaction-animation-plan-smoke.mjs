import fs from 'node:fs';

import { readGameSource } from './source-bundle.mjs';
const source=readGameSource();
const css=fs.readFileSync(new URL('../escape-ui.css',import.meta.url),'utf8');

const requiredSystems=[
 ['first-person arm rig','first-person arms and held item'],
 ['held-item model builder','function makeFirstPersonHeldItem(id)'],
 ['inventory/viewmodel synchronization','syncFirstPersonHeldItem();'],
 ['pickup animation',"playFirstPersonAction('pickup'"],
 ['item-use animation',"playFirstPersonAction('use'"],
 ['drawer hand animation',"playFirstPersonAction('drawer'"],
 ['physical drawer motion','function animateDrawerMesh(mesh)'],
 ['closet camera transition','function updateHotelHideTransition(dt)'],
 ['closet enter animation',"playFirstPersonAction('closet-enter'"],
 ['closet exit animation',"playFirstPersonAction('closet-exit'"]
];
for(const [name,needle] of requiredSystems)if(!source.includes(needle))throw new Error(`Missing ${name}`);
if((source.match(/userData\.drawerMesh=drawer/g)||[]).length<3)throw new Error('Shared Floor 5, Floor 1, and Floor 2 drawers are not connected to physical animation meshes');
if(!source.includes('leftDoor:left,rightDoor:right'))throw new Error('Closet doors are not attached to hiding-spot animation state');
if(!source.includes("slowDrawer=part==='slow-drawer'||data.type==='noise-arc'&&part==='drawer'"))throw new Error('Slow Noise drawers are not protected from the instant drawer animation');
if(!css.includes('body.hotel-hiding-transition #game')||!css.includes('@keyframes closet-door-vignette'))throw new Error('Closet transition presentation is missing');

console.log(JSON.stringify({viewmodel:'arms + selected item',actions:['equip','pickup','use','drawer'],drawers:'physical slide',closets:'door swing + camera move',slowNoiseDrawers:'preserved'},null,2));
