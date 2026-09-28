import fs from 'node:fs';

import { readGameSource } from './source-bundle.mjs';

const source=readGameSource();
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const manifest=fs.readFileSync(new URL('../game/manifest.js',import.meta.url),'utf8');

const required=[
 ['Molly source module',"'18-molly.js'"],
 ['Electrical Section entry',"part==='electrical-section'"],
 ['Molly interaction dispatch',"data.type==='molly'"],
 ['normal 00 display',"display:'00'"],
 ['six numbered terminals','MOLLY_COMPUTER_POSITIONS.forEach'],
 ['physical computer travel',"phase==='computer-travel'"],
 ['deliberate terminal hack',"phase==='hack'"],
 ['linked door completion','hackMollyComputer(molly.targetComputer)'],
 ['wire hair rig','const wires=[];for(let index=0;index<16;index++)'],
 ['hand-driven flare pose',"shoulder.rotation.z=-1.48*fan"],
 ['casual flare',"startMollyFlare('casual'"],
 ['focused flare',"startMollyFlare('focused'"],
 ['agitated flare',"startMollyFlare('agitated'"],
 ['final restrained flare',"startMollyFlare('final'"],
 ['sound location memory','molly.lastSound=[position.x??position[0],0,position.z??position[2]]'],
 ['sound strength memory','molly.soundStrength=strength'],
 ['crouch-safe intercom rule','!crouched&&intercom.cooldown<=0'],
 ['camera player-position preservation','cameraView?.playerPosition'],
 ['drone local distraction',"MOLLY INVESTIGATES THE BEEP, NOT THE CONTROLLER"],
 ['hammer crash reaction',"mollyHearSound(new THREE.Vector3(-18,0,4),1.6,'the breaking window')"],
 ['persistent player override','MOLLY CANNOT UNDO IT'],
 ['final control loss','molly.finalControlLost=true'],
 ['Molly runtime update','if(molly)updateMolly(dt,time)'],
 ['Molly reset persistence cleanup',"sessionStorage.removeItem('hotel-molly-run')"]
];

for(const [name,needle] of required)if(!source.includes(needle)&&!manifest.includes(needle))throw new Error(`Missing ${name}`);
if(!html.includes('value="molly-electrical"')||!html.includes('value="molly"'))throw new Error('Molly is missing from developer teleport or monster controls');
if(!source.includes('cancelNoise();cancelHotelNoiseArc();'))throw new Error('Molly does not suppress overlapping Noise encounters');
if(!source.includes("molly=fresh?newMollyRun(origin):loadMolly(origin)"))throw new Error('Molly lacks a persistent encounter checkpoint');
if(!source.includes("The computer number on Molly\u2019s face is not the code."))throw new Error('Computer identity and unlock codes are not clearly separated');
if(!source.includes("molly.overridden.includes(number)"))throw new Error('Molly can overwrite a completed player override');

console.log(JSON.stringify({monster:'Molly',face:'00 or selected computer',terminals:6,wireBundles:16,flareVariants:4,senses:'last sound location',intercom:'crouch-safe',tools:['code machine','hammer','drone','camera'],objective:'3 overrides + 3 levers',overrides:'persistent',noiseOverlap:false},null,2));
