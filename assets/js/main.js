import { initNav, initGlobalEffects } from './nav.js';
import { initMood } from './mood.js';
import { initMenu } from './menu.js';
import { initOrder } from './order.js';
import { initMemories } from './memories.js';
import { initCalm } from './calm.js';
import { initPomodoro } from './pomodoro.js';
import { initContact, initGallery } from './contact.js';

async function init() {
  initGlobalEffects();
  initNav();
  initMood();
  initOrder();
  await initMenu();
  initMemories();
  initCalm();
  initPomodoro();
  initContact();
  initGallery();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
