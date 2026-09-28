import fs from 'node:fs';
import { GAME_SCRIPTS } from '../game/manifest.js';

export function readGameSource() {
  return GAME_SCRIPTS
    .map(filename => fs.readFileSync(new URL(`../game/${filename}`, import.meta.url), 'utf8'))
    .join('\n');
}
