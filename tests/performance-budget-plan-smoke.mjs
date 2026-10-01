import fs from'node:fs';
const core=fs.readFileSync(new URL('../game/00-core.js',import.meta.url),'utf8');
const world=fs.readFileSync(new URL('../game/06-hotel-world.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../game/25-runtime.js',import.meta.url),'utf8');
const checks={
 adaptiveResolution:core.includes('updateAdaptiveGraphicsPerformance')&&core.includes("dataset.performanceMode='adaptive'"),
 explicitQualityStable:core.includes("!validGraphicsQualities.includes(requestedGraphicsQuality)"),
 mediumLocalShadowsDisabled:core.includes("graphicsQuality==='high'&&expensiveLocalShadow"),
 connectedChunkRetirement:world.includes('retireConnectedHotelChunk')&&world.includes('HOTEL_CONNECTED_DETAILED_HISTORY=1'),
 previousRoomOccludedBehindEntry:world.includes('deactivateConnectedHotelChunk')&&world.includes('chunk.visible=false'),
 cameraContinuityPreserved:world.includes('worldPosition=camera.getWorldPosition')&&world.includes('camera.position.copy(localEntry)'),
 pausedRenderThrottle:runtime.includes('journalRenderTick>=.12'),
 uiWorkThrottle:runtime.includes('runtimeUiTick>=.1')
};
if(Object.values(checks).some(value=>!value))throw new Error(`Performance plan contract failed: ${JSON.stringify(checks)}`);
console.log(JSON.stringify(checks,null,2));
