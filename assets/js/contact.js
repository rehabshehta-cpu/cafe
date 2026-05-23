import { CONFIG, TESTIMONIALS } from '../../config.js';
import { $ } from './utils.js';

export function initContact() {
  $('#contactAddress').textContent = CONFIG.address;
  $('#contactPhone').textContent = CONFIG.phone;
  $('#contactEmail').textContent = CONFIG.email;
  $('#contactHours').textContent = `${CONFIG.hours.days} ${CONFIG.hours.open} – ${CONFIG.hours.close}`;

  updateOpenStatus();

  const socialGrid = $('#socialGrid');
  if (socialGrid) {
    socialGrid.innerHTML = `
      <a href="${CONFIG.social.whatsapp}" class="social-btn" target="_blank" rel="noopener">واتساب</a>
      <a href="${CONFIG.social.snapchat}" class="social-btn" target="_blank" rel="noopener">سناب شات</a>
      <a href="${CONFIG.social.facebook}" class="social-btn" target="_blank" rel="noopener">فيس بوك</a>`;
  }

  const mapFrame = $('#mapFrame');
  if (mapFrame) mapFrame.src = CONFIG.mapEmbed;

  renderTestimonials();
}

function updateOpenStatus() {
  const badge = $('#openStatus');
  if (!badge) return;

  const now = new Date();
  const [openH, openM] = CONFIG.hours.open.split(':').map(Number);
  const [closeH, closeM] = CONFIG.hours.close.split(':').map(Number);
  const openMin = openH * 60 + openM;
  const closeMin = closeH * 60 + closeM;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isOpen = nowMin >= openMin && nowMin < closeMin;

  badge.textContent = isOpen ? 'مفتوح الآن' : 'مغلق';
  badge.className = 'open-status ' + (isOpen ? 'open' : 'closed');
}

function renderTestimonials() {
  const track = $('#testimonialsTrack');
  if (!track) return;

  track.innerHTML = TESTIMONIALS.map(
    (t) => `
    <blockquote class="testimonial-card glass">
      <p>«${t.text}»</p>
      <cite>— ${t.name}</cite>
    </blockquote>`
  ).join('');
}

export function initGallery() {
  const images = [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
    'https://images.unsplash.com/photo-1453614512568-c40298d47945?w=400&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80'
  ];

  const grid = $('#cafeGallery');
  if (!grid) return;

  grid.innerHTML = images
    .map(
      (src, i) => `
      <div class="gallery-photo glass">
        <img src="${src}" alt="صورة من داخل ${CONFIG.cafeName}" loading="lazy" decoding="async" width="280" height="200">
      </div>`
    )
    .join('');
}
