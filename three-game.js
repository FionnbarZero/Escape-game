import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GAME_SCRIPTS } from './game/manifest.js';

// The legacy runtime is intentionally loaded as ordered shared scripts. This
// keeps its cross-system state stable while allowing each gameplay area to live
// in a focused source file with no build step.
globalThis.THREE = THREE;
globalThis.PointerLockControls = PointerLockControls;
globalThis.__GAME_SOURCE_FILES__ = GAME_SCRIPTS;

function loadGameScript(filename) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL(`./game/${filename}`, import.meta.url).href;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load game/${filename}`));
    document.head.append(script);
  });
}

try {
  for (const filename of GAME_SCRIPTS) {
    await loadGameScript(filename);
  }
} catch (error) {
  console.error(error);
  document.body.dataset.gameLoadError = 'true';

  const prompt = document.querySelector('#prompt');
  if (prompt) prompt.textContent = 'GAME FAILED TO LOAD · CHECK THE CONSOLE';
}
