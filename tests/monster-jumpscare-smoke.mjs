import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../index.html');
const css=read('../escape-ui.css');
const characterCss=read('../monster-jumpscares.css');
const core=read('../game/00-core.js');
const admin=read('../game/05-admin.js');
const purge=read('../game/09-eviction.js');
const noiseArc=read('../game/10-noise-arc.js');
const collector=read('../game/12-collector.js');
const clockmaker=read('../game/13-clockmaker.js');
const drowned=read('../game/14-drowned-guest.js');
const pursuer=read('../game/15-pursuer.js');
const floorOne=read('../game/16-floor-one.js');
const floorTwo=read('../game/17-floor-two.js');
const molly=read('../game/18-molly.js');
const noise=read('../game/18-noise-runtime.js');
const jailbreak=read('../game/21-jailbreak.js');
const root=read('../game/24-cabin-maze.js');
const runtime=read('../game/25-runtime.js');

const checks=[
 ['shared overlay markup',html,'id="monster-jumpscare"'],
 ['shared face markup',html,'monster-jumpscare__face'],
 ['character signature markup',html,'monster-jumpscare__signature'],
 ['character impact markup',html,'monster-jumpscare__impact'],
 ['shared controller',core,'function playMonsterJumpscare'],
 ['overlay replay reset',core,'void overlay.offsetWidth'],
 ['monster variant map',core,'MONSTER_JUMPSCARE_VARIANTS'],
 ['monster profile map',core,'MONSTER_JUMPSCARE_PROFILES'],
 ['profile motion routing',core,'overlay.dataset.motion=profile.motion'],
 ['lunge animation',css,'monster-face-lunge'],
 ['camera impact',css,'monster-camera-impact'],
 ['reduced flashing support',css,'body.reduced-flashing .monster-jumpscare__streaks'],
 ['Molly terminal face',characterCss,'COMPUTER FACE // CAPTURE'],
 ['Molly outward and return slam',characterCss,'@keyframes molly-monitor-kill'],
 ['False Guest unmask',characterCss,'@keyframes impostor-unmask'],
 ['Spider pounce',characterCss,'@keyframes spider-pounce'],
 ['Watcher unseen cut',characterCss,'@keyframes watcher-unseen'],
 ['Guard baton',characterCss,'@keyframes guard-baton'],
 ['Purge raging teeth',css,'.purge-mouth:before,.purge-mouth:after'],
 ['Purge teeth snap',css,'purge-teeth-rage'],
 ['spawned monster capture',admin,'playMonsterJumpscare(monster.type,monster.name,reason'],
 ['Purge capture',purge,"playMonsterJumpscare('purge'"],
 ['Noise arc capture',noiseArc,"playMonsterJumpscare('noise'"],
 ['Noise campaign capture',noise,"playMonsterJumpscare('noise'"],
 ['Collector capture',collector,"playMonsterJumpscare('collector'"],
 ['Clockmaker capture',clockmaker,"playMonsterJumpscare('clockmaker'"],
 ['Drowned Guest capture',drowned,"playMonsterJumpscare('drowned-guest'"],
 ['Pursuer capture',pursuer,"playMonsterJumpscare('pursuer'"],
 ['Chef, Noise, and Cable classification',floorOne,'function floorOneDeathMonster'],
 ['Floor Two encounter classification',floorTwo,'function floorTwoDeathMonster'],
 ['Molly capture',molly,"playMonsterJumpscare('molly'"],
 ['Vent Crawler capture',jailbreak,"playMonsterJumpscare('vent-crawler'"],
 ['Cellblock Guard capture',jailbreak,"playMonsterJumpscare('cellblock-guard'"],
 ['Pursuit Guards capture',jailbreak,"playMonsterJumpscare('pursuit-guards'"],
 ['Root Stalker capture',root,"playMonsterJumpscare('root-stalker'"],
 ['Staircase Monster capture',runtime,"playMonsterJumpscare('stair-monster'"],
 ['Giant Spider capture',runtime,"playMonsterJumpscare('giant-spider'"],
];

for(const [label,source,needle] of checks)if(!source.includes(needle))throw new Error(`${label}: missing ${needle}`);
const uniqueProfiles=['bash','chef','collector','clockmaker','drowned','water','pursuer','molly','stair','cable','spider','root','gardener','watcher','ballroom-guest','false-guest','window','reflection','warden','porter','bellhop','manager','auditor','cellblock-guard','pursuit-guards','crawler'];
for(const profile of uniqueProfiles)if(!characterCss.includes(`[data-monster="${profile}"]`))throw new Error(`Missing character portrait: ${profile}`);
const motions=[...characterCss.matchAll(/@keyframes ([\w-]+)(?=\{)/g)].map(match=>match[1]);
for(const motion of ['bash-ram','chef-cleave','collector-grab','clockmaker-wind','drowned-surge','water-breach','pursuer-intercept','molly-monitor-kill','stair-zigzag','cable-whip','spider-pounce','root-erupt','gardener-reap','watcher-unseen','guest-waltz','impostor-unmask','window-break','reflection-cross','warden-crush','porter-blink','bellhop-ring','manager-block','auditor-scan','guard-baton','guards-roadblock','crawler-duct-slam'])if(!motions.includes(motion))throw new Error(`Missing unique kill motion: ${motion}`);
for(const environmental of ['YOU FELL THROUGH THE FLOOR-HOLE CORRIDOR','THE BROKEN RUNG DROPPED YOU INTO THE CABLES']){
 const classifier=floorOne.slice(floorOne.indexOf('function floorOneDeathMonster'),floorOne.indexOf('function failFloorOne'));
 if(classifier.includes(environmental))throw new Error(`Environmental failure incorrectly classified as a monster: ${environmental}`);
}

console.log(JSON.stringify({system:'character-specific monster death jumpscares',specialized:['The Purge','The Noise'],characterPortraits:uniqueProfiles.length,uniqueKillMotions:26,molly:'terminal face ejects, retracts, and slams',campaignCapturePaths:17,spawnedRoster:'all catalog monsters through adminMonsterHit',accessibility:['aria-hidden','reduced motion','reduced flashing']},null,2));
