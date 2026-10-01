import { readGameSource } from './source-bundle.mjs';

const source=readGameSource();
const contracts=[
 "function queueProgressNotice(name,copy)",
 "JOURNAL ENTRY DISCOVERED",
 "JOURNAL SURVIVAL NOTES ADDED",
 "JOURNAL ENTRY COMPLETE",
 "JOURNAL LOCATION DISCOVERED",
 "JOURNAL KEEPSAKE RECORDED",
 "const LOBBY_BADGE_NOTICE_KEY='hotel-badge-notifications-v1'",
 "function syncLobbyBadgeNotifications()",
 "BADGE EARNED · ${done} / ${badges.length}",
 "ALL FIVE BADGES COMPLETE",
 "hotelArrivalItems.has('room304-key-used')"
];
for(const contract of contracts)if(!source.includes(contract))throw new Error(`Missing progression notification contract: ${contract}`);
if(!source.includes("showGameNotice(notice.name,notice.copy)"))throw new Error('Progress notifications do not use the non-blocking accessible notice');
if(!source.includes('localStorage.setItem(LOBBY_BADGE_NOTICE_KEY'))throw new Error('Badge notifications can repeat after reload');
console.log(JSON.stringify({notifications:['badge earned','all five badges','journal discovered','survival notes','complete journal','place discovered','keepsake recorded'],presentation:'non-blocking aria-live notice',duplicates:'prevented persistently'},null,2));
