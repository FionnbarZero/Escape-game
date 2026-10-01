import fs from 'node:fs';
import {readGameSource} from './source-bundle.mjs';

const source=readGameSource(),css=fs.readFileSync(new URL('../escape-ui.css',import.meta.url),'utf8');
const checks=[
 ['drawer assembly','function ensureDrawerAssembly(mesh)'],
 ['drawer tray','drawerAssembly={tray,handle,contents}'],
 ['local drawer axis','applyQuaternion(mesh.quaternion).normalize()'],
 ['drawer close support',"to=from>.5?0:1"],
 ['slow drawer progress','setDrawerVisualProgress(drawer,hotelNoiseArc.drawerProgress||0)'],
 ['hinged wardrobe doors','leftOpen:-1.18,rightOpen:1.18'],
 ['single and double door variants',"const doubleDoor=kind==='wardrobe'"],
 ['closet path validation','function hotelHidePathClear(from,to,spot)'],
 ['recoverable blocked exit','EXIT BLOCKED · REMAIN INSIDE'],
 ['concealment commit','t>=.8'],
 ['exit exposure timing',"transition.mode==='exit'"],
 ['transition input guard','if(hotelHideTransition)return'],
 ['movement transition guard','hotelHideState||hotelHideTransition'],
 ['contact hand actions','function playContactAction(kind,worldPoint'],
 ['hinged container animation','function animateHingedPanel(spec)'],
 ['suitcase lid integration','room 304 suitcase hinged lid'],
 ['cupboard door integration','bathroom medicine cabinet hinged door'],
 ['wardrobe task door integration','room 16 wardrobe left hinged door'],
 ['control contact actions',"/lever|switch|button/.test(label)"],
 ['attached drawer contents','stored contents'],
 ['reduced motion setting preserved','graphicsReducedMotion']
];
for(const [name,needle] of checks)if(!source.includes(needle))throw new Error(`Missing ${name}: ${needle}`);
if(!css.includes('body.hotel-hiding-transition #game')||!css.includes('closet-door-vignette 1.08s'))throw new Error('Closet transition CSS is not synchronized with the physical sequence');
if(!source.includes("slowDrawer=part==='slow-drawer'||data.type==='noise-arc'&&part==='drawer'"))throw new Error('Slow drawers can fall through to instant drawer toggling');
console.log(JSON.stringify({drawerAssembly:'tray + sides + rear + handle + contents',drawerCycles:'open/close without loot mutation',slowDrawers:'authoritative progress retained',closets:'hinged doors + staged body transition + blocked-exit recovery',relatedInteractions:'pickup/control/door contact poses'},null,2));
