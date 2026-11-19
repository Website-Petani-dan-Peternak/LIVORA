/* ===== LIVORA - script.js (v2) ===== */
const IMG_DIR = 'images/';
const IMG_EXT = '.png';           // ganti ke '.jpg' / '.webp' bila perlu
const imgUrl = n => IMG_DIR + n + IMG_EXT;

/* Elemen dengan atribut data-pc memakai varian laptop: gambar_13_pc, gambar_14_pc, dst.
   Jika file _pc tidak ada, otomatis memakai gambar versi HP. */
const DESK = window.matchMedia('(min-width:900px)');
function setBg(el, names) {
  const t = new Image();
  t.onload = () => { if (el.dataset.custom) return; el.style.backgroundImage = `url(${imgUrl(names[0])})`; if (el.classList.contains('avatar') || el.classList.contains('ph') || el.classList.contains('ic')) el.style.fontSize = '0'; };
  t.onerror = () => { if (names.length > 1) setBg(el, names.slice(1)); };
  t.src = imgUrl(names[0]);
}
function applyBgs(root = document) {
  root.querySelectorAll('[data-bg]').forEach(el => {
    const n = el.dataset.bg;
    setBg(el, el.hasAttribute('data-pc') ? (DESK.matches ? [n + '_pc', n] : [n, n + '_pc']) : [n]);
  });
}
function applyImages(root = document) {
  root.querySelectorAll('[data-src]').forEach(img => {
    img.onerror = () => { const s = document.createElement('span'); s.className = 'logo-fallback'; s.textContent = 'LIVORA'; img.replaceWith(s); };
    img.src = imgUrl(img.dataset.src);
  });
  applyBgs(root);
}
(DESK.addEventListener ? DESK.addEventListener.bind(DESK, 'change') : DESK.addListener.bind(DESK))(() => applyBgs());

/* ---------- UTIL ---------- */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const rp = n => 'Rp' + Math.round(n).toLocaleString('id-ID');
const nf = n => Math.round(n).toLocaleString('id-ID');
const d1 = (n, d = 1) => n.toFixed(d).replace('.', ',');
const pn = s => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const chg = c => (c >= 0 ? '▲ +' : '▼ ') + String(c).replace('.', ',') + '%';
const fmtDate = d => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const hhmm = d => d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
const mmss = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
const rows = a => `<table class="ct">${a.map(r => `<tr class="${r[2] || ''}"><td>${r[0]}</td><td><b>${r[1]}</b></td></tr>`).join('')}</table>`;
function fillSel(el, keys, cur) { el.innerHTML = keys.map(k => `<option${k === cur ? ' selected' : ''}>${k}</option>`).join(''); }

/* ---------- DATA KOMODITAS ---------- */
// nama, ikon, hasil ton/ha, hari panen, harga/kg, perubahan %, biaya produksi per ha (juta Rp)
const TANI = Object.fromEntries([
  ['Padi', '🌾', 5.2, 120, 6750, 2.5, 12], ['Jagung', '🌽', 6, 100, 5400, -0.8, 10], ['Kedelai', '🫘', 1.6, 85, 10500, 1.1, 8],
  ['Cabai Merah', '🌶', 8, 110, 28500, 6.3, 55], ['Cabai Rawit', '🌶', 6, 100, 42000, 4.1, 45], ['Bawang Merah', '🧅', 10, 65, 34000, 3.2, 70],
  ['Bawang Putih', '🧄', 8, 110, 38000, 1.4, 60], ['Tomat', '🍅', 25, 90, 9500, -2.1, 40], ['Kentang', '🥔', 20, 100, 14500, 0.9, 55],
  ['Wortel', '🥕', 18, 90, 11000, -1.2, 28], ['Kubis', '🥬', 25, 80, 6500, -0.5, 25], ['Sawi', '🥬', 12, 35, 8000, 0.7, 12],
  ['Terong', '🍆', 20, 90, 10000, -0.9, 30], ['Timun', '🥒', 22, 55, 7500, 0.3, 25], ['Singkong', '🍠', 25, 240, 3200, 0.4, 12],
  ['Ubi Jalar', '🍠', 18, 120, 6000, 1.0, 14], ['Kacang Tanah', '🥜', 2.2, 100, 18000, 1.6, 10], ['Semangka', '🍉', 25, 75, 6000, -1.4, 22],
  ['Pisang', '🍌', 20, 300, 9000, 1.8, 30], ['Mangga', '🥭', 12, 150, 16000, 2.2, 35], ['Jeruk', '🍊', 18, 270, 15000, 1.5, 40],
  ['Kopi', '☕', 1, 300, 62000, 3.7, 25], ['Kakao', '🍫', 0.9, 240, 78000, 2.9, 22]
].map(a => [a[0], { i: a[1], y: a[2], d: a[3], p: a[4], c: a[5], b: a[6] * 1e6 }]));
// nama, ikon, harga/kg, perubahan, satuan, berat/satuan kg, target agregasi, [adg kg/hari, bobot jual, bobot awal, pakan Rp/hari, mortalitas %]
const TN = Object.fromEntries([
  ['Sapi', '🐄', 60000, 2.5, 'ekor', 450, 50, [0.8, 550, 300, 28000, 1]], ['Kambing', '🐐', 85000, 1.2, 'ekor', 30, 80, [0.12, 35, 15, 7000, 2]],
  ['Domba', '🐑', 70000, 0.8, 'ekor', 32, 60, [0.1, 38, 14, 6500, 2]], ['Kerbau', '🐃', 55000, 1.0, 'ekor', 480, 30, [0.7, 520, 350, 30000, 1]],
  ['Ayam Pedaging', '🐓', 22000, -0.6, 'ekor', 1.8, 2000, [0.055, 2, 0.04, 1800, 5]], ['Bebek', '🦆', 30000, 0.5, 'ekor', 2, 1500, [0.035, 2.2, 0.05, 1400, 4]],
  ['Babi', '🐖', 38000, 0.9, 'ekor', 95, 40, [0.65, 100, 20, 20000, 3]], ['Kelinci', '🐇', 55000, 0.4, 'ekor', 2.5, 300, [0.025, 2.8, 0.8, 1200, 5]],
  ['Ikan Lele', '🐟', 25000, 1.1, 'ekor', 0.2, 5000, [0.0035, 0.25, 0.01, 220, 8]], ['Ikan Nila', '🐠', 30000, 0.7, 'ekor', 0.4, 4000, [0.004, 0.5, 0.02, 300, 8]],
  ['Telur Ayam', '🥚', 28500, 1.9, 'butir', 0.06, 10000, null], ['Telur Bebek', '🥚', 32000, 1.2, 'butir', 0.07, 5000, null], ['Susu Sapi', '🥛', 9000, 0.6, 'liter', 1, 2000, null]
].map(a => [a[0], { i: a[1], p: a[2], c: a[3], u: a[4], w: a[5], tg: a[6], fc: a[7] }]));

/* ---------- STATE (tersimpan di browser) ---------- */
const DEF = () => ({
  prof: { nama: 'Budi Setiawan', hp: '0812-3456-7890', email: 'budi.setiawan@email.com', kota: 'Gowa, Sulawesi Selatan', alamat: 'Jl. Poros Malino No. 12' },
  biz: { kel: 'Kelompok Tani Harapan', jenis: 'tani', kom: 'Cabai Merah', kap: 3000, a: 'Apr', b: 'Jun' },
  notif: { harga: true, minta: true, kirim: true },
  sec: { twofa: false, alert: true, bio: false },
  set: { lang: 'id', size: 1, anim: true, hemat: false },
  dash: { kom: 'Gabah Kering Panen' }
});
let ST = DEF(), PW = '', AVATAR = '';
try { const s = JSON.parse(localStorage.getItem('livora') || 'null'); if (s) for (const k in ST) ST[k] = { ...ST[k], ...(s[k] || {}) }; } catch (e) { }
const save = () => { try { localStorage.setItem('livora', JSON.stringify(ST)); } catch (e) { } };

/* ---------- NAVIGASI ---------- */
const NO_BAR = ['splash', 'login', 'dash'];
const NAV = ['dash', 'profile', 'logistik', 'price-tani', 'price-ternak'];
const NO_BG10 = ['splash', 'login', 'dash', 'profile', 'chat'];
let stack = [], cur = null, flow = 'match', ctype = 'tani';
const HOOK = { 'match-form': () => renderMatch(), profile: () => renderProfile(), 'ag-tani': () => renderAgg(), logistik: () => initLogistik() };

function go(id, reset = false, replace = false) {
  if (reset) stack = [];
  else if (cur && !replace && cur !== id) stack.push(cur);
  cur = id;
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  $('#topbar').classList.toggle('hidden', NO_BAR.includes(id));
  $('#bnav').classList.toggle('hidden', !NAV.includes(id));
  $$('#bnav button').forEach(b => b.classList.toggle('on', b.dataset.n === id));
  const app = $('#app');
  if (!NO_BG10.includes(id) && !ST.set.hemat) { const t = new Image(); t.onload = () => { if (cur === id) { app.classList.add('has-bg'); app.style.backgroundImage = `url(${imgUrl('gambar_10')})`; } }; t.src = imgUrl('gambar_10'); }
  else { app.classList.remove('has-bg'); app.style.backgroundImage = ''; }
  if (id !== 'logistik') TR.play = false;
  HOOK[id] && HOOK[id]();
  if (id === 'dash') playDash();
  applyLang();
  window.scrollTo(0, 0);
}
function goBack() { stopTimers(); go(stack.length ? stack.pop() : 'dash', false, true); }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2400); }
let timers = [];
function stopTimers() { timers.forEach(clearInterval); timers = []; }
const wait = (fn, ms) => { const i = setInterval(() => fn(i), ms); timers.push(i); return i; };

/* ---------- LOGIN ---------- */
function togglePass() { const p = $('#pass'); p.type = p.type === 'password' ? 'text' : 'password'; }
function doLogin(google) {
  const e = $('#email').value.trim(), p = $('#pass').value;
  if (!google && (!e || !p)) return toast('Mohon isi email dan password');
  if (e) { const n = e.split('@')[0]; ST.prof.email = e; ST.prof.nama = n.charAt(0).toUpperCase() + n.slice(1); }
  PW = google ? '' : p; renderProfile(); go('dash', true);
}
function logout() { go('login', true); toast('Anda telah keluar'); }

/* ---------- PROFIL ---------- */
function setAvatar(url) {
  AVATAR = url;
  $$('#pf-av,.davatar').forEach(a => { a.dataset.custom = 1; a.style.backgroundImage = `url(${url})`; a.style.fontSize = '0'; });
}
function renderProfile() {
  const p = ST.prof, b = ST.biz, t = b.jenis === 'tani', o = (t ? TANI : TN)[b.kom];
  $('#pf-nama').textContent = p.nama; $('#pf-kota').textContent = '📍 ' + p.kota;
  $('#pf-role').textContent = t ? '🌱 Produsen' : '🐄 Peternak'; $('#pf-kel').textContent = b.kel; $('#pf-kom').textContent = b.kom;
  $('#pf-kap').textContent = '± ' + nf(b.kap) + (t ? ' kg/musim' : ' ekor/siklus'); $('#pf-panen').textContent = b.a + ' – ' + b.b;
  $('#pf-nilai').textContent = o ? rp(t ? b.kap * o.p : b.kap * o.w * o.p) : '-';
  $('#dash .uname').textContent = p.nama.split(' ')[0];
  $('#d-stok').textContent = nf(b.kap); $('#d-su').textContent = t ? 'kg' : 'ekor';
  refreshNotif(); renderDash();
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fld = (id, l, v, t = 'text', x = '') => `<div class="fl"><label for="${id}">${l}</label><input class="inp" id="${id}" type="${t}" value="${esc(v)}" ${x}></div>`;
const selh = (id, l, opts, v, ev = '') => `<div class="fl"><label for="${id}">${l}</label><select class="inp" id="${id}" ${ev}>${opts.map(o => `<option${o === v ? ' selected' : ''}>${o}</option>`).join('')}</select></div>`;
const swr = (k, t, s, on) => `<div class="swrow"><div><b>${t}</b><small>${s}</small></div><div class="switch ${on ? 'on' : ''}" data-k="${k}" onclick="togSw(this)"></div></div>`;
const seg = (k, o, v) => `<div class="seg">${o.map(x => `<button class="${String(x[0]) === String(v) ? 'on' : ''}" onclick="setSet('${k}','${x[0]}',this)">${x[1]}</button>`).join('')}</div>`;

const SH = {
  pribadi: {
    t: 'Data Pribadi', h: () => `<div class="avrow"><div class="avatar" id="sh-av" ${AVATAR ? `style="background-image:url(${AVATAR});font-size:0"` : ''}>👨‍🌾</div><label class="btn out sm" style="cursor:pointer">📷 Ganti Foto<input type="file" accept="image/*" hidden onchange="pickPhoto(this)"></label></div>`
      + fld('f-nama', 'Nama Lengkap', ST.prof.nama) + fld('f-hp', 'No. HP', ST.prof.hp, 'tel') + fld('f-email', 'Email', ST.prof.email, 'email')
      + fld('f-kota', 'Kota / Kabupaten', ST.prof.kota) + fld('f-alamat', 'Alamat Lengkap', ST.prof.alamat) + `<button class="btn" onclick="savePribadi()">💾 Simpan Perubahan</button>`
  },
  usaha: {
    t: 'Data Usaha & Produksi', h: () => { const b = ST.biz; return fld('b-kel', 'Nama Usaha / Kelompok', b.kel) + selh('b-jenis', 'Jenis Usaha', ['Pertanian', 'Peternakan'], b.jenis === 'tani' ? 'Pertanian' : 'Peternakan', 'onchange="fillBKom()"')
      + `<div class="fl"><label>Komoditas Utama</label><select class="inp" id="b-kom"></select></div>` + fld('b-kap', 'Kapasitas Produksi (<span id="b-u"></span>)', b.kap, 'number', 'min="1"')
      + `<div class="two">${selh('b-a', 'Panen Mulai', MON, b.a)}${selh('b-b', 'Panen Sampai', MON, b.b)}</div><button class="btn" onclick="saveUsaha()">💾 Simpan Perubahan</button>`; }
  },
  akun: {
    t: 'Akun & Keamanan', h: () => `<b class="shs">🔑 Ubah Kata Sandi</b>` + (PW ? fld('pw0', 'Kata Sandi Lama', '', 'password') : `<p class="hint">Anda masuk tanpa sandi (Google/belum login), sandi lama tidak diperlukan.</p>`)
      + fld('pw1', 'Kata Sandi Baru', '', 'password', 'oninput="pwStr(this.value)"') + `<div class="pws"><i id="pws"></i></div><small id="pwt" class="hint">Minimal 8 karakter, kombinasi huruf & angka.</small>` + fld('pw2', 'Ulangi Kata Sandi Baru', '', 'password')
      + `<button class="btn" onclick="savePw()">🔒 Ubah Kata Sandi</button><b class="shs">🛡 Keamanan Akun</b>`
      + swr('sec.twofa', 'Verifikasi 2 Langkah', 'Kode OTP dikirim saat masuk.', ST.sec.twofa) + swr('sec.alert', 'Peringatan Login Baru', 'Beri tahu jika ada login dari perangkat baru.', ST.sec.alert) + swr('sec.bio', 'Masuk dengan Sidik Jari / Wajah', 'Biometrik perangkat.', ST.sec.bio)
      + `<div class="dev">📱 <span><b>Perangkat ini</b><small>Aktif sekarang</small></span></div><div class="dev">💻 <span><b>Laptop Windows</b><small>Terakhir aktif kemarin</small></span></div>`
      + `<button class="btn out" style="margin-top:10px" onclick="toast('Semua perangkat lain telah dikeluarkan ✔')">Keluar dari Semua Perangkat Lain</button>`
  },
  notif: {
    t: 'Notifikasi', h: () => swr('notif.harga', '📈 Notifikasi Harga', 'Perubahan harga komoditas yang Anda pantau.', ST.notif.harga) + swr('notif.minta', '🤝 Notifikasi Permintaan', 'Permintaan pasokan & penawaran mitra.', ST.notif.minta)
      + swr('notif.kirim', '🚚 Notifikasi Pengiriman', 'Status dan posisi pengiriman.', ST.notif.kirim) + `<p class="hint">Notifikasi yang dinonaktifkan tidak akan muncul di kotak masuk dan lencana.</p>`
  },
  set: {
    t: 'Pengaturan Aplikasi', h: () => `<b class="shs">🌐 Bahasa</b>` + seg('lang', [['id', '🇮🇩 Indonesia'], ['en', '🇬🇧 English']], ST.set.lang) + `<b class="shs">🔠 Ukuran Teks</b>` + seg('size', [[0.9, 'Kecil'], [1, 'Normal'], [1.1, 'Besar']], ST.set.size)
      + swr('set.anim', 'Animasi', 'Matikan untuk tampilan lebih hemat tenaga.', ST.set.anim) + swr('set.hemat', 'Mode Hemat Data', 'Tidak memuat gambar latar halaman.', ST.set.hemat)
      + `<button class="btn out" style="margin-top:12px" onclick="resetData()">🗑 Hapus Data Tersimpan</button><p class="hint">LIVORA versi 2.0 • Rantai Pasok Digital Inklusif Berbasis AI</p>`
  },
  inbox: {
    t: 'Notifikasi', h: () => { unread = false; refreshNotif(); const v = visInbox(); return v.length ? v.map(x => `<div class="res"><span class="ic">${x[1]}</span><div><b>${x[2]}</b><small>${x[3]}</small></div></div>`).join('') : `<p class="hint" style="text-align:center;padding:20px">Tidak ada notifikasi. Aktifkan di Profil › Notifikasi.</p>`; }
  },
  rek: { t: 'Rekomendasi AI', h: () => recText() },
  kom: {
    t: 'Pilih Komoditas', h: () => `<div class="ksearch"><span>🔍</span><input id="k-q" type="search" placeholder="Cari komoditas…" oninput="renderKom()" autocomplete="off"></div><div class="kchips" id="k-ch"></div><div class="klist" id="k-list"></div>`
      + `<p class="hint knote">Harga acuan perkiraan mengikuti rujukan Badan Pangan Nasional / PIHPS. Hubungkan API resmi untuk data real-time.</p>`
  }
};
let shOpen = null;
function openSheet(k) { shOpen = k; $('#sh-title').textContent = SH[k].t; $('#sh-body').innerHTML = SH[k].h(); const s = $('#sheet'); s.classList.remove('hidden'); requestAnimationFrame(() => s.classList.add('on')); if (k === 'usaha') fillBKom(1); if (k === 'kom') { KF = 'all'; renderKom(); } applyLang(); }
function closeSheet() { const s = $('#sheet'); s.classList.remove('on'); setTimeout(() => s.classList.add('hidden'), 250); }
document.addEventListener('keydown', e => e.key === 'Escape' && closeSheet());
function fillBKom(init) {
  const t = $('#b-jenis').value === 'Pertanian'; fillSel($('#b-kom'), Object.keys(t ? TANI : TN).filter(k => t || TN[k].u === 'ekor'), init && (ST.biz.jenis === 'tani') === t ? ST.biz.kom : null);
  $('#b-u').textContent = t ? 'kg per musim' : 'ekor per siklus';
}
function pickPhoto(inp) { const f = inp.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { setAvatar(r.result); const a = $('#sh-av'); if (a) { a.style.backgroundImage = `url(${r.result})`; a.style.fontSize = '0'; } toast('Foto profil diperbarui ✔'); }; r.readAsDataURL(f); }
function savePribadi() {
  const n = $('#f-nama').value.trim(), hp = $('#f-hp').value.trim(), em = $('#f-email').value.trim();
  if (n.length < 3) return toast('Nama minimal 3 karakter');
  if (hp.replace(/\D/g, '').length < 9) return toast('Nomor HP tidak valid');
  if (!/^\S+@\S+\.\S+$/.test(em)) return toast('Format email tidak valid');
  Object.assign(ST.prof, { nama: n, hp, email: em, kota: $('#f-kota').value.trim() || ST.prof.kota, alamat: $('#f-alamat').value.trim() });
  save(); renderProfile(); closeSheet(); toast('Data pribadi tersimpan ✔');
}
function saveUsaha() {
  const kap = pn($('#b-kap').value), kel = $('#b-kel').value.trim();
  if (!kel) return toast('Isi nama usaha'); if (!(kap > 0)) return toast('Kapasitas harus lebih dari 0');
  ST.biz = { kel, jenis: $('#b-jenis').value === 'Pertanian' ? 'tani' : 'ternak', kom: $('#b-kom').value, kap, a: $('#b-a').value, b: $('#b-b').value };
  save(); renderProfile(); closeSheet(); toast('Data usaha tersimpan ✔');
}
function pwStr(v) { const s = (v.length >= 8) + /\d/.test(v) + /[A-Z]/.test(v) + /[^A-Za-z0-9]/.test(v); $('#pws').style.width = s * 25 + '%'; $('#pws').style.background = ['#d93025', '#d93025', '#f5a623', '#8bc34a', '#2e8b2f'][s]; $('#pwt').textContent = ['Terlalu lemah', 'Lemah', 'Cukup', 'Kuat', 'Sangat kuat'][s]; }
function savePw() {
  const o = $('#pw0') ? $('#pw0').value : '', n = $('#pw1').value, c = $('#pw2').value;
  if (PW && o !== PW) return toast('Kata sandi lama salah');
  if (n.length < 8 || !/\d/.test(n) || !/[A-Za-z]/.test(n)) return toast('Sandi baru min. 8 karakter, huruf & angka');
  if (n !== c) return toast('Konfirmasi sandi tidak cocok');
  if (n === PW) return toast('Sandi baru harus berbeda');
  PW = n; closeSheet(); toast('Kata sandi berhasil diubah ✔');
}
function togSw(el) { const [a, b] = el.dataset.k.split('.'); ST[a][b] = !ST[a][b]; el.classList.toggle('on', ST[a][b]); save(); applySettings(); refreshNotif(); }
function setSet(k, v, btn) { ST.set[k] = k === 'lang' ? v : +v; [...btn.parentNode.children].forEach(b => b.classList.toggle('on', b === btn)); save(); applySettings(); }
function resetData() { try { localStorage.removeItem('livora'); } catch (e) { } ST = DEF(); AVATAR = ''; applySettings(); renderProfile(); closeSheet(); toast('Data direset'); }
function applySettings() {
  $('#app').style.zoom = ST.set.size; document.body.classList.toggle('noanim', !ST.set.anim);
  document.documentElement.lang = ST.set.lang; if (ST.set.hemat) { $('#app').classList.remove('has-bg'); $('#app').style.backgroundImage = ''; }
  applyLang();
}

/* ---------- DASHBOARD: PILIH KOMODITAS ---------- */
// nama, ikon, harga/satuan, perubahan %, jenis, satuan, prediksi panen / siap jual (hari lagi)
const DK = [
  ['Beras Medium', '🍚', 13500, 0.4, 'tani', 'kg', 18], ['Beras Premium', '🍚', 15200, 0.3, 'tani', 'kg', 18], ['Gabah Kering Panen', '🌾', 6750, 2.5, 'tani', 'kg', 12],
  ['Gabah Kering Giling', '🌾', 8200, 1.6, 'tani', 'kg', 14], ['Jagung Pipilan', '🌽', 5600, -0.8, 'tani', 'kg', 21], ['Jagung Manis', '🌽', 7500, 0.5, 'tani', 'kg', 18],
  ['Kedelai', '🫘', 10500, 1.1, 'tani', 'kg', 33], ['Kacang Tanah', '🥜', 24000, 0.6, 'tani', 'kg', 27], ['Kacang Hijau', '🫘', 19500, 0.9, 'tani', 'kg', 30],
  ['Ubi Kayu', '🍠', 3200, 0.4, 'tani', 'kg', 90], ['Ubi Jalar', '🍠', 6000, 1.0, 'tani', 'kg', 45], ['Kentang', '🥔', 14500, 0.9, 'tani', 'kg', 38],
  ['Cabai Merah Keriting', '🌶', 28500, 6.3, 'tani', 'kg', 16], ['Cabai Merah Besar', '🌶', 31000, 5.2, 'tani', 'kg', 18], ['Cabai Rawit Merah', '🌶', 42000, 4.1, 'tani', 'kg', 14],
  ['Cabai Hijau', '🫑', 20500, 1.8, 'tani', 'kg', 20], ['Bawang Merah', '🧅', 34000, 3.2, 'tani', 'kg', 24], ['Bawang Putih', '🧄', 38000, 1.4, 'tani', 'kg', 40],
  ['Bawang Bombai', '🧅', 26000, -0.4, 'tani', 'kg', 35], ['Tomat', '🍅', 9500, -2.1, 'tani', 'kg', 11], ['Wortel', '🥕', 11000, -1.2, 'tani', 'kg', 22],
  ['Kubis', '🥬', 6500, -0.5, 'tani', 'kg', 19], ['Sawi Hijau', '🥬', 8000, 0.7, 'tani', 'kg', 9], ['Kangkung', '🥬', 5500, 0.2, 'tani', 'kg', 6],
  ['Bayam', '🥬', 7000, -0.3, 'tani', 'kg', 7], ['Brokoli', '🥦', 24000, 1.3, 'tani', 'kg', 25], ['Buncis', '🫛', 12500, 0.8, 'tani', 'kg', 15],
  ['Kacang Panjang', '🫛', 10500, -0.6, 'tani', 'kg', 13], ['Terong', '🍆', 10000, -0.9, 'tani', 'kg', 17], ['Timun', '🥒', 7500, 0.3, 'tani', 'kg', 14],
  ['Labu Siam', '🥒', 5000, 0.0, 'tani', 'kg', 12], ['Jahe', '🌿', 28000, 2.0, 'tani', 'kg', 60], ['Kunyit', '🌿', 15000, 0.7, 'tani', 'kg', 55],
  ['Semangka', '🍉', 6000, -1.4, 'tani', 'kg', 20], ['Melon', '🍈', 14500, 0.8, 'tani', 'kg', 23], ['Pisang', '🍌', 9000, 1.8, 'tani', 'kg', 60],
  ['Mangga', '🥭', 16000, 2.2, 'tani', 'kg', 45], ['Jeruk', '🍊', 15000, 1.5, 'tani', 'kg', 50], ['Nanas', '🍍', 7500, 0.6, 'tani', 'kg', 70],
  ['Alpukat', '🥑', 30000, 2.4, 'tani', 'kg', 55], ['Apel', '🍎', 28000, 0.4, 'tani', 'kg', 80], ['Anggur', '🍇', 45000, 1.1, 'tani', 'kg', 65],
  ['Stroberi', '🍓', 55000, 1.9, 'tani', 'kg', 28], ['Kelapa', '🥥', 9000, 0.5, 'tani', 'kg', 75], ['Kopi', '☕', 62000, 3.7, 'tani', 'kg', 120],
  ['Kakao', '🍫', 78000, 2.9, 'tani', 'kg', 90], ['Kelapa Sawit (TBS)', '🌴', 2500, 0.8, 'tani', 'kg', 10], ['Karet (Getah)', '🌳', 15500, -0.2, 'tani', 'kg', 10],
  ['Teh (Pucuk Basah)', '🍃', 4500, 0.3, 'tani', 'kg', 14], ['Cengkeh', '🌸', 120000, 1.7, 'tani', 'kg', 90],
  ['Sapi Hidup', '🐄', 60000, 2.5, 'ternak', 'kg', 90], ['Daging Sapi', '🥩', 135000, 1.4, 'ternak', 'kg', 2], ['Kambing', '🐐', 85000, 1.2, 'ternak', 'kg', 75],
  ['Domba', '🐑', 70000, 0.8, 'ternak', 'kg', 80], ['Kerbau', '🐃', 55000, 1.0, 'ternak', 'kg', 95], ['Ayam Pedaging', '🐓', 22000, -0.6, 'ternak', 'kg', 14],
  ['Ayam Kampung', '🐔', 48000, 0.9, 'ternak', 'kg', 60], ['Daging Ayam', '🍗', 38000, 0.7, 'ternak', 'kg', 2], ['Bebek', '🦆', 30000, 0.5, 'ternak', 'kg', 45],
  ['Babi', '🐖', 38000, 0.9, 'ternak', 'kg', 100], ['Kelinci', '🐇', 55000, 0.4, 'ternak', 'kg', 60], ['Ikan Lele', '🐟', 25000, 1.1, 'ternak', 'kg', 35],
  ['Ikan Nila', '🐠', 30000, 0.7, 'ternak', 'kg', 50], ['Ikan Gurame', '🐟', 42000, 0.9, 'ternak', 'kg', 120], ['Udang Vaname', '🦐', 75000, 1.6, 'ternak', 'kg', 90],
  ['Telur Ayam Ras', '🥚', 28500, 1.9, 'ternak', 'kg', 3], ['Telur Ayam Kampung', '🥚', 46000, 1.0, 'ternak', 'kg', 3], ['Telur Bebek', '🥚', 32000, 1.2, 'ternak', 'kg', 3],
  ['Susu Sapi', '🥛', 9000, 0.6, 'ternak', 'liter', 1], ['Madu', '🍯', 120000, 0.5, 'ternak', 'kg', 14]
].map(a => ({ n: a[0], i: a[1], p: a[2], c: a[3], t: a[4], u: a[5], h: a[6] }));
const DKM = Object.fromEntries(DK.map(x => [x.n, x]));
let KF = 'all';
const kchg = c => (c >= 0 ? '▲ ' : '▼ ') + String(c).replace('.', ',') + '%';
function renderDash() {
  const x = DKM[ST.dash.kom] || DKM['Gabah Kering Panen'];
  $('#d-ico').textContent = x.i; $('#d-kn').textContent = x.n; $('#d-kp').textContent = rp(x.p); $('#d-ku').textContent = '/' + x.u;
  const e = $('#d-kc'); e.textContent = (x.c >= 0 ? '▲ +' : '▼ ') + String(x.c).replace('.', ',') + '%'; e.className = x.c >= 0 ? 'kup' : 'kdn';
  $('#d-kh').textContent = x.h;
}
function renderKom() {
  const q = ($('#k-q') ? $('#k-q').value : '').trim().toLowerCase();
  $('#k-ch').innerHTML = [['all', 'Semua'], ['tani', 'Pertanian'], ['ternak', 'Peternakan']].map(c => `<button class="${KF === c[0] ? 'on' : ''}" onclick="KF='${c[0]}';renderKom()">${c[1]}</button>`).join('');
  const L = DK.filter(x => (KF === 'all' || x.t === KF) && (!q || x.n.toLowerCase().includes(q)));
  $('#k-list').innerHTML = L.length ? L.map(x => `<button class="kitem${x.n === ST.dash.kom ? ' sel' : ''}" onclick="pickKom(${DK.indexOf(x)})"><span class="ki">${x.i}</span><b>${x.n}</b><span class="kp">${rp(x.p)}/${x.u}<em class="${x.c >= 0 ? 'up' : 'dn'}">${kchg(x.c)}</em></span></button>`).join('')
    : '<p class="hint" style="text-align:center;padding:18px">Komoditas tidak ditemukan.</p>';
  applyLang();
}
function pickKom(i) { ST.dash.kom = DK[i].n; save(); renderDash(); closeSheet(); toast(DK[i].n + ' dipilih ✔'); }

/* ---------- NOTIFIKASI ---------- */
const INBOX = [['harga', '📈', 'Harga Cabai Merah naik 6,3% di Maros', '5 menit lalu'], ['minta', '🤝', 'PT Segar Nusantara membutuhkan 10.000 kg Cabai Merah', '1 jam lalu'], ['kirim', '🚚', 'Pengiriman LV-AGG-0027 sedang dalam perjalanan', '2 jam lalu']];
let unread = true;
const visInbox = () => INBOX.filter(x => ST.notif[x[0]]);
function refreshNotif() {
  const n = unread ? visInbox().length : 0;
  $$('.badge').forEach(b => { b.textContent = n; b.style.display = n ? '' : 'none'; });
  $$('.dbell i').forEach(b => b.style.display = n ? '' : 'none');
  const pb = $('#pbtn'); if (pb) pb.textContent = ST.notif.harga ? '🔕 Nonaktifkan Notifikasi Harga' : '🔔 Aktifkan Notifikasi Harga ›';
  const sw = $('#a-sw'); if (sw) sw.classList.toggle('on', ST.notif.harga);
}
function setNotif(k, v) { ST.notif[k] = v; save(); refreshNotif(); toast(v ? 'Notifikasi harga diaktifkan 🔔' : 'Notifikasi harga dinonaktifkan 🔕'); }

/* ---------- BAHASA ---------- */
const EN = { 'Beranda': 'Home', 'Pasar': 'Market', 'Logistik': 'Logistics', 'Notifikasi': 'Notifications', 'Profil': 'Profile', 'Bersama LIVORA, wujudkan pertanian dan peternakan yang lebih sejahtera.': 'With LIVORA, build more prosperous farming and livestock.', 'Halo,': 'Hello,',
  'Harga Rata-rata': 'Average Price', 'Pilih Komoditas': 'Choose Commodity', 'Semua': 'All', '🔄 Tampilkan Mitra Lain': '🔄 Show Other Partners', 'Prediksi Panen': 'Harvest Forecast', 'Hari Lagi': 'Days Left', 'Cuaca Hari Ini': 'Weather Today', 'Stok Terdaftar': 'Registered Stock', 'Transparansi Harga': 'Price Transparency', 'Agregasi Pasokan': 'Supply Aggregation', 'Integrasi Logistik': 'Logistics Integration',
  'Ringkasan Aktivitas': 'Activity Summary', 'Lihat Semua ›': 'See All ›', 'Pesanan Aktif': 'Active Orders', 'Pengiriman Dalam Proses': 'Deliveries in Progress', 'Mitra Terhubung': 'Connected Partners', 'Dukung Petani & Peternak Indonesia Bersama LIVORA': 'Support Indonesian Farmers & Livestock Breeders with LIVORA', 'Pelajari Lebih Lanjut ›': 'Learn More ›',
  'Profil Pengguna': 'User Profile', 'Kelola informasi akun, data usaha, dan preferensi Anda.': 'Manage your account, business data, and preferences.', 'Bergabung sejak 10 Mar 2026': 'Joined 10 Mar 2026', 'Data Pribadi': 'Personal Data', 'Ubah informasi identitas, kontak, dan alamat.': 'Edit identity, contact, and address.',
  'Data Usaha & Produksi': 'Business & Production Data', 'Kelola komoditas, kapasitas, dan jadwal panen.': 'Manage commodities, capacity, and harvest schedule.', 'Akun & Keamanan': 'Account & Security', 'Ubah kata sandi dan atur keamanan akun.': 'Change password and manage account security.',
  'Atur notifikasi harga, permintaan, dan pengiriman.': 'Manage price, request, and delivery notifications.', 'Pengaturan Aplikasi': 'App Settings', 'Bahasa, tampilan, dan preferensi lainnya.': 'Language, display, and other preferences.', '⎋ Keluar dari Akun': '⎋ Log Out', '✎ Edit': '✎ Edit',
  'Komoditas Utama:': 'Main Commodity:', 'Kapasitas Produksi:': 'Production Capacity:', 'Musim Panen:': 'Harvest Season:', 'Estimasi Nilai Produksi:': 'Est. Production Value:', 'Simpan Perubahan': 'Save Changes', '💾 Simpan Perubahan': '💾 Save Changes',
  'Nama Lengkap': 'Full Name', 'No. HP': 'Phone No.', 'Kota / Kabupaten': 'City / Regency', 'Alamat Lengkap': 'Full Address', 'Nama Usaha / Kelompok': 'Business / Group Name', 'Jenis Usaha': 'Business Type', 'Komoditas Utama': 'Main Commodity',
  '🔑 Ubah Kata Sandi': '🔑 Change Password', 'Kata Sandi Lama': 'Old Password', 'Kata Sandi Baru': 'New Password', 'Ulangi Kata Sandi Baru': 'Repeat New Password', '🔒 Ubah Kata Sandi': '🔒 Change Password', '🛡 Keamanan Akun': '🛡 Account Security', 'Verifikasi 2 Langkah': 'Two-Step Verification',
  'Peringatan Login Baru': 'New Login Alert', 'Masuk dengan Sidik Jari / Wajah': 'Sign in with Fingerprint / Face', '📈 Notifikasi Harga': '📈 Price Notifications', '🤝 Notifikasi Permintaan': '🤝 Request Notifications', '🚚 Notifikasi Pengiriman': '🚚 Delivery Notifications',
  '🌐 Bahasa': '🌐 Language', '🔠 Ukuran Teks': '🔠 Text Size', 'Animasi': 'Animations', 'Mode Hemat Data': 'Data Saver Mode', 'Kecil': 'Small', 'Normal': 'Normal', 'Besar': 'Large', '🗑 Hapus Data Tersimpan': '🗑 Clear Saved Data',
  'Pilih Jenis Usaha': 'Choose Business Type', 'Pertanian': 'Farming', 'Peternakan': 'Livestock', 'Input Data Produk': 'Product Data Input', 'Hasil Pencocokan Mitra': 'Partner Matching Results', 'Mitra Ditemukan!': 'Partner Found!', '💬 Hubungi Mitra': '💬 Contact Partner', '📞 Telepon Langsung': '📞 Call Directly',
  'Kirim ➤': 'Send ➤', 'Tulis pesan…': 'Type a message…', 'Daftar Produsen': 'Producer List', 'Detail Pengiriman': 'Shipment Details', 'Rincian Biaya Logistik': 'Logistics Cost Breakdown', 'Pengumpulan Pasokan': 'Supply Collection', 'Sampai ke Mitra': 'Arrived at Partner',
  'Menggabungkan Pasokan Produsen': 'Combining Producer Supplies', 'Mengidentifikasi produsen': 'Identifying producers', 'Mengumpulkan pasokan': 'Collecting supplies', 'Menggabungkan volume produksi': 'Combining production volume', 'Menyiapkan hasil agregasi': 'Preparing aggregation results' };
function applyLang() {
  const en = ST.set.lang === 'en', w = document.createTreeWalker($('#app'), NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) {
    const raw = n.__o !== undefined ? n.__o : n.nodeValue, k = raw.trim(); if (!k) continue;
    if (en && EN[k]) { n.__o = raw; n.nodeValue = raw.replace(k, EN[k]); }
    else if (!en && n.__o !== undefined) { n.nodeValue = n.__o; delete n.__o; }
  }
}

/* ---------- PILIH JENIS USAHA ---------- */
const FLOWS = {
  match: { ico: '🤝', t: 'AI Matching', d: 'Pencocokan otomatis antara produk Anda dengan mitra yang membutuhkan pasokan.', s: 'Tentukan jenis komoditas untuk memulai pencocokan mitra.', a: 'Cocokkan hasil tanaman seperti padi, cabai, jagung, bawang, kopi, buah, dan puluhan komoditas pertanian lainnya.', b: 'Cocokkan hasil peternakan seperti sapi, kambing, ayam, bebek, ikan, telur, susu, dan produk peternakan lainnya.' },
  fc: { ico: '📊', t: 'AI Production Forecasting', d: 'Prediksi jumlah produksi komoditas berbasis AI untuk mendukung perencanaan panen dan distribusi.', s: 'Tentukan jenis komoditas untuk memulai prediksi produksi.', a: 'Prediksi produksi dan keuntungan tanaman: padi, cabai, bawang, sayuran, buah, kopi, dan lainnya.', b: 'Prediksi pertumbuhan dan keuntungan ternak: sapi, kambing, domba, ayam, bebek, babi, ikan, dan lainnya.' },
  price: { ico: '⚖', t: 'Transparansi Harga', d: 'Pantau harga komoditas secara real-time di berbagai lokasi untuk transaksi yang lebih adil dan transparan.', s: 'Tentukan jenis komoditas untuk melihat informasi harga pasar.', a: 'Lihat dan bandingkan harga puluhan komoditas pertanian di berbagai lokasi.', b: 'Lihat dan bandingkan harga sapi, kambing, ayam, ikan, telur, susu, dan lainnya di berbagai daerah.' },
  ag: { ico: '📦', t: 'Agregasi Pasokan', d: 'Penggabungan pasokan dari berbagai produsen untuk memenuhi kebutuhan mitra dalam skala besar.', s: 'Tentukan jenis komoditas untuk melakukan agregasi pasokan.', a: 'Gabungkan pasokan komoditas pertanian dari berbagai produsen.', b: 'Gabungkan pasokan produk peternakan dari berbagai peternak.' }
};
function startFlow(f) {
  flow = f; const c = FLOWS[f];
  $('#ch-ico').textContent = c.ico; $('#ch-title').textContent = c.t; $('#ch-desc').textContent = c.d;
  $('#ch-sub').textContent = c.s; $('#ch-tani').textContent = c.a; $('#ch-ternak').textContent = c.b;
  go('choose', NAV.includes(cur) && f === 'price' && cur !== 'dash');
}
function pickType(t) {
  ctype = t;
  if (flow === 'match') return openMatch(t);
  go({ fc: 'fc-', price: 'price-', ag: 'ag-' }[flow] + t);
  if (flow === 'price') t === 'tani' ? showPrice() : renderAnimal(agKeys()[0] === pAn ? 0 : Math.max(0, agKeys().indexOf(pAn)));
  if (flow === 'ag' && t === 'ternak') renderAggTabs();
}
const agKeys = () => Object.keys(TN);

/* ---------- AI MATCHING ---------- */
/* Mitra dibuat otomatis mengikuti komoditas yang dipilih (misal Bawang -> "PT Bawang Nusantara"),
   dan bisa diganti lewat tombol "Tampilkan Mitra Lain". */
const hsh = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const rnd = seed => { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
const PT = {
  tani: [['🛒', 'PT {w} Nusantara'], ['🥬', 'CV {w} Sejahtera'], ['🏪', 'Koperasi {w} Mandiri'], ['🏬', 'PT Pasar Mitra {w}'], ['🏭', 'Industri Olahan {w} Prima'], ['🚢', 'Eksportir {w} Indonesia'],
    ['🍽', 'Katering Resto {w}'], ['📦', 'Distributor {w} Utama'], ['🧺', 'UD {w} Berkah'], ['🛍', 'Supermarket Segar {w}'], ['🏢', 'Sentra {w} Nusantara'], ['🤝', 'Mitra {w} Makmur']],
  ternak: [['🐄', 'PT {w} Makmur'], ['🍖', 'CV {w} Sejahtera'], ['🏪', 'Koperasi Peternak {w}'], ['🏭', 'RPH {w} Jaya'], ['🍽', 'Katering Resto {w}'], ['📦', 'Distributor {w} Segar'],
    ['🛍', 'Supermarket Segar {w}'], ['🏢', 'Sentra {w} Nusantara'], ['🤝', 'Mitra {w} Prima'], ['🧺', 'UD {w} Berkah']]
};
const PCITY = [['Makassar', 75], ['Maros', 60], ['Gowa', 30], ['Takalar', 55], ['Parepare', 150], ['Pangkep', 70], ['Bone', 170], ['Barru', 110], ['Sidrap', 190], ['Jeneponto', 90], ['Bantaeng', 125], ['Sinjai', 200]];
const kShort = k => { const p = k.split(' '); return p[0] === 'Ikan' ? p[1] : p[0]; };
let MSEED = 0;
function genPartners(kom, type, seed = 0) {
  const R = rnd(hsh(kom + '|' + type) + seed * 7919), w = kShort(kom), tp = PT[type].filter(t => !(/^(Telur|Susu|Ikan)/.test(kom) && t[1].startsWith('RPH'))), ct = PCITY.slice();
  const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  shuf(tp); shuf(ct);
  return tp.slice(0, 5).map((t, i) => {
    const c = ct[i], km = Math.round(c[1] * (.9 + R() * .2)), need = type === 'tani' ? Math.round((5000 + R() * 13000) / 500) * 500 : Math.round(20 + R() * 50);
    return [t[0], t[1].replace('{w}', w), c[0], km, need, +(.02 + R() * .04).toFixed(3)];
  });
}
function moreMitra() { MSEED++; renderMatch(); toast('Mitra lain ditampilkan 🔄'); }
let MR = [];
function openMatch(t) {
  const keys = t === 'tani' ? Object.keys(TANI) : agKeys();
  fillSel($('#m-kom'), keys, t === 'tani' ? 'Cabai Merah' : 'Sapi'); MSEED = 0; defVol(); go('match-form');
}
function defVol() { const k = $('#m-kom').value; $('#m-vol').value = ctype === 'tani' ? '10.000' : nf(TN[k].tg * .8); $('#m-u').textContent = ctype === 'tani' ? 'kg' : TN[k].u; }
function onKom() { MSEED = 0; defVol(); renderMatch(); }
function mcalc() {
  const k = $('#m-kom').value, vol = pn($('#m-vol').value), g = $('#m-qual').selectedIndex, q = [1, .85, .7][g], b = ctype === 'tani' ? TANI[k] : TN[k];
  const kgU = ctype === 'tani' ? 1 : b.w, f = ctype === 'tani' ? 1 : b.tg / 50;
  MR = genPartners(k, ctype, MSEED).map(m => {
    const need = Math.round(m[4] * f), dealV = Math.min(vol, need), hj = b.p * (1 + m[5]) * [1.03, 1, .94][g];
    const nilai = dealV * kgU * hj, ongkir = dealV * kgU / 1000 * m[3] * 1500, fee = nilai * .015, sv = 1 - Math.abs(vol - need) / Math.max(vol, need, 1);
    const sk = [q, Math.max(0, 1 - m[3] / 200), sv, Math.min(1, .6 + m[5] * 5)];
    return { m, need, dealV, hj, nilai, ongkir, fee, net: nilai - ongkir - fee, sk, score: Math.round((sk[0] * .35 + sk[1] * .25 + sk[2] * .25 + sk[3] * .15) * 100) };
  }).sort((a, b) => b.score - a.score);
}
function renderMatch() {
  mcalc(); const u = ctype === 'tani' ? 'kg' : TN[$('#m-kom').value].u, vol = pn($('#m-vol').value), b = MR[0];
  $('#m-cnt').textContent = MR.length + ' Mitra Tersedia';
  $('#m-sum').innerHTML = rows([['Mitra terbaik', b.m[1]], ['Skor kecocokan', b.score + '%'], ['Estimasi pendapatan bersih', rp(b.net), 'tot']]);
  $('#m-list').innerHTML = MR.map((r, i) => `<div class="mcard"><div class="mh"><span class="ic">${r.m[0]}</span><div><b>${r.m[1]}</b><small>📍 ${r.m[2]} (± ${r.m[3]} km) • Butuh ${nf(r.need)} ${u}</small></div><div class="pc">Kecocokan<strong>${r.score}%</strong></div></div>
    <div class="bars">${['Kualitas', 'Jarak', 'Volume', 'Harga'].map((l, j) => `<span>${l}<i><u style="width:${Math.round(r.sk[j] * 100)}%"></u></i></span>`).join('')}</div>
    ${rows([['Harga tawar', rp(r.hj) + '/kg'], ['Volume terjual', nf(r.dealV) + ' ' + u + (vol > r.need ? ` (sisa ${nf(vol - r.need)})` : '')], ['Nilai transaksi', rp(r.nilai)], ['Ongkir (± ' + r.m[3] + ' km)', '− ' + rp(r.ongkir)], ['Biaya layanan 1,5%', '− ' + rp(r.fee)], ['Pendapatan bersih', rp(r.net), 'tot']])}
    <div class="mbtn"><button class="btn sm" onclick="openChat(${i})">💬 Hubungi</button><button class="btn sm out" onclick="callPartner(${i})">📞</button><button class="btn sm out" onclick="toast('Penawaran diajukan ke ${r.m[1]} ✔')">Ajukan Penawaran ›</button></div></div>`).join('');
}
function startSearch() {
  if (!pn($('#m-vol').value)) return toast('Isi volume tersedia dulu');
  go('match-search'); let p = 0; const bar = $('#s-bar');
  bar.style.width = '0'; ['sd1', 'sd2', 'sd3'].forEach(i => $('#' + i).className = 'dot'); $('#sd1').classList.add('cur');
  wait(i => {
    p += 2; bar.style.width = p + '%';
    if (p > 30) { $('#sd1').className = 'dot done'; $('#sd2').classList.add('cur'); }
    if (p > 70) { $('#sd2').className = 'dot done'; $('#sd3').classList.add('cur'); }
    if (p >= 100) {
      clearInterval(i); $('#sd3').className = 'dot done'; mcalc(); const r = MR[0], u = ctype === 'tani' ? 'kg' : TN[$('#m-kom').value].u;
      $('#f-ic').textContent = r.m[0]; $('#f-name').textContent = r.m[1]; $('#f-loc').textContent = `📍 ${r.m[2]} (± ${r.m[3]} km)`; $('#f-pc').textContent = '👍 ' + r.score + '%';
      $('#f-prod').textContent = $('#m-kom').value; $('#f-vol').textContent = nf(r.dealV) + ' ' + u;
      $('#f-calc').innerHTML = rows([['Harga tawar', rp(r.hj) + '/kg'], ['Nilai transaksi', rp(r.nilai)], ['Ongkir + layanan', '− ' + rp(r.ongkir + r.fee)], ['Pendapatan bersih', rp(r.net), 'tot']]);
      $('#saveBtn').textContent = '🔖 Simpan Mitra'; $('#saveBtn').classList.remove('saved');
      setTimeout(() => go('match-found', false, true), 400);
    }
  }, 100);
}
function cancelSearch() { stopTimers(); go('match-form', false, true); }
function saveMitra() { const b = $('#saveBtn'); const s = b.classList.toggle('saved'); b.textContent = s ? '✔ Mitra Tersimpan' : '🔖 Simpan Mitra'; toast(s ? 'Mitra disimpan' : 'Dihapus dari simpanan'); }

/* ---------- CHAT & TELEPON ---------- */
const CHATS = {}; let CP = null, CI = null, CT = null, cs = 0, typingOn = false;
const first = () => ST.prof.nama.split(' ')[0];
function push(f, t) { CHATS[CP.name].push({ f, t, h: hhmm(new Date()) }); }
function openChat(i) {
  const r = MR[i]; CP = { name: r.m[1], ic: r.m[0], r };
  if (!CHATS[CP.name]) { CHATS[CP.name] = []; push('them', `Halo Pak ${first()}, terima kasih sudah menghubungi ${CP.name}. Kami tertarik dengan ${$('#m-kom').value} Anda. Ada yang bisa kami bantu?`); }
  $('#ch-ic').textContent = CP.ic; $('#ch-name').textContent = CP.name; go('chat'); renderChat();
}
function callPartner(i) { openChat(i); startCall(); }
function renderChat() {
  const m = $('#ch-msgs');
  m.innerHTML = CHATS[CP.name].map(x => `<div class="mb ${x.f}">${esc(x.t)}${x.f === 'sys' ? '' : `<small>${x.h}${x.f === 'me' ? ' ✓✓' : ''}</small>`}</div>`).join('') + (typingOn ? '<div class="mb them typ"><i></i><i></i><i></i></div>' : '');
  m.scrollTop = m.scrollHeight; $('#ch-st').textContent = typingOn ? 'sedang mengetik…' : '● Online';
}
function reply(t) {
  const q = t.toLowerCase(), r = CP.r, kom = $('#m-kom').value, u = ctype === 'tani' ? 'kg' : TN[kom].u, tgl = new Date($('#m-date').value || Date.now());
  if (/telp|telepon|call/.test(q)) return { text: 'Baik, saya telepon sekarang ya 📞', call: 1 };
  if (/harga|tawar/.test(q)) return { text: `Penawaran kami ${rp(r.hj)}/kg untuk ${kom} (${$('#m-qual').value}). Estimasi nilai transaksi ${rp(r.nilai)}.` };
  if (/kirim|ongkir|logistik|jadwal|kapan/.test(q)) return { text: `Pengiriman via LIVORA Logistik, ± ${r.m[3]} km, estimasi ongkir ${rp(r.ongkir)}. Kami siap menerima barang sekitar ${fmtDate(tgl)}.` };
  if (/volume|jumlah|stok|butuh|berapa/.test(q)) return { text: `Kebutuhan kami ${nf(r.need)} ${u}. Dari stok Anda ${nf(pn($('#m-vol').value))} ${u}, kami ambil ${nf(r.dealV)} ${u}.` };
  if (/setuju|deal|sepakat|oke|ok\b/.test(q)) return { text: `Kesepakatan dicatat 🤝 Total transaksi ${rp(r.nilai)}. Kami kirim purchase order lewat LIVORA.` };
  if (/terima kasih|makasih/.test(q)) return { text: 'Sama-sama Pak, senang bekerja sama 🙏' };
  return { text: 'Baik, kami catat. Ada yang ingin ditanyakan soal harga, volume, atau pengiriman?' };
}
function sendMsg(x) {
  const inp = $('#ch-in'), t = (x !== undefined ? x : inp.value).trim(); if (!t) return;
  inp.value = ''; push('me', t); typingOn = true; renderChat();
  setTimeout(() => { typingOn = false; const r = reply(t); push('them', r.text); renderChat(); if (r.call) setTimeout(incomingCall, 1300); }, 900 + Math.random() * 600);
}
function setCall(s) {
  const o = $('#callov'); o.dataset.s = s; $('#c-name').textContent = CP.name; $('#c-ic').textContent = CP.ic;
  $('#c-st').textContent = { calling: 'Memanggil…', in: 'Panggilan masuk…', on: '00:00' }[s]; clearInterval(CI); clearTimeout(CT);
  if (s === 'on') { cs = 0; CI = setInterval(() => { cs++; $('#c-st').textContent = mmss(cs); }, 1000); }
}
function startCall() { $('#callov').classList.remove('hidden'); setCall('calling'); CT = setTimeout(() => setCall('on'), 2600); }
function incomingCall() { if (cur !== 'chat') return; $('#callov').classList.remove('hidden'); setCall('in'); }
function endCall() { const s = $('#callov').dataset.s; clearInterval(CI); clearTimeout(CT); $('#callov').classList.add('hidden'); push('sys', s === 'on' ? '📞 Panggilan suara • ' + mmss(cs) : '📵 Panggilan dibatalkan'); renderChat(); }
function declineCall() { clearTimeout(CT); $('#callov').classList.add('hidden'); push('sys', '📵 Panggilan ditolak'); push('them', 'Baik Pak, kita lanjut lewat chat saja ya.'); renderChat(); }

/* ---------- GRAFIK SVG ---------- */
function lineChart(vals, labels, fmt = v => v, unit = '') {
  const W = 320, H = 170, L = 40, R = 16, T = 26, B = 24;
  const mn = Math.min(...vals), mx = Math.max(...vals), pad = (mx - mn) * .25 || 1, lo = mn - pad, hi = mx + pad;
  const x = i => L + i * (W - L - R) / (vals.length - 1), y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  const pts = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  let g = ''; for (let k = 0; k < 4; k++) { const v = lo + (hi - lo) * k / 3; g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#e1ecd9"/><text x="${L - 4}" y="${y(v) + 3}" font-size="9" text-anchor="end" fill="#5d6b61">${fmt(v)}</text>`; }
  const step = Math.ceil(vals.length / 6);
  const xl = labels.map((l, i) => i % step === 0 || i === vals.length - 1 ? `<text x="${x(i)}" y="${H - 6}" font-size="9" text-anchor="middle" fill="#5d6b61">${l}</text>` : '').join('');
  const dots = vals.length <= 8 ? vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#fff" stroke="#2e8b2f" stroke-width="2"/>`).join('') : '';
  const lx = x(vals.length - 1), ly = y(vals.at(-1));
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">${g}${xl}<polygon points="${L},${H - B} ${pts} ${lx},${H - B}" fill="rgba(63,165,53,.15)"/><polyline points="${pts}" fill="none" stroke="#2e8b2f" stroke-width="2.5"/>${dots}<circle cx="${lx}" cy="${ly}" r="5" fill="#14532d"/><rect x="${lx - 52}" y="${ly - 24}" width="62" height="16" rx="8" fill="#14532d"/><text x="${lx - 21}" y="${ly - 13}" font-size="9" fill="#fff" text-anchor="middle">${fmt(vals.at(-1))}${unit}</text></svg>`;
}

/* ---------- FORECASTING ---------- */
let LAST = null;
function runForecast() {
  const c = $('#fc-crop').value, ha = parseFloat($('#fc-ha').value); if (!(ha > 0)) return toast('Masukkan luas lahan yang valid');
  const T = TANI[c], f = [+$('#fc-mus').value, +$('#fc-tnh').value, +$('#fc-pup').value], mult = f[0] * f[1] * f[2];
  const ton = ha * T.y * mult, dt = new Date($('#fc-tgl').value || Date.now()); dt.setDate(dt.getDate() + T.d);
  const rev = ton * 1000 * T.p, cost = ha * T.b, profit = rev - cost;
  LAST = { c, ha, ton, f, T, profit, cost, mult };
  $('#r-ic').textContent = T.i; $('#r-crop').textContent = c; $('#r-loc').textContent = '📍 ' + $('#fc-loc').value; $('#r-ton').textContent = d1(ton) + ' Ton';
  $('#r-rng').textContent = `Kisaran ${d1(ton * .92)} – ${d1(ton * 1.08)} Ton`; $('#r-date').textContent = fmtDate(dt); $('#r-hari').textContent = `${T.d} hari setelah tanam (± 1 minggu)`;
  $('#r-chart').innerHTML = lineChart([.05, .35, .7, .92, 1].map(k => +(ton * k).toFixed(2)), ['Tanam', 'Vegetatif', 'Generatif', 'Matang', 'Panen'], v => v.toFixed(1), ' T');
  $('#r-fin').innerHTML = rows([[`Hasil dasar (${d1(ha)} ha × ${T.y} t/ha)`, d1(ha * T.y) + ' Ton'], ['Faktor musim × tanah × pupuk', '× ' + mult.toFixed(3).replace('.', ',')], ['Hasil prediksi', d1(ton) + ' Ton'], [`Harga pasar`, rp(T.p) + '/kg'],
    ['Pendapatan kotor', rp(rev)], [`Biaya produksi (${rp(T.b)}/ha)`, '− ' + rp(cost)], ['Laba bersih', rp(profit), 'tot'], ['ROI', d1(profit / cost * 100) + '%'], ['Harga titik impas', rp(cost / (ton * 1000)) + '/kg']]);
  go('fc-res');
}
function recText() {
  if (!LAST) return '<p class="hint">Jalankan prediksi terlebih dahulu.</p>';
  const L = LAST, best = L.ha * L.T.y * L.f[0] * L.f[1] * 1.08, tips = [];
  if (L.f[2] < 1.08) tips.push(`🌱 Kombinasi Urea + NPK + organik berpotensi menambah <b>${d1(best - L.ton)} Ton</b> (≈ ${rp((best - L.ton) * 1000 * L.T.p)}).`);
  if (L.f[1] < 1) tips.push('🪨 Tanah berpasir: tambahkan bahan organik/kompos agar menahan air dan hara.');
  if (L.f[0] < 1) tips.push('☀ Musim kurang ideal: siapkan irigasi tambahan agar hasil tidak turun.');
  tips.push(`💰 Jual di atas ${rp(L.cost / (L.ton * 1000))}/kg agar tidak rugi; saat ini harga pasar ${rp(L.T.p)}/kg.`);
  tips.push(L.profit > 0 ? '✅ Usaha ini diprediksi menguntungkan. Pertimbangkan agregasi pasokan agar posisi tawar lebih kuat.' : '⚠ Prediksi laba negatif. Tinjau ulang biaya atau pilih komoditas lain.');
  return tips.map(t => `<div class="res"><div>${t}</div></div>`).join('');
}
function onTern() { const p = TN[$('#t-kom').value].fc; $('#t-w').value = p[2]; $('#t-n').value = p[2] > 100 ? 10 : p[2] > 1 ? 20 : 100; }
function runTernak() {
  const k = $('#t-kom').value, P = TN[k], [adg, tgt, , pk, mo] = P.fc, w0 = parseFloat($('#t-w').value), n = parseInt($('#t-n').value);
  if (!(w0 > 0) || !(n > 0)) return toast('Masukkan bobot awal dan jumlah ekor'); if (w0 >= tgt) return toast(`Bobot awal sudah mencapai target (${tgt} kg)`);
  const days = Math.ceil((tgt - w0) / adg), fr = +$('#t-fr').value, st = new Date($('#t-start').value || Date.now()), end = new Date(st); end.setDate(end.getDate() + days);
  const pakan = pk * days * n, nVit = Math.floor(days / fr), vit = nVit * pk * .5 * n, bak = w0 * P.p * .92 * n, hidup = n * (1 - mo / 100), rev = hidup * tgt * P.p, cost = pakan + vit + bak, profit = rev - cost;
  const f = x => w0 + (tgt - w0) * x, dec = tgt < 10 ? 2 : 0;
  $('#t-ic').textContent = P.i; $('#t-nm').textContent = k; $('#t-bln').textContent = `${d1(days / 30.4)} bulan (${days} hari)`; $('#t-tgl').textContent = fmtDate(end);
  $('#t-w0').textContent = d1(w0, dec) + ' kg'; $('#t-w1').textContent = tgt + ' kg';
  $('#t-chart').innerHTML = lineChart([0, .25, .5, .75, 1].map(x => +f(x).toFixed(2)), [0, .25, .5, .75, 1].map(x => Math.round(days * x) + ' hr'), v => v.toFixed(dec), ' kg');
  $('#t-fin').innerHTML = rows([['Pertambahan bobot harian', d1(adg * 1000, 0) + ' gram/hari'], ['Bobot setelah 30 hari', d1(Math.min(tgt, w0 + adg * 30), dec) + ' kg'], [`Pakan (${rp(pk)}/hari × ${days} hr × ${n})`, rp(pakan)], [`Vitamin (${nVit}× pemberian)`, rp(vit)], ['Modal bakalan', rp(bak)], ['Total biaya', rp(cost), 'tot'],
    [`Ternak hidup (mortalitas ${mo}%)`, d1(hidup, 0) + ' ekor'], [`Pendapatan (${tgt} kg × ${rp(P.p)}/kg)`, rp(rev)], ['Laba bersih', rp(profit), 'tot'], ['ROI', d1(profit / cost * 100) + '%']]);
  $('#t-res').classList.remove('hidden'); $('#t-res').scrollIntoView({ behavior: 'smooth' });
}

/* ---------- TRANSPARANSI HARGA ---------- */
const LOC = [['Gowa, Sulsel', .96, -1.8], ['Makassar, Sulsel', 1, 4.2], ['Maros, Sulsel', 1.02, 6.3], ['Takalar, Sulsel', .98, 3.1]];
function series(base, n) { let s = 7, v = base * .9; return Array.from({ length: n }, (_, i) => { s = (s * 9301 + 49297) % 233280; v += (base * (1 - .1 * (1 - i / (n - 1))) - v) * .35 + (s / 233280 - .5) * base * .03; return Math.round(v); }); }
function showPrice(n = 7) {
  const k = $('#p-kom').value, T = TANI[k], p = T.p;
  $('#p-ic').textContent = T.i; $('#p-name').textContent = k; $('#p-val').textContent = rp(p) + '/kg';
  const ch = $('#p-chg'); ch.textContent = chg(T.c); ch.className = T.c >= 0 ? 'up' : 'dn';
  const s = series(p, n), lab = s.map((_, i) => n === 7 ? (10 + i) + ' Apr' : 'H-' + (n - i)), mx = Math.max(...s), mn = Math.min(...s), av = s.reduce((a, b) => a + b, 0) / n;
  $('#p-chart').innerHTML = lineChart(s, lab, v => Math.round(v).toLocaleString('id-ID'), '/kg');
  $('#p-stat').innerHTML = `<span>Tertinggi<b>${rp(mx)}</b></span><span>Terendah<b>${rp(mn)}</b></span><span>Rata-rata<b>${rp(av)}</b></span><span>Volatilitas<b>${d1((mx - mn) / av * 100)}%</b></span>`;
  $('#p-tbl').innerHTML = LOC.map(l => `<tr><td>📍 ${l[0]}</td><td><b>${rp(p * l[1])}</b></td><td class="${l[2] > 0 ? 'up' : 'dn'}">${chg(l[2])}</td><td class="ok">● Tersedia</td></tr>`).join('');
  const sel = $('#pc-loc'), v = sel.selectedIndex; sel.innerHTML = LOC.map(l => `<option>${l[0]}</option>`).join(''); sel.selectedIndex = Math.max(0, v);
  calcSell(); refreshNotif();
}
$('#p-pills').addEventListener('click', e => { if (e.target.tagName !== 'BUTTON') return; [...e.currentTarget.children].forEach(b => b.classList.remove('on')); e.target.classList.add('on'); showPrice([7, 30, 90][[...e.currentTarget.children].indexOf(e.target)]); });
function calcSell() {
  const T = TANI[$('#p-kom').value], vol = pn($('#pc-vol').value), L = LOC[$('#pc-loc').selectedIndex], hi = LOC.reduce((a, b) => b[1] > a[1] ? b : a);
  const tot = vol * T.p * L[1], nat = vol * T.p;
  $('#pc-out').innerHTML = rows([['Harga di ' + L[0], rp(T.p * L[1]) + '/kg'], ['Total nilai jual', rp(tot), 'tot'], ['Selisih vs rata-rata nasional', (tot - nat >= 0 ? '+' : '−') + rp(Math.abs(tot - nat))], [`Jika dijual di ${hi[0]}`, rp(vol * T.p * hi[1])], ['Potensi tambahan', rp(vol * T.p * (hi[1] - L[1]))]]);
}
let pAn = 'Sapi';
function renderAnimal(i) {
  const keys = agKeys(); pAn = keys[i]; const a = TN[pAn];
  $('#a-tabs').innerHTML = keys.map((k, j) => `<button class="${j === i ? 'on' : ''}" onclick="renderAnimal(${j})"><span>${TN[k].i}</span>${k}</button>`).join('');
  $('#a-n').textContent = pAn; $('#a-i').textContent = a.i; $('#a-p').textContent = 'Rp ' + nf(a.p);
  const c = $('#a-c'); c.textContent = chg(a.c); c.className = a.c >= 0 ? 'up' : 'dn';
  const R = [['Jawa Barat', 1, a.c], ['Jawa Tengah', .997, 1.9], ['Jawa Timur', .99, -.6], ['Sumatera Utara', 1.013, 1.3]]; window.REG = R;
  $('#a-reg').innerHTML = R.map(r => `<option>${r[0]}</option>`).join('');
  $('#a-tbl').innerHTML = R.map(r => `<tr><td>${r[0]}</td><td><b>${nf(a.p * r[1])}</b></td><td class="${r[2] >= 0 ? 'up' : 'dn'}">${chg(r[2])}</td></tr>`).join('');
  $('#ac-l1').textContent = `Jumlah (${a.u})`; $('#ac-w').value = a.w; $('#ac-n').value = a.u === 'ekor' ? (a.w > 100 ? 10 : 50) : 1000; calcAnimal(); refreshNotif();
}
function calcAnimal() {
  const a = TN[pAn], n = pn($('#ac-n').value), w = pn($('#ac-w').value), r = REG[$('#a-reg').selectedIndex], kg = n * w, tot = kg * a.p * r[1];
  $('#ac-out').innerHTML = rows([['Total berat', nf(kg) + ' kg'], ['Harga di ' + r[0], rp(a.p * r[1]) + '/kg'], ['Total nilai jual', rp(tot), 'tot'], ['Rata-rata per ' + a.u, rp(n ? tot / n : 0)]]);
}

/* ---------- AGREGASI ---------- */
const PRODS = [['Kelompok Tani Harapan', 'Gowa', .3, 'A'], ['Tani Maju Bersama', 'Maros', .25, 'A'], ['Poktan Sumber Rezeki', 'Takalar', .2, 'A'], ['Petani Mandiri', 'Gowa', .25, 'B+']], SUP = 10000;
let AGC = null;
function calcAgg() {
  const k = $('#ag-kom').value, T = TANI[k], need = pn($('#ag-need').value), take = Math.min(need, SUP);
  const rw = PRODS.map(p => { const al = take * p[2], hg = T.p * (p[3] === 'A' ? 1.03 : 1); return { p, av: SUP * p[2], al, hg, nilai: al * hg }; });
  const tot = rw.reduce((s, r) => s + r.nilai, 0), mt = genPartners(k, 'tani', 0)[0];
  return { k, T, need, take, rw, tot, mitra: mt[1], mic: mt[0], mcity: mt[2], fee: tot * .02, net: tot * .98, cov: need ? Math.min(100, take / need * 100) : 0, avg: take ? tot / take : 0 };
}
function renderAgg() {
  const A = calcAgg(); if (!A.need) { $('#ag-sum').innerHTML = ''; return; }
  $('#ag-list').innerHTML = A.rw.map(r => `<div class="prod"><span>🌿 ${r.p[0]}<small>${r.p[1]} • tersedia ${nf(r.av)} kg • ${rp(r.hg)}/kg</small></span><b>${nf(r.al)} kg</b><span class="grade">Grade ${r.p[3]}</span></div>`).join('') + `<div class="prod"><b>📦 Total Volume Teragregasi</b><b>${nf(A.take)} kg</b></div>`;
  $('#ag-sum').innerHTML = rows([['Mitra pemesan', A.mic + ' ' + A.mitra], ['Total pasokan produsen', nf(SUP) + ' kg'], ['Kebutuhan terpenuhi', d1(A.cov, 0) + '%'], ['Harga rata-rata tertimbang', rp(A.avg) + '/kg'], ['Nilai total', rp(A.tot)], ['Biaya layanan 2%', '− ' + rp(A.fee)], ['Diterima produsen', rp(A.net), 'tot']] .concat(A.need > SUP ? [['Kekurangan pasokan', nf(A.need - SUP) + ' kg', 'warn']] : []));
}
function startAgg() {
  AGC = calcAgg(); if (!AGC.need) return toast('Isi kebutuhan mitra');
  go('ag-prog'); $('#g-em').textContent = AGC.T.i; const bar = $('#g-bar'), li = $$('#g-list li'); let p = 0; bar.style.width = '0'; $('#g-pc').textContent = '0%';
  wait(i => {
    p++; bar.style.width = p + '%'; $('#g-pc').textContent = p + '%'; const st = Math.min(3, Math.floor(p / 25));
    li.forEach((l, k) => l.className = k < st ? 'done' : k === st ? 'cur' : '');
    if (p >= 100) { clearInterval(i); li.forEach(l => l.className = 'done'); setTimeout(() => { renderAggDone(); go('ag-done', false, true); }, 700); }
  }, 65);
}
function renderAggDone() {
  const A = AGC; $('#d-ic').textContent = A.T.i; $('#d-kom').textContent = A.k; $('#d-loc').textContent = '🤝 ' + A.mitra + ' • 📍 ' + A.mcity + ', Sulawesi Selatan'; $('#d-need').textContent = $('#d-need2').textContent = nf(A.need) + ' kg'; $('#d-vol').textContent = nf(A.take) + ' kg';
  $('#d-ring').style.setProperty('--p', A.cov + '%'); $('#d-pc').textContent = d1(A.cov, 0) + '%';
  $('#d-ok').textContent = A.cov >= 100 ? '✔ Kebutuhan telah terpenuhi!' : `⚠ Terpenuhi sebagian, kurang ${nf(A.need - A.take)} kg`; $('#d-ok').className = 'card ' + (A.cov >= 100 ? 'ok' : 'warn');
  $('#d-tbl').innerHTML = `<table><tr><th>Produsen</th><th>Volume</th><th>Diterima (−2%)</th></tr>${A.rw.map(r => `<tr><td>${r.p[0]}</td><td>${nf(r.al)} kg</td><td><b>${rp(r.nilai * .98)}</b></td></tr>`).join('')}<tr><td><b>Total</b></td><td><b>${nf(A.take)} kg</b></td><td><b>${rp(A.net)}</b></td></tr></table>`;
}
let agSel = 'Sapi'; const AGT = {};
const agS = k => AGT[k] || (AGT[k] = { tot: Math.round(TN[k].tg * .76), far: Math.max(3, Math.round(TN[k].tg * .24 / (TN[k].tg > 500 ? 20 : 1))) });
function renderAggTabs(pre) {
  const keys = agKeys(), a = TN[agSel], S = agS(agSel), T = a.tg, add = parseInt($('#g-add').value) || 0;
  if (!pre) { $('#g-tabs').innerHTML = keys.map(k => `<button class="${k === agSel ? 'on' : ''}" onclick="agSel='${k}';$('#g-add').value=Math.max(1,Math.round(TN[agSel].tg*.1));renderAggTabs()"><span>${TN[k].i}</span>${k}</button>`).join(''); }
  const pc = Math.round(S.tot / T * 100), nl = a.w * a.p;
  $('#g-lab').textContent = `Jumlah ${a.u} yang diajukan`; $('#g-st').textContent = `${agSel} – Permintaan Pasar: ${nf(T)} ${a.u} • Terkumpul ${nf(S.tot)} ${a.u} (${pc}%)`; $('#gt-bar').style.width = pc + '%';
  $('#g-det').innerHTML = rows([['Jumlah peternak bergabung', S.far + ' peternak'], ['Total pasokan terkumpul', nf(S.tot) + ' ' + a.u], ['Target permintaan', nf(T) + ' ' + a.u], ['Kekurangan', nf(Math.max(0, T - S.tot)) + ' ' + a.u], ['Rata-rata per peternak', nf(S.tot / S.far) + ' ' + a.u], ['Nilai pasokan terkumpul', rp(S.tot * nl)], ['Nilai target', rp(T * nl)], ['Estimasi pengiriman', '20 Des 2026']]);
  const eff = Math.min(add, T - S.tot); $('#g-pre').innerHTML = rows([['Nilai pasokan Anda', rp(Math.max(0, eff) * nl)], ['Setelah bergabung', d1(Math.min(100, (S.tot + Math.max(0, eff)) / T * 100), 0) + '% dari target']]);
}
function addSupply() {
  const S = agS(agSel), T = TN[agSel].tg, n = parseInt($('#g-add').value); if (!(n > 0)) return toast('Masukkan jumlah yang valid');
  if (S.tot >= T) return toast('Target permintaan sudah terpenuhi 🎉');
  S.tot = Math.min(T, S.tot + n); S.far++; renderAggTabs(); toast(S.tot >= T ? 'Target terpenuhi! 🎉' : `+${nf(n)} bergabung ke agregasi ✔`);
}

/* ---------- LOGISTIK (truk bergerak) ---------- */
const LG = { tot: 115, seg: 75, v: 33, truk: 2, load: 10000, price: 28500, t0: .35, dur: 30000 };
const TR = { t: LG.t0, play: false, last: 0, raf: 0 };
function initLogistik() {
  const A = AGC; LG.load = A ? A.take : 10000; LG.price = A ? A.T.p : 28500;
  $('#lg-ic').textContent = A ? A.T.i : '🌶'; $('#lg-kom').textContent = A ? A.k : 'Cabai Merah'; $('#lg-vol').textContent = nf(LG.load) + ' kg';
  $('#lg-mit').textContent = A ? A.mitra : 'PT Segar Nusantara'; $('#lg-loc').textContent = '📍 ' + (A ? A.mcity : 'Makassar') + ', Sulawesi Selatan'; $('#lg-mc').textContent = '(' + (A ? A.mcity : 'Makassar') + ')';
  const bbm = LG.tot / 6 * 6800, per = bbm + 350000 + 50000, asu = LG.load * LG.price * .003, total = per * LG.truk + asu;
  $('#lg-cost').innerHTML = rows([[`Armada (${LG.truk} truk × 5 ton)`, LG.truk + ' unit'], [`BBM (${LG.tot} km ÷ 6 km/L × Rp6.800)`, rp(bbm * LG.truk)], ['Sopir & kernet', rp(350000 * LG.truk)], ['Tol & retribusi', rp(50000 * LG.truk)], ['Asuransi muatan 0,3%', rp(asu)], ['Total biaya logistik', rp(total), 'tot'], ['Biaya per kg', rp(total / LG.load) + '/kg'], ['Persentase dari nilai muatan', d1(total / (LG.load * LG.price) * 100) + '%']]);
  const L = $('#seg2').getTotalLength(); $('#seg2p').style.strokeDasharray = L; TR.L = L; startTruck(true);
}
function placeTruck(t) {
  const s = $('#seg2'), L = TR.L, p = s.getPointAtLength(L * t), q = s.getPointAtLength(Math.min(L, L * t + 1)), sx = q.x - p.x < 0 ? -1 : 1;
  $('#truck').setAttribute('transform', `translate(${p.x} ${p.y - 6}) scale(${sx} 1)`); $('#seg2p').style.strokeDashoffset = L * (1 - t);
}
function updLg(t, now) {
  const sisa = LG.seg * (1 - t), min = sisa / LG.v * 60, eta = new Date(Date.now() + min * 60000), v = t >= 1 ? 0 : LG.v * (1 + .22 * Math.sin(now / 700));
  $('#lg-km').textContent = d1(sisa) + ' km'; $('#lg-t').textContent = t >= 1 ? '0 menit' : `± ${Math.floor(min / 60)} jam ${Math.round(min % 60)} mnt`; $('#lg-eta').textContent = t >= 1 ? 'Tiba' : 'Hari ini, ' + hhmm(eta);
  $('#lg-v').textContent = Math.round(v) + ' km/jam'; $('#lg-p').textContent = Math.round(t * 100) + '%'; $('#lg-bar').style.width = t * 100 + '%';
  const done = t >= 1; $('#lg-s3').className = done ? 'done' : 'cur'; $('#lg-s4').className = done ? 'done' : ''; $('#lg-s4').firstChild.textContent = done ? '✓' : ''; $('#lg-st').textContent = done ? 'Tiba di Tujuan ✔' : 'Pengiriman Berlangsung';
}
function tick(now) {
  if (cur !== 'logistik') { TR.play = false; return; }
  if (TR.play) { TR.t = Math.min(1, TR.t + (now - TR.last) / LG.dur * (1 - LG.t0)); if (TR.t >= 1) { TR.play = false; $('#lg-btn').textContent = '↻ Putar Ulang Pelacakan'; toast('Pengiriman tiba di tujuan 🎉'); } }
  TR.last = now; placeTruck(TR.t); updLg(TR.t, now); TR.raf = requestAnimationFrame(tick);
}
function startTruck(reset) { if (reset) TR.t = LG.t0; TR.play = true; $('#lg-btn').textContent = '⏸ Jeda Pelacakan'; TR.last = performance.now(); cancelAnimationFrame(TR.raf); TR.raf = requestAnimationFrame(tick); }
function trackTruck() {
  if (TR.t >= 1) return startTruck(true);
  TR.play = !TR.play; TR.last = performance.now(); $('#lg-btn').textContent = TR.play ? '⏸ Jeda Pelacakan' : '▶ Lanjutkan Pelacakan'; toast(TR.play ? 'Melacak armada…' : 'Pelacakan dijeda');
}

/* ---------- START ---------- */
fillSel($('#fc-crop'), Object.keys(TANI), 'Cabai Merah'); fillSel($('#p-kom'), Object.keys(TANI), 'Cabai Merah'); fillSel($('#ag-kom'), Object.keys(TANI), 'Cabai Merah');
fillSel($('#t-kom'), agKeys().filter(k => TN[k].fc), 'Sapi');
applyImages(); renderProfile(); applySettings();
go('splash', true);
setTimeout(() => cur === 'splash' && go('login', true), 2300);


/* ===== ANIMASI DASHBOARD ===== */
function initDashFx() {
  const hero = document.querySelector('#dash .dhero');
  if (!hero || hero.querySelector('.dfx')) return;
  const fx = document.createElement('div'); fx.className = 'dfx'; fx.setAttribute('aria-hidden', 'true');
  let h = '<i class="orb o1"></i><i class="orb o2"></i>';
  for (let i = 0; i < 12; i++) {
    const l = 4 + Math.random() * 92, d = Math.random() * 9, t = 9 + Math.random() * 8, z = 8 + Math.random() * 10;
    h += `<i class="leaf" style="left:${l}%;width:${z}px;height:${z}px;animation-duration:${t}s,${(t / 2).toFixed(1)}s;animation-delay:-${d}s,-${d}s"></i>`;
  }
  fx.innerHTML = h; hero.insertBefore(fx, hero.firstChild);
}
function countUp(el, dur = 1000) {
  const m = el.textContent.match(/^(\D*)([\d.,]+)(.*)$/); if (!m) return;
  const to = parseInt(m[2].replace(/[.,]/g, ''), 10); if (isNaN(to) || to < 1) return;
  cancelAnimationFrame(el._raf); const t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
    el.textContent = m[1] + Math.round(to * e).toLocaleString('id-ID') + m[3];
    if (k < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}
function playDash() {
  const d = document.getElementById('dash'); if (!d) return;
  if (!ST.set.hemat && ST.set.anim) initDashFx();
  d.classList.remove('danim'); void d.offsetWidth; d.classList.add('danim');
  if (!ST.set.anim || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  ['#d-kp', '#d-kh', '#d-stok'].forEach(q => { const e = d.querySelector(q); e && countUp(e); });
  d.querySelectorAll('.dact b').forEach(e => countUp(e, 800));
}
