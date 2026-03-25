/**
 * VELOCE Car Rental — app.js
 * Shared utility functions used across all pages.
 */

/* ── DOM helpers ── */
const $ = id => document.getElementById(id);
const html = (id, h) => { const el = $(id); if (el) el.innerHTML = h; };

/* ── Format helpers ── */
function fmtDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtMoney(n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0 });
}
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function daysBetween(a, b) {
  const diff = new Date(b) - new Date(a);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/* ── Toast ── */
function showToast(msg, type = '') {
  const icons = { ok: '✓', err: '✕', warn: '⚠' };
  const t = $('toast');
  if (!t) return;
  t.innerHTML = `<span style="font-weight:700;font-size:16px;">${icons[type] || 'ℹ'}</span>${msg}`;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3800);
}

/* ── Modal ── */
function openModal(id) { const el = $(id); if (el) el.classList.add('open'); }
function closeModal(id) { const el = $(id); if (el) el.classList.remove('open'); }

// Close on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* ── Image as base64 ── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ── Expose ── */
window.$ = $;
window.html = html;
window.fmtDate = fmtDate;
window.fmtDateTime = fmtDateTime;
window.fmtMoney = fmtMoney;
window.esc = esc;
window.daysBetween = daysBetween;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.fileToBase64 = fileToBase64;