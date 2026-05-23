import { $, showToast, loadSession, saveSession } from './utils.js';

const POMO_CIRCUMFERENCE = 2 * Math.PI * 90;
const DURATIONS = { 25: 25 * 60, 45: 45 * 60, 60: 60 * 60 };
const POMO_BREAK = 5 * 60;

let focusDuration = loadSession('fngan_pomo_duration', 25);
let pomoIsBreak = loadSession('fngan_pomo_is_break', false);
let pomoSessions = loadSession('fngan_pomo_sessions', 0);
let pomoEndTime = loadSession('fngan_pomo_end', null);
let pomoTime = DURATIONS[focusDuration];
let pomoTotal = pomoIsBreak ? POMO_BREAK : DURATIONS[focusDuration];
let pomoRunning = false;
let pomoInterval = null;

export function initPomodoro() {
  if (pomoEndTime && pomoEndTime > Date.now()) {
    pomoTime = Math.ceil((pomoEndTime - Date.now()) / 1000);
    pomoTotal = pomoIsBreak ? POMO_BREAK : DURATIONS[focusDuration];
    pomoRunning = true;
    pomoInterval = setInterval(tickPomo, 1000);
    $('#pomoStart').textContent = 'إيقاف';
    $('#pomoMode').textContent = pomoIsBreak ? 'استراحة' : 'تركيز';
  }

  updatePomoDisplay();
  updatePomoRing();
  renderSessionDots();

  $('#pomoStart')?.addEventListener('click', togglePomo);
  $('#pomoReset')?.addEventListener('click', resetPomo);

  $$('.pomo-duration').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (pomoRunning) return;
      $$('.pomo-duration').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      focusDuration = +btn.dataset.minutes;
      saveSession('fngan_pomo_duration', focusDuration);
      pomoTime = DURATIONS[focusDuration];
      pomoTotal = DURATIONS[focusDuration];
      updatePomoDisplay();
      updatePomoRing();
    });
    if (+btn.dataset.minutes === focusDuration) btn.classList.add('active');
  });

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function togglePomo() {
  pomoRunning = !pomoRunning;
  $('#pomoStart').textContent = pomoRunning ? 'إيقاف' : 'ابدأ';

  if (pomoRunning) {
    pomoEndTime = Date.now() + pomoTime * 1000;
    saveSession('fngan_pomo_end', pomoEndTime);
    saveSession('fngan_pomo_is_break', pomoIsBreak);
    pomoInterval = setInterval(tickPomo, 1000);
  } else {
    clearInterval(pomoInterval);
    saveSession('fngan_pomo_end', null);
  }
}

function tickPomo() {
  if (pomoTime <= 0) {
    completeSession();
    return;
  }
  pomoTime--;
  updatePomoDisplay();
  updatePomoRing();
}

function completeSession() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  saveSession('fngan_pomo_end', null);
  $('#pomoStart').textContent = 'ابدأ';

  playBell();
  notify(
    pomoIsBreak ? 'انتهت الاستراحة' : 'أحسنت! خذ استراحة',
    pomoIsBreak ? 'جلسة تركيز جديدة 📚' : '٥ دقائق راحة ☕'
  );

  if (!pomoIsBreak) {
    pomoSessions++;
    saveSession('fngan_pomo_sessions', pomoSessions);
    renderSessionDots();
    pomoIsBreak = true;
    saveSession('fngan_pomo_is_break', true);
    pomoTime = POMO_BREAK;
    pomoTotal = POMO_BREAK;
    $('#pomoMode').textContent = 'استراحة';
  } else {
    pomoIsBreak = false;
    saveSession('fngan_pomo_is_break', false);
    pomoTime = DURATIONS[focusDuration];
    pomoTotal = DURATIONS[focusDuration];
    $('#pomoMode').textContent = 'تركيز';
  }

  updatePomoDisplay();
  updatePomoRing();
}

function resetPomo() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoIsBreak = false;
  pomoTime = DURATIONS[focusDuration];
  pomoTotal = DURATIONS[focusDuration];
  saveSession('fngan_pomo_end', null);
  saveSession('fngan_pomo_is_break', false);
  $('#pomoStart').textContent = 'ابدأ';
  $('#pomoMode').textContent = 'تركيز';
  updatePomoDisplay();
  updatePomoRing();
}

function updatePomoDisplay() {
  const m = Math.floor(pomoTime / 60);
  const s = pomoTime % 60;
  $('#pomoDisplay').textContent =
    String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function updatePomoRing() {
  const progress = $('#pomoProgress');
  if (!progress) return;
  progress.style.strokeDashoffset = POMO_CIRCUMFERENCE * (1 - pomoTime / pomoTotal);
}

function renderSessionDots() {
  const container = $('#sessionDots');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < 4; i++) {
    const dot = document.createElement('span');
    dot.className = 'session-dot' + (i < pomoSessions ? ' done' : '');
    container.appendChild(dot);
  }
}

function playBell() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 528;
    gain.gain.value = 0.1;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    if (navigator.vibrate) navigator.vibrate(200);
  } catch (_) {}
}

function notify(title, body) {
  showToast(body);
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'assets/images/favicon.svg' });
  }
}

function $$(sel) {
  return document.querySelectorAll(sel);
}
