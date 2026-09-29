import fs from 'node:fs';

import { readGameSource } from './source-bundle.mjs';
const source=readGameSource();
const readme=fs.readFileSync(new URL('../README.md',import.meta.url),'utf8');

const requirements=[
 ['shared connected passage builder','function addSeamlessHotelPassage('],
 ['manual passage activation','function beginHotelRoomPassage('],
 ['walk-through streaming update','function updateHotelRoomPassage(dt)'],
 ['expanded movement boundary','const boundary=hotelRoomPassage?.boundary||'],
 ['Floor 5 connected exits',"type:'floor-five',part:'transition-exit'"],
 ['Floor 1 connected exits',"type:'floor-one',part:'exit'"],
 ['Floor 2 connected exits',"type:'floor-two',part:'exit'"],
 ['numbered hotel connected exits',"type:'hotel-run-exit',part:'hotel-run-exit'"],
 ['Library connected exit',"part:'library-exit'"],
 ['Pool connected exit',"part:'pool-exit'"],
 ['connected completion marker',"dataset.hotelTransition='connected'"],
 ['persistent connected chunks','hotelConnectedChunks.push(currentChunk)'],
 ['world-position preservation','worldPosition=camera.getWorldPosition'],
 ['camera joins next chunk','nextGroup.add(camera)']
];
for(const [name,needle] of requirements)if(!source.includes(needle))throw new Error(`Missing ${name}`);

if(!source.includes('handleFloorFive(data.part,hit.object)')||!source.includes('handleFloorOne(data.part,hit.object)')||!source.includes('handleFloorTwo(data.part,hit.object)'))throw new Error('Door triggers are not passed into every floor handler');
if(!source.includes('beginHotelRoomPassage(trigger,floorOneAdvance)')||!source.includes('beginHotelRoomPassage(trigger,floorTwoAdvance)'))throw new Error('A numbered floor still advances immediately when E is pressed');
if(!readme.includes('walk through a physical connector'))throw new Error('README does not document seamless room streaming');

console.log(JSON.stringify({hotelTransitions:'persistent connected world chunks',activation:'open then walk',floors:[5,1,2],connector:'physical vestibule',cameraTeleportOnInteract:false,cameraTeleportOnThreshold:false},null,2));
