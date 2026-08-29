const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const state = {
  clueFound: false,
  sequence: [],
  solved: localStorage.getItem("house-memory-one") === "restored",
  librarySolved: localStorage.getItem("house-memory-two") === "restored",
  portraitSolved: localStorage.getItem("house-memory-three") === "restored",
  studySolved: localStorage.getItem("house-memory-four") === "restored",
  basementSolved: localStorage.getItem("house-memory-five") === "restored",
  diaryOrder: [],
  portraitOrder: [],
  machineOrder: [],
  room: "nursery",
  sound: false,
  stability: 100,
};

const solution = [1, 3, 3, 1, 2];
const frequencies = { 1: 293.66, 2: 369.99, 3: 440, 4: 349.23 };
let audioContext;
let heartbeatTimer;
let crankTimer;
let targetBpm = 72;
let beatCount = 0;
let crankSpeed = 0;
let matchTime = 0;
let draggingCrank = false;
let lastCrankAngle = 0;
let lastCrankTime = 0;
let crankStarted = false;

function openDialog(id) {
  const dialog = $(id);
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

function toast(message) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => element.classList.remove("show"), 2600);
}

function playTone(note, duration = 0.35) {
  if (!state.sound) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequencies[note];
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.13, audioContext.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration + 0.05);
}

function heartbeatSound() {
  if (!state.sound) return;
  audioContext ||= new AudioContext();
  [0, .11].forEach((delay, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = index ? 48 : 58;
    oscillator.type = "sine";
    const start = audioContext.currentTime + delay;
    gain.gain.setValueAtTime(.0001, start);
    gain.gain.exponentialRampToValueAtTime(index ? .1 : .17, start + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, start + .13);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(start);
    oscillator.stop(start + .16);
  });
}

function scheduleHeartbeat() {
  clearTimeout(heartbeatTimer);
  if (!$("#puzzle-dialog").open || state.solved) return;
  const heart = $("#heart-pulse");
  heart.classList.add("beat");
  setTimeout(() => heart.classList.remove("beat"), 130);
  heartbeatSound();
  beatCount++;
  if (beatCount % 4 === 0) {
    const choices = [62, 72, 84, 96, 76];
    targetBpm = choices[Math.floor(Math.random() * choices.length)];
    $("#target-bpm").textContent = `${targetBpm} BPM`;
  }
  heartbeatTimer = setTimeout(scheduleHeartbeat, 60000 / targetBpm);
}

function setStability(value) {
  state.stability = Math.max(0, Math.min(100, value));
  $("#stability-fill").style.width = `${state.stability}%`;
  $("#stability-value").textContent = `${Math.round(state.stability)}%`;
  $("#stability-fill").style.background = state.stability < 35 ? "#9b443d" : "#a9905e";
  if (state.stability <= 0) {
    crankStarted = false;
    matchTime = 0;
    state.stability = 55;
    closeDialog($("#puzzle-dialog"));
    setStability(55);
    toast("Your memory fractures. You wake beside the music box again.");
    stopCrankPuzzle();
  }
}

function completeCrankPuzzle() {
  state.solved = true;
  localStorage.setItem("house-memory-one", "restored");
  stopCrankPuzzle();
  closeDialog($("#puzzle-dialog"));
  renderSolvedState();
  openDialog("#success-dialog");
}

function evaluateCrank() {
  if (!crankStarted || state.solved) return;
  crankSpeed *= .91;
  const difference = crankSpeed - targetBpm;
  $("#crank-speed").textContent = `${Math.round(crankSpeed)} RPM`;
  $("#crank-dial").setAttribute("aria-valuenow", Math.round(crankSpeed));
  if (Math.abs(difference) <= 13) {
    matchTime += .1;
    setStability(state.stability + .1);
    $("#puzzle-status").textContent = "The lullaby and heartbeat begin to align…";
    $(".room-art.nursery-art").classList.remove("dolls-closer");
  } else if (difference > 13) {
    matchTime = Math.max(0, matchTime - .18);
    $("#puzzle-status").textContent = "Too fast—the dolls twitch closer.";
    $(".room-art.nursery-art").classList.add("dolls-closer");
  } else {
    matchTime = Math.max(0, matchTime - .12);
    setStability(state.stability - .32);
    $("#puzzle-status").textContent = "Too slow—your memory is slipping.";
    $(".room-art.nursery-art").classList.remove("dolls-closer");
  }
  $("#match-fill").style.width = `${Math.min(100, matchTime / 6 * 100)}%`;
  if (matchTime >= 6) completeCrankPuzzle();
}

function startCrankPuzzle() {
  state.sound = true;
  $("#sound-toggle span").textContent = "ON";
  targetBpm = 72;
  beatCount = 0;
  $("#target-bpm").textContent = "72 BPM";
  scheduleHeartbeat();
  clearInterval(crankTimer);
  crankTimer = setInterval(evaluateCrank, 100);
}

function stopCrankPuzzle() {
  clearTimeout(heartbeatTimer);
  clearInterval(crankTimer);
  draggingCrank = false;
  $(".room-art.nursery-art").classList.remove("dolls-closer");
}

function crankAngle(event) {
  const bounds = $("#crank-dial").getBoundingClientRect();
  return Math.atan2(event.clientY - (bounds.top + bounds.height / 2), event.clientX - (bounds.left + bounds.width / 2));
}

function moveCrank(event) {
  if (!draggingCrank) return;
  const now = performance.now();
  const angle = crankAngle(event);
  let delta = angle - lastCrankAngle;
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  const elapsed = Math.max(16, now - lastCrankTime);
  if (delta > 0) {
    const instantaneousRpm = Math.min(150, delta / (Math.PI * 2) * 60000 / elapsed);
    crankSpeed = crankSpeed * .65 + instantaneousRpm * .35;
    crankStarted = true;
  }
  lastCrankAngle = angle;
  lastCrankTime = now;
  $("#crank-arm").style.transform = `rotate(${angle * 180 / Math.PI + 90}deg)`;
}

function updateProgress() {
  $$("#sequence-progress i").forEach((dot, index) => dot.classList.toggle("done", index < state.sequence.length));
}

function resetSequence(message = "The mechanism resets with a hollow click.") {
  state.sequence = [];
  updateProgress();
  const status = $("#puzzle-status");
  status.textContent = message;
  status.classList.add("wrong");
  setTimeout(() => status.classList.remove("wrong"), 900);
}

function pressNote(note, button) {
  if (state.solved) return;
  playTone(note);
  button.classList.add("played");
  setTimeout(() => button.classList.remove("played"), 180);
  state.sequence.push(note);
  updateProgress();

  const index = state.sequence.length - 1;
  if (solution[index] !== note) {
    setTimeout(() => resetSequence(), 260);
    return;
  }

  $("#puzzle-status").textContent = state.sequence.length < solution.length
    ? "Something in the room leans closer…"
    : "The lost lullaby returns.";

  if (state.sequence.length === solution.length) {
    state.solved = true;
    localStorage.setItem("house-memory-one", "restored");
    setTimeout(() => {
      closeDialog($("#puzzle-dialog"));
      renderSolvedState();
      openDialog("#success-dialog");
    }, 650);
  }
}

function renderSolvedState() {
  const restored = Number(state.solved) + Number(state.librarySolved) + Number(state.portraitSolved) + Number(state.studySolved) + Number(state.basementSolved);
  $("#memory-count").textContent = restored;
  $$(".room-nav button").forEach((button) => button.classList.add("available"));
  if (state.solved) $("#inventory-slots").innerHTML = `
    <div class="inventory-slot filled" title="Library key"><span>♢</span><small>LIBRARY KEY</small></div>
    <div class="inventory-slot filled" title="Torn photograph"><span>▧</span><small>${state.librarySolved ? "PHOTO" : "½ PHOTO"}</small></div>
    <div class="inventory-slot empty"><span>+</span><small>EMPTY</small></div>`;
  renderRoom();
}

function revealHint() {
  let hint;
  if (state.room === "portraits") hint = "Mother is far left, Father far right, and the eldest child stands beside Mother.";
  else if (state.room === "study") hint = "Move each coded letter three places backward in the alphabet.";
  else if (state.room === "basement") hint = "Use the rooms in story order: melody, diary, portrait, letter.";
  else if (state.room === "library" && state.librarySolved) hint = "The passage to the Portrait Hall is open.";
  else if (state.room === "library") hint = "Start with the only page that does not depend on another event: the storm.";
  else if (state.solved) hint = "Use the room bar above to unlock the Library with your key.";
  else if (!state.clueFound) hint = "The faded mark above the music box remembers what your hands have forgotten.";
  else hint = "Drag clockwise around the crank and keep your RPM close to the heartbeat BPM for six seconds.";
  toast(hint);
}

function renderRoom() {
  const roomView = $(".room-view");
  ["nursery", "library", "portrait", "study", "basement"].forEach((name) => roomView.classList.remove(`${name}-room`));
  roomView.classList.add(`${state.room === "portraits" ? "portrait" : state.room}-room`);
  $$(".room-nav button").forEach((button) => button.classList.toggle("active", button.dataset.room === state.room));
  const roomData = {
    portraits: ["MEMORY III", "03", "The Portrait Hall", state.portraitSolved ? "Every face has returned—but one is still watching you." : "Dozens of painted eyes follow the pieces of a photograph on the floor.", state.portraitSolved ? "Carry the restored photograph to the Study." : "Reassemble the family portrait.", "“There were always two children.”"],
    study: ["MEMORY IV", "04", "The Study", state.studySolved ? "The decoded letter lies open beneath the stopped clock." : "A coded letter waits on the desk. The clock has stopped at three.", state.studySolved ? "Take the truth to the Basement." : "Decode the unsent letter.", "“Three steps back. That was our secret.”"],
    basement: ["MEMORY V", "05", "The Basement", state.basementSolved ? "The machine is silent. Dawn reaches the bottom stair." : "The memory machine shudders beneath the house, hungry for the truth.", state.basementSolved ? "Leave the house." : "Restore the final memory sequence.", "“Put it all back in order.”"],
  };

  if (roomData[state.room]) {
    const [eyebrow, number, title, description, objective, whisper] = roomData[state.room];
    $(".room-caption .eyebrow").textContent = eyebrow;
    $(".objective-number").textContent = number;
    $("#room-title").textContent = title;
    $("#room-description").textContent = description;
    $("#objective").textContent = objective;
    $("#whisper").textContent = whisper;
    return;
  }

  const library = state.room === "library";
  $(".room-caption .eyebrow").textContent = library ? "MEMORY II" : "MEMORY I";
  $(".objective-number").textContent = library ? "02" : "01";

  if (library) {
    $("#room-title").textContent = "The Library";
    $("#room-description").textContent = state.librarySolved
      ? "The shelves stand open around a passage that was never on the plans."
      : "Every book is blank. Four loose pages wait beneath the only burning lamp.";
    $("#objective").textContent = state.librarySolved ? "The Portrait Hall lies through the shelves." : "Put the scattered diary back in order.";
    $("#whisper").textContent = state.librarySolved ? "“Two memories found. Three remain.”" : "“First the storm. Then everything changed.”";
  } else {
    $("#room-title").textContent = "The Nursery";
    $("#room-description").textContent = state.solved
      ? "The dust has settled. The room no longer feels empty—only unfinished."
      : "Dust hangs in the moonlight. Somewhere in the dark, a mechanism waits to be remembered.";
    $("#objective").textContent = state.solved ? "Use the Library key." : "Find what the room remembers.";
    $("#whisper").textContent = state.solved ? "“One memory found. Four remain.”" : "“You used to hum it when the thunder came.”";
  }
}

function enterRoom(room) {
  state.room = room;
  renderRoom();
  const names = { nursery: "Nursery", library: "Library", portraits: "Portrait Hall", study: "Study", basement: "Basement" };
  toast(`You enter the ${names[room]}.`);
}

function resetPortrait() {
  state.portraitOrder = [];
  $$("[data-person]").forEach((button) => button.classList.remove("used"));
  $$("#portrait-order i").forEach((slot, index) => { slot.textContent = index + 1; slot.classList.remove("filled"); });
  $("#portrait-status").textContent = "Place the person at the far left first.";
}

function choosePortrait(button) {
  if (state.portraitSolved) return;
  state.portraitOrder.push(button.dataset.person);
  button.classList.add("used");
  const slot = $$("#portrait-order i")[state.portraitOrder.length - 1];
  slot.textContent = button.textContent;
  slot.classList.add("filled");
  if (state.portraitOrder.length < 4) return;
  if (state.portraitOrder.join() !== "mother,sibling,you,father") {
    $("#portrait-status").textContent = "The faces fade. That arrangement is wrong.";
    return setTimeout(resetPortrait, 800);
  }
  state.portraitSolved = true;
  localStorage.setItem("house-memory-three", "restored");
  $("#portrait-status").textContent = "Your sibling’s face returns between the torn edges.";
  renderSolvedState();
  setTimeout(() => { closeDialog($("#portrait-dialog")); toast("Memory III restored. The Study door swings open."); }, 900);
}

function resetMachine() {
  state.machineOrder = [];
  $$("[data-memory]").forEach((button) => { button.disabled = false; });
  $$("#machine-progress i").forEach((dot) => dot.classList.remove("done"));
  $("#machine-status").textContent = "The first memory began with music.";
}

function chooseMemory(button) {
  if (state.basementSolved) return;
  state.machineOrder.push(button.dataset.memory);
  button.disabled = true;
  $$("#machine-progress i")[state.machineOrder.length - 1].classList.add("done");
  if (state.machineOrder.length < 4) return;
  if (state.machineOrder.join() !== "melody,diary,portrait,letter") {
    $("#machine-status").textContent = "The machine rejects the sequence.";
    return setTimeout(resetMachine, 800);
  }
  state.basementSolved = true;
  localStorage.setItem("house-memory-five", "restored");
  renderSolvedState();
  setTimeout(() => { closeDialog($("#basement-dialog")); openDialog("#ending-dialog"); }, 700);
}

function resetDiary(message = "The pages slide back across the desk.") {
  state.diaryOrder = [];
  $$("[data-page]").forEach((page) => page.classList.remove("used"));
  $$("#chosen-order i").forEach((slot, index) => { slot.textContent = index + 1; slot.classList.remove("filled"); });
  $("#library-status").textContent = message;
}

function chooseDiaryPage(button) {
  if (state.librarySolved || button.classList.contains("used")) return;
  const labels = { storm: "Storm", picnic: "Picnic", birthday: "Birthday", letter: "Letter" };
  state.diaryOrder.push(button.dataset.page);
  button.classList.add("used");
  const slot = $$("#chosen-order i")[state.diaryOrder.length - 1];
  slot.textContent = labels[button.dataset.page];
  slot.classList.add("filled");
  if (state.diaryOrder.length < 4) {
    $("#library-status").textContent = `${4 - state.diaryOrder.length} page${state.diaryOrder.length === 3 ? "" : "s"} remain.`;
    return;
  }
  if (state.diaryOrder.join(",") !== "storm,picnic,birthday,letter") {
    $("#library-status").textContent = "The dates blur. That is not how it happened.";
    setTimeout(() => resetDiary(), 850);
    return;
  }
  state.librarySolved = true;
  localStorage.setItem("house-memory-two", "restored");
  $("#library-status").textContent = "The final page settles into place.";
  setTimeout(() => {
    closeDialog($("#library-dialog"));
    renderSolvedState();
    openDialog("#library-success-dialog");
  }, 650);
}

$$('[data-close]').forEach((button) => button.addEventListener("click", () => closeDialog(button.closest("dialog"))));
$$('.story-dialog').forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog && dialog.id !== "success-dialog") closeDialog(dialog);
}));

$("#music-box").addEventListener("click", () => {
  if (state.solved) toast("The music box is quiet now. Its work is finished.");
  else {
    openDialog("#puzzle-dialog");
    startCrankPuzzle();
  }
});
$("#music-box").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") $("#music-box").click();
});

$("#star-clue").addEventListener("click", () => {
  state.clueFound = true;
  $("#objective").textContent = "Match the music-box crank to the heartbeat.";
  openDialog("#clue-dialog");
});

$("#crank-dial").addEventListener("pointerdown", (event) => {
  draggingCrank = true;
  lastCrankAngle = crankAngle(event);
  lastCrankTime = performance.now();
  $("#crank-dial").setPointerCapture(event.pointerId);
});
$("#crank-dial").addEventListener("pointermove", moveCrank);
$("#crank-dial").addEventListener("pointerup", () => { draggingCrank = false; });
$("#puzzle-dialog").addEventListener("close", stopCrankPuzzle);
document.addEventListener("pointermove", (event) => {
  $$(".doll-head").forEach((head) => {
    const bounds = head.getBoundingClientRect();
    const dx = event.clientX - (bounds.left + bounds.width / 2);
    const dy = event.clientY - (bounds.top + bounds.height / 2);
    const length = Math.max(1, Math.hypot(dx, dy));
    head.style.setProperty("--look-x", `${dx / length * 2.5}px`);
    head.style.setProperty("--look-y", `${dy / length * 2.5}px`);
  });
});
$("#hint-button").addEventListener("click", revealHint);
$$(".room-nav button").forEach((button) => button.addEventListener("click", () => enterRoom(button.dataset.room)));
$("#diary-hotspot").addEventListener("click", () => state.librarySolved ? toast("The diary is whole again. Its final page points toward the Portrait Hall.") : openDialog("#library-dialog"));
$$("[data-page]").forEach((button) => button.addEventListener("click", () => chooseDiaryPage(button)));
$("#reset-diary").addEventListener("click", () => resetDiary());
$("#photo-hotspot").addEventListener("click", () => state.portraitSolved ? toast("The restored portrait shows two children standing together.") : openDialog("#portrait-dialog"));
$$("[data-person]").forEach((button) => button.addEventListener("click", () => choosePortrait(button)));
$("#reset-portrait").addEventListener("click", resetPortrait);
$("#letter-hotspot").addEventListener("click", () => state.studySolved ? toast("The decoded word is REMEMBER.") : openDialog("#study-dialog"));
$("#cipher-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if ($("#cipher-answer").value.trim().toUpperCase() !== "REMEMBER") {
    $("#cipher-status").textContent = "The seal does not break. Try shifting every letter back three.";
    return;
  }
  state.studySolved = true;
  localStorage.setItem("house-memory-four", "restored");
  $("#cipher-status").textContent = "REMEMBER. The letter opens in your hands.";
  renderSolvedState();
  setTimeout(() => { closeDialog($("#study-dialog")); toast("Memory IV restored. Something wakes below the house."); }, 850);
});
$("#machine-hotspot").addEventListener("click", () => state.basementSolved ? openDialog("#ending-dialog") : openDialog("#basement-dialog"));
$$("[data-memory]").forEach((button) => button.addEventListener("click", () => chooseMemory(button)));
$("#reset-machine").addEventListener("click", resetMachine);
$("#ending-button").addEventListener("click", () => { closeDialog($("#ending-dialog")); toast("You escaped. The house will remember you now."); });
$("#sound-toggle").addEventListener("click", () => {
  state.sound = !state.sound;
  $("#sound-toggle span").textContent = state.sound ? "ON" : "OFF";
  if (state.sound) playTone(2, .2);
});
$("#continue-button").addEventListener("click", () => {
  closeDialog($("#success-dialog"));
  enterRoom("library");
});
$("#library-continue").addEventListener("click", () => {
  closeDialog($("#library-success-dialog"));
  enterRoom("portraits");
});
$(".brand").addEventListener("click", (event) => {
  event.preventDefault();
  if (confirm("Begin again? Progress in all five rooms will be cleared.")) {
    localStorage.removeItem("house-memory-one");
    localStorage.removeItem("house-memory-two");
    localStorage.removeItem("house-memory-three");
    localStorage.removeItem("house-memory-four");
    localStorage.removeItem("house-memory-five");
    location.reload();
  }
});

renderSolvedState();
if (!state.solved) openDialog("#story-dialog");
