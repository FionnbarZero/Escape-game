import fs from 'node:fs';
import vm from 'node:vm';

const state=fs.readFileSync(new URL('../game/01-state.js',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../game/24-cabin-maze.js',import.meta.url),'utf8');
const runtime=fs.readFileSync(new URL('../game/25-runtime.js',import.meta.url),'utf8');
const readme=fs.readFileSync(new URL('../README.md',import.meta.url),'utf8');

for(const [label,source,needle] of [
 ['jump charge state',state,'jumpCharging=false'],
 ['parkour action state',state,"parkourAction=''"],
 ['shared active-input gate',runtime,'playerMovementInputActive'],
 ['release-to-jump',runtime,'function releaseJumpCharge()'],
 ['charged jump velocity',runtime,'JUMP_CHARGED_VELOCITY=8'],
 ['air dive',runtime,"parkourAction='dive'"],
 ['ground dash',runtime,"parkourAction='dash'"],
 ['double-tap roll',runtime,'PARKOUR_DOUBLE_TAP_MS'],
 ['dive landing roll',runtime,"if(parkourAction==='dive')"],
 ['R input',input,"e.code==='KeyR'"],
 ['Space release input',input,"if(e.code==='Space')releaseJumpCharge()"],
 ['controls documentation',readme,'double-tap it to roll']
])if(!source.includes(needle))throw new Error(`Missing ${label}: ${needle}`);

let now=1000;
const sandbox={keys:{},controls:{isLocked:true,moveForward(){}},molly:null,hotelHideState:null,performance:{now:()=>now},THREE:{MathUtils:{clamp:(value,min,max)=>Math.max(min,Math.min(max,value)),lerp:(a,b,t)=>a+(b-a)*t}},document:{querySelector:()=>({textContent:''})}};
vm.createContext(sandbox);
const parkourSource=runtime.slice(0,runtime.indexOf('function startSlide'));
vm.runInContext(`
 let keyboardMovementFallback=false,jumpHoldTimer=0,jumpCharging=false,jumpChargeStarted=0,parkourAction='',parkourActionTimer=0,parkourCooldown=0,parkourLastGroundTap=-1e9,parkourAirDiveUsed=false,verticalVelocity=0,playerGrounded=true,slideTimer=0;
 ${parkourSource}
 globalThis.testJumpApex=heldMs=>{verticalVelocity=0;playerGrounded=true;jumpCharging=false;beginJumpCharge();globalThis.advanceClock(heldMs);const beforeRelease={grounded:playerGrounded,velocity:verticalVelocity};releaseJumpCharge();let height=0,apex=0;for(let frame=0;frame<360;frame++){applyJumpGravity(1/120);height+=verticalVelocity/120;apex=Math.max(apex,height);if(height<=0&&verticalVelocity<0)break}return{apex,beforeRelease}};
 globalThis.testGroundActions=()=>{playerGrounded=true;parkourAction='';parkourLastGroundTap=-1e9;triggerParkourMove();const first=parkourAction;globalThis.advanceClock(180);triggerParkourMove();return[first,parkourAction]};
 globalThis.testDive=()=>{playerGrounded=false;parkourAirDiveUsed=false;parkourAction='';verticalVelocity=2;triggerParkourMove();const started={action:parkourAction,velocity:verticalVelocity};playerGrounded=true;resolveParkourLanding();return{...started,landed:parkourAction}};
 globalThis.testFallbackInput=()=>{controls.isLocked=false;keyboardMovementFallback=true;playerGrounded=true;verticalVelocity=0;beginJumpCharge();const waitsForRelease=playerGrounded&&verticalVelocity===0;globalThis.advanceClock(220);releaseJumpCharge();const jump=verticalVelocity>0&&!playerGrounded;playerGrounded=true;parkourAction='';parkourLastGroundTap=-1e9;triggerParkourMove();const dash=parkourAction;globalThis.advanceClock(180);triggerParkourMove();const roll=parkourAction;playerGrounded=false;parkourAirDiveUsed=false;parkourAction='';verticalVelocity=1;triggerParkourMove();const dive=parkourAction;controls.isLocked=true;keyboardMovementFallback=false;return{waitsForRelease,jump,dash,roll,dive}};
`,sandbox);
sandbox.advanceClock=milliseconds=>{now+=milliseconds};
const tap=sandbox.testJumpApex(0),hold=sandbox.testJumpApex(450),tapApex=tap.apex,holdApex=hold.apex,[groundTap,groundDoubleTap]=sandbox.testGroundActions(),dive=sandbox.testDive(),fallback=sandbox.testFallbackInput();
if(holdApex<=tapApex+.45)throw new Error(`Held jump is not meaningfully higher: ${JSON.stringify({tapApex,holdApex})}`);
if(!tap.beforeRelease.grounded||tap.beforeRelease.velocity!==0||!hold.beforeRelease.grounded||hold.beforeRelease.velocity!==0)throw new Error('Jump started before Space was released');
if(groundTap!=='dash'||groundDoubleTap!=='roll')throw new Error(`Ground R actions failed: ${JSON.stringify({groundTap,groundDoubleTap})}`);
if(dive.action!=='dive'||dive.velocity>=0||dive.landed!=='roll')throw new Error(`Dive flow failed: ${JSON.stringify(dive)}`);
if(!fallback.waitsForRelease||!fallback.jump||fallback.dash!=='dash'||fallback.roll!=='roll'||fallback.dive!=='dive')throw new Error(`Keyboard fallback actions failed: ${JSON.stringify(fallback)}`);

console.log(JSON.stringify({jump:{trigger:'Space release',tapApex:Number(tapApex.toFixed(2)),holdApex:Number(holdApex.toFixed(2)),waitsWhileHeld:true},air:'R dive',ground:'R dash · double-R roll',landing:'dive → roll',fallback,levels:'shared height runtime'},null,2));
