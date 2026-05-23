import { CALM_MESSAGES } from '../../config.js';
import { $, showToast } from './utils.js';

let typewriterTimer = null;

export function initCalm() {
  $('#generateCalm')?.addEventListener('click', generateMessage);
  $('#copyCalm')?.addEventListener('click', copyMessage);
  $('#shareCalm')?.addEventListener('click', shareMessage);
}

function generateMessage() {
  const el = $('#calmMessage');
  const msg = CALM_MESSAGES[Math.floor(Math.random() * CALM_MESSAGES.length)];
  el.classList.add('fade');
  clearInterval(typewriterTimer);

  setTimeout(() => {
    el.textContent = '';
    el.classList.remove('fade');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = msg;
      return;
    }
    let i = 0;
    typewriterTimer = setInterval(() => {
      el.textContent += msg[i];
      i++;
      if (i >= msg.length) clearInterval(typewriterTimer);
    }, 40);
  }, 300);
}

async function copyMessage() {
  const text = $('#calmMessage')?.textContent;
  if (!text || text.includes('اضغط')) {
    showToast('ولّد رسالة أولاً');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم نسخ الرسالة ✓');
  } catch {
    showToast('تعذّر النسخ');
  }
}

async function shareMessage() {
  const text = $('#calmMessage')?.textContent;
  if (!text || text.includes('اضغط')) {
    showToast('ولّد رسالة أولاً');
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({ title: 'فنجان هادي', text });
    } catch (_) {}
  } else {
    copyMessage();
  }
}
