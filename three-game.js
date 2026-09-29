import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GAME_SCRIPTS } from './game/manifest.js';

// The legacy runtime is intentionally loaded as ordered shared scripts. This
// keeps its cross-system state stable while allowing each gameplay area to live
// in a focused source file with no build step.
globalThis.THREE = THREE;
globalThis.PointerLockControls = PointerLockControls;
globalThis.__GAME_SOURCE_FILES__ = GAME_SCRIPTS;
document.body.dataset.gameReady = 'loading';

function queueGameScript(filename) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(`./game/${filename}`, import.meta.url).href;
    // Dynamically inserted classic scripts with async=false execute in insertion
    // order, while the browser is still free to download all of them in parallel.
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load game/${filename}`));
    document.head.append(script);
  });
}

try {
  // These are shared classic scripts: later files intentionally reference
  // bindings created by earlier ones. Await each load so execution follows the
  // manifest on every browser, including cold-cache playtests.
  for (const filename of GAME_SCRIPTS) await queueGameScript(filename);
  document.body.dataset.gameReady = 'true';
  globalThis.dispatchEvent(new CustomEvent('hotel-game-ready'));
} catch (error) {
  console.error(error);
  document.body.dataset.gameReady = 'error';
  document.body.dataset.gameLoadError = 'true';

  const prompt = document.querySelector('#prompt');
  if (prompt) prompt.textContent = `GAME FAILED TO LOAD · ${error.message.toUpperCase()}`;
  const lobbyNotice = document.querySelector('#lobby-notice');
  if (lobbyNotice) lobbyNotice.textContent = 'LOAD FAILED · REFRESH TO RETRY';
}
