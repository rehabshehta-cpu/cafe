import { CONFIG, MOODS } from '../../config.js';
import { $, $$, showToast, loadSession, saveSession } from './utils.js';

let currentMood = loadSession('fngan_mood', 'default');
let musicPlaying = loadSession('fngan_music', false);
let volume = loadSession('fngan_volume', 0.5);
let audio = null;
let fadeTimer = null;
let webAudioFallback = null;

const TAG_LABELS = { strong: 'قوي', sweet: 'حلو', vegan: 'نباتي' };

export function initMood() {
  document.body.dataset.mood = currentMood === 'default' ? 'default' : currentMood;
  applyMoodUI(currentMood, false);

  $$('.mood-card').forEach((card) => {
    card.addEventListener('click', () => setMood(card.dataset.mood));
  });

  $('#resetMood')?.addEventListener('click', () => setMood('default'));
  $('#musicToggle')?.addEventListener('click', toggleMusic);

  const volSlider = $('#volumeSlider');
  if (volSlider) {
    volSlider.value = volume * 100;
    volSlider.addEventListener('input', (e) => {
      volume = e.target.value / 100;
      saveSession('fngan_volume', volume);
      if (audio) audio.volume = volume;
      if (webAudioFallback?.master) webAudioFallback.master.gain.value = volume * 0.15;
    });
  }

  if (musicPlaying) {
    $('#musicToggle')?.classList.add('active');
    $('#musicToggle')?.setAttribute('aria-pressed', 'true');
    const mood = currentMood === 'default' ? 'relax' : currentMood;
    startAmbient(mood);
  }
}

function setMood(mood) {
  currentMood = mood;
  document.body.dataset.mood = mood;
  saveSession('fngan_mood', mood);
  applyMoodUI(mood, true);
  if (musicPlaying) startAmbient(mood === 'default' ? 'relax' : mood);
}

function applyMoodUI(mood, animate) {
  $$('.mood-card').forEach((c) => {
    const active = c.dataset.mood === mood;
    c.classList.toggle('active', active);
    c.setAttribute('aria-pressed', active);
  });

  const quote = $('#moodQuote');
  const activeBar = $('#moodActive');

  if (mood === 'default') {
    activeBar.hidden = true;
    if (quote) quote.textContent = '«الهدوء يبدأ من فنجان واحد»';
  } else {
    activeBar.hidden = false;
    $('#moodActiveName').textContent = MOODS[mood].name;
    if (quote) {
      if (animate) quote.classList.add('quote-change');
      quote.textContent = MOODS[mood].quote;
      if (animate) setTimeout(() => quote.classList.remove('quote-change'), 500);
    }
  }
}

function toggleMusic() {
  musicPlaying = !musicPlaying;
  saveSession('fngan_music', musicPlaying);
  const btn = $('#musicToggle');
  btn.classList.toggle('active', musicPlaying);
  btn.setAttribute('aria-pressed', musicPlaying);

  if (musicPlaying) {
    const mood = currentMood === 'default' ? 'relax' : currentMood;
    startAmbient(mood);
    showToast('تم تشغيل الصوت الهادئ');
  } else {
    stopAmbient();
  }
}

function stopAmbient() {
  clearInterval(fadeTimer);
  if (audio) {
    fadeOut(audio, () => {
      audio.pause();
      audio = null;
    });
  }
  if (webAudioFallback) {
    webAudioFallback.nodes.forEach((n) => {
      try { n.stop?.(); n.disconnect?.(); } catch (_) {}
    });
    webAudioFallback = null;
  }
}

function fadeOut(el, cb) {
  const step = el.volume / 20;
  fadeTimer = setInterval(() => {
    if (el.volume > step) el.volume -= step;
    else {
      clearInterval(fadeTimer);
      cb();
    }
  }, 50);
}

function startAmbient(mood) {
  stopAmbient();
  const url = CONFIG.audio[mood];
  if (!url) return;

  audio = new Audio(url);
  audio.loop = true;
  audio.volume = 0;
  audio.play().then(() => {
    fadeIn(audio, volume);
  }).catch(() => {
    audio = null;
    startWebAudioFallback(mood);
  });

  audio.addEventListener('error', () => {
    if (audio) {
      audio = null;
      startWebAudioFallback(mood);
    }
  });
}

function fadeIn(el, target) {
  el.volume = 0;
  fadeTimer = setInterval(() => {
    if (el.volume < target - 0.02) el.volume += 0.02;
    else {
      el.volume = target;
      clearInterval(fadeTimer);
    }
  }, 50);
}

function startWebAudioFallback(mood) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const master = ctx.createGain();
  master.gain.value = volume * 0.15;
  master.connect(ctx.destination);
  const nodes = [master];

  if (mood === 'rain') {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    noise.connect(filter);
    filter.connect(master);
    noise.start();
    nodes.push(noise, filter);
  } else {
    const osc = ctx.createOscillator();
    osc.type = mood === 'focus' ? 'sine' : 'triangle';
    osc.frequency.value = mood === 'focus' ? 174 : 130;
    osc.connect(master);
    osc.start();
    nodes.push(osc);
  }

  webAudioFallback = { master, nodes };
}

export { TAG_LABELS };
