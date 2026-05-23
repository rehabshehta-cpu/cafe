# فنجان هادي ☕

موقع تفاعلي لكافيه هادئ — تجربة digital escape للمذاكرة، العمل، والاسترخاء.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## المميزات

- **Hero تفاعلي** — فنجان SVG مع بخار متحرك وpreloader
- **نظام المزاج** — ٤ أوضاع (مذاكرة، مطر، تركيز، استرخاء) مع أصوات ambient
- **منيو ذكي** — بحث، tags، modal مع كمية وحجم
- **طلب WhatsApp** — سلة محفوظة + إرسال الطلب بضغطة
- **حائط الذكريات** — رفع صور مضغوطة + lightbox
- **مولّد الهدوء** — رسائل عربية + نسخ ومشاركة
- **Pomodoro** — ٢٥/٤٥/٦٠ دقيقة + إشعارات
- **Accessibility** — skip link، focus trap، aria-live
- **SEO** — Open Graph، Schema.org، sitemap

## Tech Stack

- HTML5 + CSS3 (Glassmorphism)
- Vanilla JavaScript (ES Modules)
- Web APIs: Audio، Notifications، Clipboard، Canvas

## التشغيل المحلي

> **لا تفتح `index.html` بالدبل كليك** — المتصفح يمنع ES Modules عبر `file://` (خطأ CORS).

### الطريقة الأسهل

**دبل كليك على `start.bat`** — هيفتح السيرفر والموقع تلقائياً.

### يدوياً

```bash
# Python
python -m http.server 8080

# Node.js
npx serve -l 8080 .
```

ثم افتح: `http://localhost:8080`

## هيكل المشروع

```
cafe/
├── index.html
├── config.js              # إعدادات الكافيه
├── assets/
│   ├── css/               # base, components, sections, responsive
│   ├── js/                # modules (main, menu, mood, order…)
│   ├── data/menu.json     # بيانات المنيو
│   └── images/            # logo, favicon, og-cover
├── manifest.json          # PWA basics
├── 404.html
└── README.md
```

## التخصيص

عدّل [`config.js`](config.js) لتغيير:
- رقم الهاتف وواتساب
- روابط السوشيال
- ساعات العمل
- روابط الأصوات ambient

عدّل [`assets/data/menu.json`](assets/data/menu.json) لتحديث المنيو.

## النشر

### GitHub Pages

1. ارفع الم repo على GitHub
2. Settings → Pages → Source: main branch
3. حدّث `sitemap.xml` و `robots.txt` برابطك

### Netlify

```bash
npx netlify deploy --prod --dir=.
```

## Live Demo

> أضف رابط الـ demo بعد النشر

---

Built with calm ☕ — Portfolio project 2026
