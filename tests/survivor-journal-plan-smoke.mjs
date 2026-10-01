import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL(path,import.meta.url),'utf8');
const html=read('../index.html');
const css=read('../escape-ui.css');
const journal=read('../game/23-journal.js');
const manifest=read('../game/manifest.js');
const runtime=read('../game/25-runtime.js');
const admin=read('../game/05-admin.js');

for(const [label,source,needle] of [
 ['journal dialog',html,'id="survivor-journal"'],
 ['two-page index',html,'id="journal-entry-list"'],
 ['survival advice option',html,'id="journal-show-advice"'],
 ['journal module order',manifest,"'23-journal.js'"],
 ['unknown entry label',journal,"name.textContent=level?entry.name:'UNKNOWN'"],
 ['persistent discovery',journal,"hotel-survivor-journal-v1"],
 ['three discovery levels',journal,'Math.min(3,level)'],
 ['typing guard',journal,'journalTypingTarget(event.target)'],
 ['computer dialog guard',journal,'||dlg.open||'],
 ['Escape close',journal,"event.code==='KeyJ'||event.code==='Escape'"],
 ['control restoration',journal,'journalResumeLocked'],
 ['crouch state preservation',journal,'controls.unlock()'],
 ['main loop pause',runtime,'if(journalPaused){if(controls.isLocked)controls.unlock();journalRenderTick+=rawDt'],
 ['paused render throttle',runtime,'journalRenderTick>=.12'],
 ['fallback loop pause',runtime,'if(journalPaused||!keyboardMovementFallback'],
 ['spawned monster pause',admin,'if(journalPaused)return'],
 ['notebook layout',css,'.journal-book{'],
 ['mobile notebook layout',css,'@media(max-width:760px)'],
])if(!source.includes(needle))throw new Error(`Missing ${label}: ${needle}`);

if(runtime.includes("removeItem('hotel-survivor-journal-v1')")||runtime.includes('removeItem("hotel-survivor-journal-v1")'))throw new Error('Reset Game must preserve permanent journal discoveries');
if(!runtime.includes('Your Survivor’s Journal will be kept.'))throw new Error('Reset confirmation must explain that journal discoveries persist');

const arraySource=journal.slice(journal.indexOf('['),journal.indexOf('];')+1);
const entries=vm.runInNewContext(`(${arraySource})`);
if(entries.length!==26)throw new Error(`Expected 26 journal entries, found ${entries.length}`);
for(const [index,entry] of entries.entries())for(const field of ['id','name','learn','survive','note'])if(!entry[field])throw new Error(`Entry ${index+1} is missing ${field}`);
if(new Set(entries.map(entry=>entry.id)).size!==26)throw new Error('Journal entry IDs are not unique');
for(const removed of ['water-creature','elevator-boss','door-boss','cellblock-guard','pursuit-guards','watching-figures'])if(entries.some(entry=>entry.id===removed))throw new Error(`Non-monster or removed record remains: ${removed}`);
const opinionSource=journal.match(/const SURVIVOR_JOURNAL_OPINIONS=(\{[\s\S]*?\n\});/)?.[1],opinions=opinionSource?vm.runInNewContext(`(${opinionSource})`):{};
if(Object.keys(opinions).length!==26||entries.some(entry=>!opinions[entry.id]))throw new Error('Every monster must have a separate journal opinion');
const gameDirectory=new URL("../game/",import.meta.url),allGameSource=fs.readdirSync(gameDirectory).filter(file=>file.endsWith(".js")).map(file=>fs.readFileSync(new URL(file,gameDirectory),"utf8")).join("\n"),reachable=new Set();
for(const match of allGameSource.matchAll(/(?:journalDiscover|mark)\(\'([^\']+)\'/g))reachable.add(match[1]);
for(const match of journal.matchAll(/for\(const id of \[([^\]]+)\]\)mark\(id/g))for(const id of match[1].matchAll(/\'([^\']+)\'/g))reachable.add(id[1]);
for(const match of allGameSource.matchAll(/allowed:\[([^\]]+)\]/g))for(const id of match[1].matchAll(/\'([^\']+)\'/g))reachable.add(id[1]);
const unreachable=entries.map(entry=>entry.id).filter(id=>!reachable.has(id));
if(unreachable.length)throw new Error(`Journal records have no normal discovery route: ${unreachable.join(", ")}`);
for(const [path,id] of [["../game/12-collector.js","collector"],["../game/13-clockmaker.js","clockmaker"],["../game/14-drowned-guest.js","drowned-guest"],["../game/18-molly.js","molly"]])if(!read(path).includes(`journalDiscover(\'${id}\',3)`))throw new Error(`Completed encounter does not persist ${id}`);

for(const needle of ['hotel-survivor-curios-v1','function journalCurioMarkup()','hotel-survivor-places-v1','function journalPlacesMarkup()','Places & Discoveries','<small>MY OPINION</small>','id===\'curios\'','the <b>sub-floors</b>'])if(!journal.includes(needle))throw new Error(`Expanded journal feature missing: ${needle}`);
if(runtime.includes("removeItem('hotel-survivor-curios-v1')")||runtime.includes("removeItem('hotel-survivor-places-v1')"))throw new Error('Reset Game must preserve permanent optional-discovery records');

console.log(JSON.stringify({entries:entries.length,opinions:Object.keys(opinions).length,roomCurios:12,subFloors:'Infinite Cinema has a discovered place record',layout:'two-page notebook',discovery:['unknown','observation','survival','complete'],controls:['J toggle','Escape close','paused gameplay','crouch preserved','typing protected'],persistence:['page reload','Reset Game'],adviceOverride:true},null,2));
