import { CONFIG } from '../../config.js';
import { $, $$, showToast } from './utils.js';
import { TAG_LABELS } from './mood.js';
import { addToOrder } from './order.js';
import { trapFocus } from './utils.js';

let menuData = null;
let currentCategory = 'hot';
let searchQuery = '';
let selectedItem = null;
let releaseModalTrap = null;

export async function initMenu() {
  const grid = $('#menuGrid');
  if (!grid) return;

  grid.innerHTML = '<div class="menu-skeleton"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>';

  try {
    const res = await fetch('assets/data/menu.json');
    if (!res.ok) throw new Error('fetch failed');
    menuData = await res.json();
    renderMenu(currentCategory);
  } catch {
    grid.innerHTML = '<p class="menu-error">تعذّر تحميل المنيو — حاول تحديث الصفحة</p>';
    return;
  }

  $$('.menu-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.menu-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.category;
      renderMenu(currentCategory);
    });
  });

  $('#menuSearch')?.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderMenu(currentCategory);
  });

  setupModal();
}

function getFilteredItems(category) {
  if (!menuData) return [];
  return menuData[category].filter((item) => {
    if (!searchQuery) return true;
    return (
      item.name.toLowerCase().includes(searchQuery) ||
      item.desc.toLowerCase().includes(searchQuery) ||
      item.tags?.some((t) => t.includes(searchQuery) || TAG_LABELS[t]?.includes(searchQuery))
    );
  });
}

function renderMenu(category) {
  const grid = $('#menuGrid');
  if (!grid || !menuData) return;

  const items = getFilteredItems(category);

  if (items.length === 0) {
    grid.innerHTML = '<p class="menu-empty">لا توجد نتائج — جرّب كلمة أخرى</p>';
    return;
  }

  grid.innerHTML = items
    .map(
      (item, i) => `
      <article class="menu-item glass reveal visible" data-id="${item.id}" data-category="${category}"
        tabindex="0" role="button" aria-label="${item.name}" style="animation-delay:${i * 0.05}s">
        <div class="menu-item-image">
          <img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" width="260" height="200"
            onerror="this.src='${CONFIG.fallbackImage}'">
          <div class="menu-item-overlay"><span>اضغط للتفاصيل</span></div>
        </div>
        <div class="menu-item-body">
          <div class="menu-tags">${(item.tags || []).map((t) => `<span class="tag">${TAG_LABELS[t] || t}</span>`).join('')}</div>
          <h3>${item.name}</h3>
          <p>${item.desc.slice(0, 55)}…</p>
          <span class="menu-item-price">${item.price} جنيه</span>
        </div>
      </article>`
    )
    .join('');

  grid.querySelectorAll('.menu-item').forEach((card) => {
    const open = () => {
      const item = menuData[card.dataset.category].find((m) => m.id === card.dataset.id);
      if (item) openModal(item);
    };
    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });
}

function setupModal() {
  $('#modalClose')?.addEventListener('click', closeModal);
  $('#itemModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'itemModal') closeModal();
  });

  $('#qtyMinus')?.addEventListener('click', () => {
    const input = $('#modalQty');
    if (+input.value > 1) input.value = +input.value - 1;
  });
  $('#qtyPlus')?.addEventListener('click', () => {
    const input = $('#modalQty');
    if (+input.value < 10) input.value = +input.value + 1;
  });

  $('#modalAdd')?.addEventListener('click', () => {
    if (!selectedItem) return;
    const qty = +($('#modalQty')?.value || 1);
    const size = $('input[name="size"]:checked')?.value || 'regular';
    const priceMod = size === 'large' ? 10 : 0;
    addToOrder({ ...selectedItem, price: selectedItem.price + priceMod, size, qty });
    closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

function openModal(item) {
  selectedItem = item;
  const img = $('#modalImage');
  img.src = item.image;
  img.alt = item.name;
  img.onerror = () => { img.src = CONFIG.fallbackImage; };

  $('#modalTitle').textContent = item.name;
  $('#modalDesc').textContent = item.desc;
  $('#modalPrice').textContent = item.price + ' جنيه';
  $('#modalQty').value = 1;

  const tagsEl = $('#modalTags');
  if (tagsEl) {
    tagsEl.innerHTML = (item.tags || [])
      .map((t) => `<span class="tag">${TAG_LABELS[t] || t}</span>`)
      .join('');
  }

  const modal = $('#itemModal');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const dialog = modal.querySelector('.modal');
  if (releaseModalTrap) releaseModalTrap();
  releaseModalTrap = trapFocus(dialog);
}

function closeModal() {
  const modal = $('#itemModal');
  modal?.classList.remove('open');
  modal?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  selectedItem = null;
  if (releaseModalTrap) {
    releaseModalTrap();
    releaseModalTrap = null;
  }
}

export function getMenuData() {
  return menuData;
}
