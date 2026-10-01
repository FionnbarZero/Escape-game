import fs from 'node:fs';
import { readGameSource } from './source-bundle.mjs';

const source=readGameSource();
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const contracts={
 sharedStackCounts:source.includes('const INVENTORY_STACK_FIELDS=')&&source.includes('function consumeInventoryStack(id,amount=1)'),
 usedItemsDisappear:source.includes("consumeInventoryStack('energy-drink')")&&source.includes("consumeInventoryStack('glowstick')")&&source.includes("consumeInventoryStack('bandage')")&&source.includes("consumeInventoryStack('medkit')"),
 batteryConsumed:source.includes("consumeInventoryStack('flashlight-battery')"),
 flashlightPowered:source.includes("selectedInventoryId='flashlight'")&&source.includes('usableInventory.flashlightOn=true')&&source.includes('FLASHLIGHT ON · 100%'),
 sortedInventory:source.includes('function sortInventoryEntries(entries)')&&source.includes('return sortInventoryEntries([...entries.values()])'),
 safeDropping:source.includes('const DROPPABLE_INVENTORY_ITEMS=')&&source.includes('function dropSelectedInventoryItem()')&&source.includes('STORY ITEMS STAY SAFE'),
 physicalPickup:source.includes("'dropped-inventory'")&&source.includes('function collectDroppedInventoryItem(hit)'),
 dropInput:source.includes("e.code==='KeyX'&&!e.repeat&&!dropCollectorPossession())dropSelectedInventoryItem()"),
 categorizedAdminMenu:html.includes('id="admin-item-category"')&&source.includes('function populateAdminItemMenu(category=')&&source.includes("document.createElement('optgroup')"),
 sortedAdminMenu:source.includes('function sortedAdminCatalogEntries()')&&source.includes('a.label.localeCompare(b.label'),
 collectorDropPreserved:source.includes("if(!collector?.carrying)return false")&&source.includes("THE POCKET WATCH CANNOT BE DROPPED")
};
if(Object.values(contracts).some(value=>!value))throw new Error(`Inventory system contract failed: ${JSON.stringify(contracts)}`);
console.log(JSON.stringify(contracts,null,2));
