import { CONFIG } from '../../config.js';
import { $, showToast, loadStorage, saveStorage, compressImage, trapFocus } from './utils.js';

const STORAGE_KEY = 'fngan_memories';
let releaseLightboxTrap = null;

export function initMemories() {
  const input = $('#memoryUpload');
  const zone = $('#uploadZone');

  input?.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
    e.target.value = '';
  });

  zone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone?.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone?.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  $('#lightboxClose')?.addEventListener('click', closeLightbox);
  $('#lightbox')?.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  renderMemories(getMemories());
}

async function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('يرجى رفع صورة فقط');
    return;
  }
  if (file.size > CONFIG.maxUploadSize) {
    showToast('الصورة أكبر من ٥ ميجابايت — اختر صورة أصغر');
    return;
  }

  try {
    const src = await compressImage(file);
    const memories = getMemories();
    memories.unshift({ id: Date.now(), src });
    if (memories.length > CONFIG.maxMemories) memories.pop();
    saveMemories(memories);
    renderMemories(memories);
    showToast('تمت إضافة ذكريتك 📷');
  } catch {
    showToast('تعذّر معالجة الصورة');
  }
}

function getMemories() {
  return loadStorage(STORAGE_KEY, []);
}

function saveMemories(data) {
  saveStorage(STORAGE_KEY, data);
}

function renderMemories(memories) {
  const gallery = $('#memoryGallery');
  const empty = $('#galleryEmpty');
  if (!gallery) return;

  gallery.querySelectorAll('.memory-item').forEach((el) => el.remove());

  if (memories.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  memories.forEach((m) => {
    const div = document.createElement('div');
    div.className = 'memory-item glass';
    div.innerHTML = `
      <img src="${m.src}" alt="ذكرى في فنجان هادي" loading="lazy">
      <button class="memory-remove" data-id="${m.id}" aria-label="حذف">×</button>`;
    gallery.appendChild(div);

    div.querySelector('img').addEventListener('click', () => openLightbox(m.src));
    div.querySelector('.memory-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      const updated = getMemories().filter((x) => x.id !== m.id);
      saveMemories(updated);
      renderMemories(updated);
    });
  });
}

function openLightbox(src) {
  const lb = $('#lightbox');
  const img = $('#lightboxImage');
  img.src = src;
  lb.classList.add('open');
  lb.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (releaseLightboxTrap) releaseLightboxTrap();
  releaseLightboxTrap = trapFocus(lb);
}

function closeLightbox() {
  const lb = $('#lightbox');
  lb?.classList.remove('open');
  lb?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (releaseLightboxTrap) {
    releaseLightboxTrap();
    releaseLightboxTrap = null;
  }
}
