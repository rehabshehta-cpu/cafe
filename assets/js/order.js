import { CONFIG } from '../../config.js';
import { $, showToast, loadStorage, saveStorage, trapFocus } from './utils.js';

let order = loadStorage('fngan_order', []);
let releaseOrderTrap = null;

export function initOrder() {
  updateOrderUI();

  $('#orderFab')?.addEventListener('click', openOrderPanel);
  $('#orderClose')?.addEventListener('click', closeOrderPanel);
  $('#orderBackdrop')?.addEventListener('click', closeOrderPanel);
  $('#orderConfirm')?.addEventListener('click', confirmOrder);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOrderPanel();
  });
}

export function addToOrder(item) {
  const key = `${item.id}-${item.size || 'regular'}`;
  const existing = order.find((o) => o.key === key);
  if (existing) {
    existing.qty += item.qty || 1;
  } else {
    order.push({
      key,
      id: item.id,
      name: item.name,
      price: item.price,
      size: item.size || 'regular',
      qty: item.qty || 1
    });
  }
  saveStorage('fngan_order', order);
  updateOrderUI();
  showToast(`تمت إضافة ${item.name} ☕`);

  const fab = $('#orderFab');
  fab?.classList.add('bounce');
  setTimeout(() => fab?.classList.remove('bounce'), 400);
}

function removeFromOrder(key) {
  order = order.filter((o) => o.key !== key);
  saveStorage('fngan_order', order);
  updateOrderUI();
}

function updateOrderUI() {
  const count = order.reduce((s, o) => s + o.qty, 0);
  const total = order.reduce((s, o) => s + o.price * o.qty, 0);

  $('#orderCount').textContent = count;
  $('#orderTotal').textContent = total + ' جنيه';

  const list = $('#orderList');
  if (!list) return;

  if (order.length === 0) {
    list.innerHTML = '<li class="order-empty">طلبك فارغ — اختر من المنيو</li>';
    return;
  }

  const sizeLabel = { regular: '', small: ' (صغير)', large: ' (كبير)' };

  list.innerHTML = order
    .map(
      (o) => `
      <li>
        <span>${o.name}${sizeLabel[o.size] || ''} × ${o.qty}</span>
        <span>
          ${o.price * o.qty} ج
          <button class="remove-item" data-key="${o.key}" aria-label="حذف">×</button>
        </span>
      </li>`
    )
    .join('');

  list.querySelectorAll('.remove-item').forEach((btn) => {
    btn.addEventListener('click', () => removeFromOrder(btn.dataset.key));
  });
}

function buildWhatsAppMessage() {
  const lines = order.map(
    (o) => `- ${o.name}${o.size === 'large' ? ' (كبير)' : o.size === 'small' ? ' (صغير)' : ''} × ${o.qty} — ${o.price * o.qty} جنيه`
  );
  const total = order.reduce((s, o) => s + o.price * o.qty, 0);
  return encodeURIComponent(
    `طلب من ${CONFIG.cafeName}:\n\n${lines.join('\n')}\n\nالإجمالي: ${total} جنيه\n\nشكراً ☕`
  );
}

function confirmOrder() {
  if (order.length === 0) return;
  const url = `https://wa.me/${CONFIG.whatsapp}?text=${buildWhatsAppMessage()}`;
  window.open(url, '_blank');
  showToast('جاري إرسال طلبك عبر واتساب ☕');
  order = [];
  saveStorage('fngan_order', order);
  updateOrderUI();
  closeOrderPanel();
}

function openOrderPanel() {
  $('#orderPanel')?.classList.add('open');
  $('#orderBackdrop')?.classList.add('open');
  $('#orderPanel')?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const panel = $('#orderPanel');
  if (releaseOrderTrap) releaseOrderTrap();
  releaseOrderTrap = trapFocus(panel);
}

function closeOrderPanel() {
  $('#orderPanel')?.classList.remove('open');
  $('#orderBackdrop')?.classList.remove('open');
  $('#orderPanel')?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (releaseOrderTrap) {
    releaseOrderTrap();
    releaseOrderTrap = null;
  }
}

export { order, updateOrderUI };
