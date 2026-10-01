import fs from'node:fs';

const admin=fs.readFileSync(new URL('../game/05-admin.js',import.meta.url),'utf8');
const world=fs.readFileSync(new URL('../game/06-hotel-world.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../game/25-runtime.js',import.meta.url),'utf8');
const checks={
 warningNeverHidesMonster:!admin.includes('monster.mesh.visible=Math.sin')&&admin.includes("if(monster.phase==='warning'){monster.timer-=dt;monster.mesh.visible=true"),
 activeAdminRecovery:admin.includes('monster.mesh.visible=true;'),
 currentChunkCannotSleep:world.includes('chunk===roomGroup')&&world.includes('chunk&&chunk!==roomGroup'),
 activeEncounterWatchdog:runtime.includes('function repairActiveMonsterVisibility()')&&runtime.includes('setInterval(repairActiveMonsterVisibility,200)'),
 intentionalHidingPreserved:runtime.includes("noise?.phase==='hunt'")&&runtime.includes('!floorTwo.windowPreview')&&runtime.includes("['attack','reverse'].includes(eviction.phase)")
};
if(Object.values(checks).some(value=>!value))throw new Error(`Monster visibility contract failed: ${JSON.stringify(checks)}`);
console.log(JSON.stringify(checks,null,2));
