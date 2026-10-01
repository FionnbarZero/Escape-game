import fs from'node:fs';

const admin=fs.readFileSync(new URL('../game/05-admin.js',import.meta.url),'utf8');
const world=fs.readFileSync(new URL('../game/06-hotel-world.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../game/25-runtime.js',import.meta.url),'utf8');
const checks={
 warningNeverHidesMonster:!admin.includes('monster.mesh.visible=Math.sin')&&admin.includes("if(monster.phase==='warning'){monster.timer-=dt;monster.mesh.visible=true"),
 activeAdminRecovery:admin.includes('monster.mesh.visible=true;'),
 currentChunkCannotSleep:world.includes('chunk===roomGroup')&&world.includes('chunk&&chunk!==roomGroup'),
 activeEncounterWatchdog:runtime.includes('function repairActiveMonsterVisibility()')&&runtime.includes('setInterval(repairActiveMonsterVisibility,200)'),
 animatedPartsStayRendered:runtime.includes('function stabilizeActiveMonsterRendering(root)')&&runtime.includes('object.frustumCulled=false'),
 invalidTransformRecovery:runtime.includes('function finiteMonsterTransform(root)')&&runtime.includes('lastRenderableTransform'),
 repairedBeforeMainRender:runtime.includes('repairActiveMonsterVisibility();renderer.render(scene,camera)'),
 intentionalHidingPreserved:runtime.includes("noise?.phase==='hunt'")&&runtime.includes('!floorTwo.windowPreview')&&runtime.includes("['attack','reverse'].includes(eviction.phase)")
};
const helperStart=runtime.indexOf('function finiteMonsterTransform(root)');
const helperEnd=runtime.indexOf('function repairActiveMonsterVisibility()');
if(helperStart<0||helperEnd<=helperStart)throw new Error('Monster rendering helpers were not found');
const scene={userData:{}};
const helpers=new Function('scene',`${runtime.slice(helperStart,helperEnd)};return{finiteMonsterTransform,stabilizeActiveMonsterRendering}`)(scene);
const vector=(values,keys)=>{const value={};keys.forEach((key,index)=>value[key]=values[index]);value.toArray=(target=[])=>{keys.forEach((key,index)=>target[index]=value[key]);return target};value.fromArray=source=>{keys.forEach((key,index)=>value[key]=source[index]);return value};return value};
const parent={visible:false,userData:{},parent:scene};
const visiblePart={isMesh:true,visible:true,frustumCulled:true};
const hiddenPart={isMesh:true,visible:false,frustumCulled:true};
const root={visible:false,userData:{},parent,position:vector([4,0,-3],['x','y','z']),quaternion:vector([0,0,0,1],['x','y','z','w']),scale:vector([1,1,1],['x','y','z']),traverse(callback){callback(this);callback(visiblePart);callback(hiddenPart)},updateMatrixWorld(){this.matrixRepaired=true}};
const firstRepair=helpers.stabilizeActiveMonsterRendering(root);
root.position.x=NaN;
const secondRepair=helpers.stabilizeActiveMonsterRendering(root);
const dormantRoot={...root,visible:false,userData:{},parent:{visible:false,userData:{connectedChunkDormant:true},parent:scene}};
const dormantSkipped=!helpers.stabilizeActiveMonsterRendering(dormantRoot)&&!dormantRoot.visible;
Object.assign(checks,{
 activeAncestorRecovered:firstRepair&&root.visible&&parent.visible,
 animatedPartCullingDisabled:!visiblePart.frustumCulled,
 hiddenChildStillHidden:!hiddenPart.visible,
 corruptedPositionRestored:secondRepair&&root.position.x===4&&root.matrixRepaired===true,
 retiredRoomNotRevived:dormantSkipped
});
if(Object.values(checks).some(value=>!value))throw new Error(`Monster visibility contract failed: ${JSON.stringify(checks)}`);
console.log(JSON.stringify(checks,null,2));
