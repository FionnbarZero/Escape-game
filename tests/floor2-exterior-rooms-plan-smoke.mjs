import fs from 'node:fs';

const source=fs.readFileSync(new URL('../three-game.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const readme=fs.readFileSync(new URL('../README.md',import.meta.url),'utf8');

const roomTypes=['fire-escape','window-cradle','vent-roof','water-tower','skybridge','billboard','ledge','scaffold','neon','balcony'];
for(const type of roomTypes)if(!source.includes(`kind==='${type}'`)&&!source.includes(`${type}:`))throw new Error(`Missing custom exterior room type: ${type}`);

for(const [route,count] of [['watcherExterior',2],['fuseExterior',7],['finalExterior',9]]){
 if(!source.includes(`${route}:generateFloorTwoExteriorSegment(random,${count}`))throw new Error(`Missing ${count}-room ${route} route`);
}

if(!source.includes("if([9,14,16].includes(floorTwo.phase))return buildFloorTwoOutdoorRandom()"))throw new Error('Outdoor phases still use the indoor room builder');
if(!source.includes("const routeName={9:'watcherExterior',14:'fuseExterior',16:'finalExterior'}"))throw new Error('Exterior phases are not mapped to their custom routes');
if(source.includes("9:'watcherInside'")||source.includes("14:'fuseToSpotlights'"))throw new Error('Legacy indoor routes remain attached to exterior phases');
if(!source.includes('addFloorTwoExteriorDressing(width,depth)'))throw new Error('Custom exterior rooms are missing facade and skyline dressing');
if(!source.includes("depth={ledge:40")||!source.includes("'fire-escape':42"))throw new Error('Exterior rooms were not lengthened');

for(const destination of ['floor2-fireescape','floor2-rooftops','floor2-gauntlet'])if(!html.includes(`value="${destination}"`))throw new Error(`Missing admin exterior checkpoint: ${destination}`);
if(!readme.includes('Ten custom outdoor room types')||!readme.includes('seven-room rooftop maintenance run'))throw new Error('README does not document the expanded exterior');

console.log(JSON.stringify({customExteriorTypes:roomTypes.length,exteriorRooms:18,phases:[9,14,16],puzzlesAdded:0},null,2));
