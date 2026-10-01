import fs from "node:fs";
import vm from "node:vm";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const admin=fs.readFileSync(new URL("../game/05-admin.js",import.meta.url),"utf8");

for(const id of ["admin-unlock-all","admin-give-all","admin-restock","admin-location-category","admin-encounter-category","admin-status"]){
 if(!html.includes(`id="${id}"`))throw new Error(`Missing admin control: ${id}`);
 if(!id.endsWith("category")&&id!=="admin-status"&&!admin.includes(`#${id}`))throw new Error(`Admin control is not wired: ${id}`);
}
for(const contract of [
 "function adminUnlockEverything()","function adminGiveEveryItem(announce=true)","function adminRestockEverything(announce=true)",
 "function setupAdminDestinationMenus()","function populateAdminDestinationMenu(category='all')","function setupAdminEncounterMenus()",
 "function updateAdminLocationDetail()","function updateAdminMonsterDetail()","function runAdminCommand(label,action)",
 "spawnAdminMonster(id,{force:true})","badge-sunroom","destination.startsWith('cinema-')","BOSS ENCOUNTERS","BOSSES",
 "saved.fill(true)","requiredBonusPuzzles","requiredCabinSecrets","SURVIVOR_JOURNAL_ENTRIES.map(entry=>[entry.id,3])",
 "HOTEL_PLACE_DISCOVERIES.map(entry=>entry.id)","pursuerCompletedScenes=new Set([1,2,3,4,5,6])",
 "floor-two-room140","doors-style-run-escaped","hotel-molly-complete","infinite-hotel-purge-complete-v1"
])if(!admin.includes(contract))throw new Error(`Missing master unlock contract: ${contract}`);
for(const destination of ["cinema-1","cinema-2","cinema-3","cinema-4"])if(!html.includes(`value="${destination}"`))throw new Error(`Missing admin cinema destination: ${destination}`);
const bulkItems=admin.slice(admin.indexOf("function adminGiveEveryItem"),admin.indexOf("function adminUnlockEverything"));
if(bulkItems.includes("floorFive??=")||bulkItems.includes("floorTwo??="))throw new Error("Bulk inventory must not activate unrelated floor simulations");

class StorageMock{
 constructor(){this.data=new Map()}
 setItem(key,value){this.data.set(key,String(value))}
 getItem(key){return this.data.has(key)?this.data.get(key):null}
}
const element={style:{},textContent:"",setAttribute(){},classList:{add(){},remove(){}}};
const ids=["flashlight","brochure","electrical-hammer","camera-controller","drone-controller",...Array.from({length:12},(_,index)=>`curio-${index+1}`)];
const context={
 console,performance:{now:()=>0},setInterval:()=>0,clearInterval(){},setTimeout:()=>0,
 THREE:{MathUtils:{clamp:(value,min,max)=>Math.min(max,Math.max(min,value))}},
 document:{querySelector:()=>element,querySelectorAll:()=>[]},localStorage:new StorageMock(),sessionStorage:new StorageMock(),
 inventoryCatalog:Object.fromEntries(ids.map(id=>[id,{label:id,kind:"Tool"}])),INVENTORY_KIND_ORDER:["Tool"],
 usableInventory:{spentGold:0,matchesBought:0,matchesUsed:4,vitamins:0,medkits:0,bandages:0,energyDrinks:0,glowsticks:0,decoys:0,batteries:0,lockpicks:0,flashlightCharge:1,flashlightOn:false},
 adminGrantedItems:new Set(),handlePieces:new Set(),batOwned:false,cabinSecrets:new Set(),jailbreakItems:new Set(),hotelArrivalItems:new Set(),hotelRunItems:new Set(),
 floorFive:null,floorTwo:null,molly:null,saved:Array(9).fill(false),bonusSolved:new Set(),jailbreakStage:0,hotelStage:0,hotelProgress:new Set(),
 pursuerCompletedScenes:new Set(),journalDiscoveries:{},journalCurios:new Set(),journalPlaces:new Set(),lobbyBadgeNotified:new Set(),
 requiredBonusPuzzles:["one","two"],requiredCabinSecrets:["compass","map-route","logs","ash-key","batteries","lantern","escaped-window"],
 SURVIVOR_JOURNAL_ENTRIES:Array.from({length:26},(_,index)=>({id:`monster-${index}`})),
 HOTEL_PLACE_DISCOVERIES:[{id:"suite"},{id:"passage"}],LOBBY_BADGE_NOTICE_KEY:"badge-notices",
 lobbyBadgeDefinitions:()=>Array.from({length:5},(_,index)=>({id:`badge-${index}`,earned:true})),
 inLobby:false,journalPaused:false,
 saveJailbreak(){},saveHotelArrival(){},saveHotelRun(){},saveFloorFive(){},saveFloorTwo(){},saveMolly(){},
 saveUsableInventory(){context.localStorage.setItem("escape-usable-inventory",JSON.stringify(context.usableInventory))},
 saveJournalDiscoveries(){context.localStorage.setItem("journal",JSON.stringify(context.journalDiscoveries))},
 saveJournalCurios(){},saveJournalPlaces(){},updateInventory(){},updateHud(){},refreshLobbyProgressionDoors(){},updateLobbyPreview(){},renderSurvivorJournal(){},pickupTone(){},
 loadFloorFive:()=>null,newFloorFiveRun:()=>({items:new Set()}),newFloorTwoRun:()=>({})
};
vm.createContext(context);vm.runInContext(admin,context);
const result=vm.runInContext("adminUnlockEverything()",context);
if(result.stories!==9||result.journals!==26||result.badges!==5)throw new Error(`Master result mismatch: ${JSON.stringify(result)}`);
if(context.floorFive!==null||context.floorTwo!==null)throw new Error("Master unlock activated an unrelated floor controller");
if(context.jailbreakStage!==8||context.pursuerCompletedScenes.size!==6)throw new Error("Story progression did not unlock");
if(context.usableInventory.vitamins!==99||context.usableInventory.batteries!==99||context.usableInventory.adminGold!==999||context.usableInventory.flashlightCharge!==100)throw new Error("Resources were not maxed");
if(context.SURVIVOR_JOURNAL_ENTRIES.some(entry=>context.journalDiscoveries[entry.id]!==3))throw new Error("Journals were not completed");
for(const flag of ["floor-two-room140","doors-style-run-escaped","escaped"])if(!context.hotelProgress.has(flag))throw new Error(`Missing completion flag: ${flag}`);
console.log(JSON.stringify({controls:6,linkedMenus:['destination type → room/boss','encounter type → monster/boss'],forcedAdminSpawn:true,visibleCommandStatus:true,stories:result.stories,lobbyDoors:3,journals:result.journals,badges:result.badges,pursuerScenes:context.pursuerCompletedScenes.size,resources:context.usableInventory.vitamins,gold:context.usableInventory.adminGold,inactiveFloorControllersPreserved:true},null,2));
