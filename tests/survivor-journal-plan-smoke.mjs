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
 ['main loop pause',runtime,'if(journalPaused){if(controls.isLocked)controls.unlock();renderer.render(scene,camera);return}'],
 ['fallback loop pause',runtime,'if(journalPaused||!keyboardMovementFallback'],
 ['spawned monster pause',admin,'if(journalPaused)return'],
 ['notebook layout',css,'.journal-book{'],
 ['mobile notebook layout',css,'@media(max-width:760px)'],
])if(!source.includes(needle))throw new Error(`Missing ${label}: ${needle}`);

if(runtime.includes("removeItem('hotel-survivor-journal-v1')")||runtime.includes('removeItem("hotel-survivor-journal-v1")'))throw new Error('Reset Game must preserve permanent journal discoveries');
if(!runtime.includes('Your Survivor’s Journal will be kept.'))throw new Error('Reset confirmation must explain that journal discoveries persist');

const arraySource=journal.slice(journal.indexOf('['),journal.indexOf('];')+1);
const entries=vm.runInNewContext(`(${arraySource})`);
if(entries.length!==32)throw new Error(`Expected 32 journal entries, found ${entries.length}`);
for(const [index,entry] of entries.entries())for(const field of ['id','name','learn','survive','note'])if(!entry[field])throw new Error(`Entry ${index+1} is missing ${field}`);
if(new Set(entries.map(entry=>entry.id)).size!==32)throw new Error('Journal entry IDs are not unique');

console.log(JSON.stringify({entries:entries.length,layout:'two-page notebook',discovery:['unknown','observation','survival','complete'],controls:['J toggle','Escape close','paused gameplay','crouch preserved','typing protected'],persistence:['page reload','Reset Game'],adviceOverride:true},null,2));
