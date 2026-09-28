import fs from 'node:fs';

import { readGameSource } from './source-bundle.mjs';

const source=readGameSource();
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const manifest=fs.readFileSync(new URL('../game/manifest.js',import.meta.url),'utf8');

const required=[
 ['Molly source module',"'18-molly.js'"],
 ['camera controller inventory entry',"'camera-controller':{label:'Camera / Door Controller'"],
 ['three distinct held tools',"else if(id==='camera-controller')"],
 ['Electrical Section entry',"part==='electrical-section'"],
 ['Molly interaction dispatch',"handleMolly(data.part,hit.object)"],
 ['normal 00 display',"display:'00'"],
 ['six numbered terminals','MOLLY_COMPUTER_POSITIONS.forEach'],
 ['physical computer travel',"phase==='computer-travel'"],
 ['deliberate terminal hack',"phase==='hack'"],
 ['linked door completion','hackMollyComputer(molly.targetComputer)'],
 ['Teller-inspired tailored silhouette',"skirt.name='Molly tailored service skirt'"],
 ['Teller-inspired service chassis',"chassis.name='Molly office-chair chassis'"],
 ['wire hair rig','const wires=[];for(let index=0;index<18;index++)'],
 ['articulated hair-flip elbow',"elbow.name='Molly articulated elbow'"],
 ['articulated hair-flip wrist',"wrist.name='Molly articulated wrist'"],
 ['staged hand-driven flare pose',"progress<.31?'hand-up'"],
 ['physical wire lift after hand reaches hair','rightGrip=wire.side>0?pose.grip:0'],
 ['four flare intensities',"startMollyFlare('final'"],
 ['sound location memory','molly.lastSound=[position.x??position[0],0,position.z??position[2]]'],
 ['sound strength memory','molly.soundStrength=strength'],
 ['physical route graph','function mollyPlanRoute(target)'],
 ['loop landmarks',"VENTILATION FAN JUNCTION"],
 ['two reception exits',"reception doorway wood frame"],
 ['old hotel material',"faded hotel wallpaper panel"],
 ['overhead cable trays',"open cable support tray"],
 ['active intercom floor zone',"intercom monitored floor marking"],
 ['broken intercom distinction',"INTERCOM OFFLINE"],
 ['crouch-safe intercom rule','!crouched&&intercom.cooldown<=0'],
 ['six labeled camera feeds','MOLLY_CAMERA_FEEDS'],
 ['camera player-position preservation','cameraView?.playerPosition'],
 ['camera ordinary-door access','function remoteOpenMollyCameraDoor()'],
 ['hacked-door remote refusal',"OVERRIDE REQUIRED · GET THE CODE"],
 ['restored camera access after override',"RESTORE CAMERA / DOOR ACCESS"],
 ['camera use does not suppress intercoms',"const crouched=molly.cameraView?.playerCrouched??"],
 ['drone inspection routes','MOLLY_DRONE_ROUTES'],
 ['physical controllable drone','function updateMollyDrone(dt,time)'],
 ['drone shortcut latch','function openMollyDroneLatch()'],
 ['drone proximity service control','function useMollyDroneService()'],
 ['drone location distraction',"mollyHearSound(mollyDroneEntity.position.clone(),1,'the drone beep')"],
 ['drone recovery dock','function recallMollyDrone()'],
 ['hammer shortcut collision','Molly breakable window blocker'],
 ['reinforced window distinction','reinforced observation window'],
 ['persistent player override','OVERRIDE HOLDS · USE THE CAMERA CONTROLLER'],
 ['permanent lever progress','function updateMollyProgressBoard()'],
 ['walk-through protected exit',"beginHotelRoomPassage(trigger,leaveMollySection)"],
 ['final control loss','molly.finalControlLost=true'],
 ['Molly runtime update','if(molly)updateMolly(dt,time)'],
 ['Molly reset persistence cleanup',"sessionStorage.removeItem('hotel-molly-run')"]
];

for(const [name,needle] of required)if(!source.includes(needle)&&!manifest.includes(needle))throw new Error(`Missing ${name}`);
if(!html.includes('value="molly-electrical"')||!html.includes('value="molly"'))throw new Error('Molly is missing from developer teleport or monster controls');
if(!source.includes('cancelNoise();cancelHotelNoiseArc();'))throw new Error('Molly does not suppress overlapping Noise encounters');
if(!source.includes("molly=fresh?newMollyRun(origin):loadMolly(origin)"))throw new Error('Molly lacks a persistent encounter checkpoint');
if(!source.includes("The computer number on Molly\u2019s face identifies her destination; it is not the code."))throw new Error('Computer identity and unlock codes are not clearly separated');
if(!source.includes("const open=molly.hacked.includes(computer)?false:molly.overridden.includes(computer)?molly.linkedDoorsOpened.includes(computer):true"))throw new Error('Linked shutters do not distinguish hacked, restored, and remotely opened states');
if(source.includes('LEVER ${index+1} HAS NO POWER'))throw new Error('A physically reached lever is still arbitrarily gated by a computer override');
if(source.includes('SHORTCUT LATCH RELEASED · AUTO-RECALL'))throw new Error('The drone still teleports through a preset route and opens the latch automatically');

console.log(JSON.stringify({monster:'Molly',appearance:'Teller-inspired tailored service silhouette',hairFlip:'articulated hand-up + grip + flick + cable settle',tools:['Nocturne maintenance hammer','camera / door controller','inspection drone controller'],cameraController:['six live feeds','ordinary remote access doors','hacked shutter refusal','post-override remote opening'],drone:['physical movement','service control','location beep','instant lower','recovery dock'],layout:'reception + connected loops + three lever rooms + final switch room',face:'00 or selected computer',terminals:6,wireBundles:18,cameraFeeds:6,droneRoutes:4,intercom:'marked and crouch-safe even while viewing controllers',shortcuts:['drone latch','hammer window'],leverProgress:'permanent',shutters:'open until hacked',exit:'walk-through protected corridor',noiseOverlap:false},null,2));
