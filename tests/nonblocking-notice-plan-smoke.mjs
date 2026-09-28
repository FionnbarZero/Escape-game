import fs from 'node:fs';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../escape-ui.css',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../three-game.js',import.meta.url),'utf8');

if(!html.includes('id="game-notice"')||!html.includes('aria-live="polite"'))throw new Error('The non-blocking game notice is missing or inaccessible');
if(!css.includes('#game-notice{')||!css.includes('#game-notice.active{'))throw new Error('The bottom-screen notice styling is missing');
if(!css.includes('#game-notice span{display:block')||!css.includes('font:14px/1.4'))throw new Error('Notice body text is too small or does not have a readable line height');
if(!source.includes("function showGameNotice(name,copy='')"))throw new Error('The notice lifecycle is missing');
if(!source.includes("function message(name,copy){if(dlg.open)dlg.close();showGameNotice(name,copy)"))throw new Error('Informational messages still use the modal panel');
if(!source.includes('function base(')||!source.includes('dlg.showModal()'))throw new Error('Required puzzle and choice panels were removed');

console.log(JSON.stringify({informationalMessages:'bottom notice',blocking:false,bodyText:'14px',dismissal:'automatic',fullPanels:'puzzles and choices only'},null,2));
