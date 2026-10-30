const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const root = document.documentElement;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

let lang = (() => { try { return localStorage.getItem('lang'); } catch (e) { return null; } })() || 'pt';
const L = (p, e) => lang === 'en' ? e : p;

let C = {};
function cols() {
  const s = getComputedStyle(root);
  C = {
    a: s.getPropertyValue('--a').trim(),
    b: s.getPropertyValue('--b').trim(),
    c: s.getPropertyValue('--c').trim()
  };
}
cols();

$('#theme').onclick = () => {
  const dark = getComputedStyle(root).getPropertyValue('--bg').trim() === '#07080d';
  root.dataset.theme = dark ? 'light' : 'dark';
  cols();
};

/* contador de abertura: 0 a 100 */
(function () {
  const pl = $('#pl'), num = $('#pn'), bar = $('#pb');
  root.classList.add('ld');
  const D = matchMedia('(prefers-reduced-motion:reduce)').matches ? 400 : 1500, t0 = performance.now();
  (function f(now) {
    const t = Math.min((now - t0) / D, 1), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, v = Math.round(e * 100);
    num.textContent = v;
    bar.style.transform = 'scaleX(' + (v / 100) + ')';
    if (t < 1) requestAnimationFrame(f);
    else setTimeout(() => {
      document.body.classList.add('ready');
      pl.classList.add('out');
      root.classList.remove('ld');
      setTimeout(() => pl.remove(), 700);
    }, 150);
  })(t0);
})();

/* rede de partículas que reage ao mouse */
const cv = $('#bg'), cx = cv.getContext('2d');
let W, H, P = [], M = { x: -999, y: -999 };

function size() {
  const d = devicePixelRatio || 1;
  W = innerWidth;
  H = innerHeight;
  cv.width = W * d;
  cv.height = H * d;
  cx.setTransform(d, 0, 0, d, 0, 0);
  P = Array.from({ length: Math.min(90, Math.floor(W * H / 14000)) }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.6 + .8
  }));
}

function tick() {
  cx.clearRect(0, 0, W, H);
  for (const p of P) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    const dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy) || 1;
    if (d < 140) {
      p.x += dx / d * 1.4;
      p.y += dy / d * 1.4;
    }
  }
  for (let i = 0; i < P.length; i++) {
    const p = P[i];
    cx.globalAlpha = .7;
    cx.fillStyle = C.a;
    cx.beginPath();
    cx.arc(p.x, p.y, p.r, 0, 7);
    cx.fill();
    for (let j = i + 1; j < P.length; j++) {
      const q = P[j], d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 130) {
        cx.globalAlpha = (1 - d / 130) * .35;
        cx.strokeStyle = C.b;
        cx.beginPath();
        cx.moveTo(p.x, p.y);
        cx.lineTo(q.x, q.y);
        cx.stroke();
      }
    }
    const d = Math.hypot(p.x - M.x, p.y - M.y);
    if (d < 170) {
      cx.globalAlpha = (1 - d / 170) * .8;
      cx.strokeStyle = C.c;
      cx.beginPath();
      cx.moveTo(p.x, p.y);
      cx.lineTo(M.x, M.y);
      cx.stroke();
    }
  }
  requestAnimationFrame(tick);
}
size();
addEventListener('resize', size);
tick();

/* explosão de partículas ao commitar */
const fx = $('#fx'), fc = fx.getContext('2d');
let B = [], run = 0;

function burst(x, y, n = 54) {
  fx.width = innerWidth;
  fx.height = innerHeight;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.28, s = 2 + Math.random() * 5;
    B.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3, l: 70, c: [C.a, C.b, C.c][i % 3] });
  }
  if (!run) {
    run = 1;
    (function f() {
      fc.clearRect(0, 0, fx.width, fx.height);
      B = B.filter(b => b.l-- > 0);
      B.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.vy += .12;
        fc.globalAlpha = b.l / 70;
        fc.fillStyle = b.c;
        fc.fillRect(b.x, b.y, 4, 4);
      });
      B.length ? requestAnimationFrame(f) : (run = 0, fc.clearRect(0, 0, fx.width, fx.height));
    })();
  }
}

/* cursor glow + parallax do terminal */
addEventListener('pointermove', e => {
  M.x = e.clientX;
  M.y = e.clientY;
  root.style.setProperty('--gx', e.clientX + 'px');
  root.style.setProperty('--gy', e.clientY + 'px');
  const t = $('.term');
  t.style.setProperty('--ty', ((e.clientX / innerWidth - .5) * -16) + 'deg');
  t.style.setProperty('--tx', ((e.clientY / innerHeight - .5) * 10) + 'deg');
});

/* digitação dos cargos */
const RE = ['Full Stack developer in training', 'React · TypeScript · Tailwind', 'B.Sc. in Computer Science', 'Freelance: landing pages & dashboards'];
const RP = ['Full Stack em formação', 'React · TypeScript · Tailwind', 'Bacharel em Ciência da Computação', 'Freelancer: landing pages e dashboards'];
const roles = () => L(RP, RE);
let ri = 0, ci = 0, del = false;

(function type() {
  const r = roles()[ri];
  $('#role').textContent = r.slice(0, ci);
  if (!del && ci < r.length) ci++;
  else if (!del) { del = true; return setTimeout(type, 1500); }
  else if (ci > 0) ci--;
  else { del = false; ri = (ri + 1) % roles().length; }
  setTimeout(type, del ? 28 : 65);
})();

/* revelação ao rolar + contadores + trilho de progresso */
function count(el) {
  const n = +el.dataset.n;
  let t = 0;
  (function f() {
    t = Math.min(t + 1 / 45, 1);
    el.textContent = Math.round(n * t * (2 - t));
    if (t < 1) requestAnimationFrame(f);
  })();
}

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('in');
    io.unobserve(e.target);
    if (e.target.dataset.n) count(e.target);
  }
}), { threshold: .15 });

const watch = () => $$('.rv:not(.in),.sec:not(.in),[data-n]').forEach(e => io.observe(e));
watch();

addEventListener('scroll', () => {
  $('#fill').style.transform = 'scaleY(' + (scrollY / (root.scrollHeight - innerHeight || 1)) + ')';
}, { passive: true });

/* marquee de tecnologias */
const rows = {
  m1: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'Vite', 'Firebase', 'HTML5', 'CSS3'],
  m2: ['Git', 'Vercel', 'Python 3', 'Excel', 'Context API', 'Recharts', 'Packet Tracer', 'UX/UI']
};
for (const k in rows) {
  const h = rows[k].map(t => `<span class="chip">${t}</span>`).join('');
  $('#' + k).innerHTML = h + h;
}

/* projetos */
const G = 'https://github.com/aragonp1/';
const PR = [
  { n: 'Catálogo Digital & Pedidos', d: 'Para o comércio local: navegue pelos produtos, monte o carrinho e envie o pedido direto para o WhatsApp da loja.', t: ['React', 'Tailwind', 'Context API'], u: 'https://github.com/aragonp1' },
  { n: 'Dashboard Financeiro Pro', d: 'Painel para microempresas e autônomos, com gráficos interativos e filtros de transações em tempo real.', t: ['React', 'TypeScript', 'Tailwind', 'Recharts'], u: 'https://github.com/aragonp1' },
  { n: 'conviteteste', d: 'Convite de casamento digital.', t: ['TypeScript'], u: G + 'conviteteste' },
  { n: 'Projeto-Marketing-Tech', d: 'Projeto pessoal desenvolvido em TypeScript.', t: ['TypeScript'], u: G + 'Projeto-Marketing-Tech' },
  { n: 'chadecasanova', d: 'Projeto pessoal desenvolvido em TypeScript.', t: ['TypeScript'], u: G + 'chadecasanova' },
  { n: 'fasciculo', d: 'Fascículo digital: um teste de HTML estilizado com CSS.', t: ['HTML', 'CSS'], u: G + 'fasciculo' }
];

$('#grid').innerHTML = PR.map((p, i) => `<div class="rv in" style="--d:${i * .08}s" data-t="${p.t.join(',')}"><a class="card" href="${p.u}" target="_blank" rel="noopener"><span class="go">↗</span><span class="repo">aragonp1/${p.n}</span><h3>${p.n}</h3><p>${p.d}</p><div class="tags">${p.t.map(t => `<span>${t}</span>`).join('')}</div></a></div>`).join('');
$('#fl').innerHTML = ['Todos', 'React', 'TypeScript', 'CSS'].map((f, i) => `<button class="f${i ? '' : ' on'}" data-f="${f}">${f}</button>`).join('');

$('#fl').onclick = e => {
  const b = e.target.closest('.f');
  if (!b) return;
  $$('.f').forEach(x => x.classList.toggle('on', x === b));
  $$('#grid>div').forEach(w => {
    const ok = b.dataset.f === 'Todos' || w.dataset.t.split(',').includes(b.dataset.f);
    w.hidden = !ok;
    if (ok) {
      w.classList.add('in');
      const c = w.firstChild;
      c.classList.remove('pop');
      void c.offsetWidth;
      c.classList.add('pop');
    }
  });
};

$$('.card').forEach(c => {
  c.onpointermove = e => {
    const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    c.style.setProperty('--mx', x * 100 + '%');
    c.style.setProperty('--my', y * 100 + '%');
    c.style.setProperty('--rx', (.5 - y) * 10 + 'deg');
    c.style.setProperty('--ry', (x - .5) * 12 + 'deg');
  };
  c.onpointerleave = () => {
    c.style.setProperty('--rx', '0deg');
    c.style.setProperty('--ry', '0deg');
  };
});

/* cursor personalizado: ponto + anel com inércia que cresce sobre elementos clicáveis */
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const cd = $('#cd'), cr = $('#cr');
let px = innerWidth / 2, py = innerHeight / 2, rx = px, ry = py;

if (fine) {
  root.classList.add('cc');
  cd.style.transform = cr.style.transform = `translate(${px}px,${py}px)`;
  addEventListener('pointermove', e => {
    px = e.clientX;
    py = e.clientY;
    cd.style.transform = `translate(${px}px,${py}px)`;
    cr.classList.toggle('link', !!(e.target.closest && e.target.closest('a,button,input,textarea,select,.f,.tw')));
  }, { passive: true });
  addEventListener('pointerdown', () => cr.classList.add('down'));
  addEventListener('pointerup', () => cr.classList.remove('down'));
  (function f() {
    rx += (px - rx) * .16;
    ry += (py - ry) * .16;
    cr.style.transform = `translate(${rx}px,${ry}px)`;
    requestAnimationFrame(f);
  })();
}

/* gráfico de atividade: dados ao vivo do GitHub quando a rede permite; senão, commits deixados neste site */
const gr = $('#gr');
let live = null, painted = false;
const key = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

fetch('https://github-contributions-api.jogruber.de/v4/aragonp1?y=last').then(r => r.json()).then(j => {
  if (j && Array.isArray(j.contributions)) {
    live = new Map(j.contributions.map(c => [c.date, c.count]));
    paint();
  }
}).catch(() => {});

let repos = 9;
fetch('https://api.github.com/users/aragonp1').then(r => r.json()).then(j => {
  if (j && Number.isInteger(j.public_repos) && j.public_repos > 0) {
    repos = j.public_repos;
    const el = $('#nrep');
    el.dataset.n = repos;
    if (el.classList.contains('in')) count(el);
  }
}).catch(() => {});

function paint() {
  const m = new Map();
  if (live) live.forEach((v, k) => m.set(k, v));
  else for (const c of [...all, ...mine]) {
    if (c && c.ts) {
      const k = key(new Date(+c.ts));
      m.set(k, (m.get(k) || 0) + 1);
    }
  }
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const st = new Date(t);
  st.setDate(t.getDate() - t.getDay() - 364);
  let mx = 1, h = '', sum = 0, i = 0;
  m.forEach(v => { mx = Math.max(mx, v); });
  for (const d = new Date(st); d <= t; d.setDate(d.getDate() + 1), i++) {
    const k = key(d), n = m.get(k) || 0;
    sum += n;
    h += `<i class="g${n ? Math.ceil(4 * n / mx) : 0}${painted ? '' : ' an'}" style="${painted ? '' : 'animation-delay:' + i * 3 + 'ms'}" title="${n} · ${k}"></i>`;
  }
  gr.innerHTML = h;
  if (!painted) {
    painted = true;
    gr.scrollLeft = gr.scrollWidth;
  }
  $('#gcap').textContent = sum + ' ' + (live ? L('contribuições no último ano', 'contributions in the last year') : L('commits deixados neste site no último ano', 'commits left on this site in the last year'));
}

/* commit em qualquer lugar da página */
const MSG = ['feat: adiciona um toque de mágica', 'fix: corrige bug que só acontecia em produção', 'chore: reabastece o café', 'refactor: renomeia variável pela quinta vez', 'feat: visitante legal detectado', 'docs: atualiza o README (mentira)', 'perf: remove um console.log esquecido', 'style: alinha um pixel que ninguém notou', 'test: funciona na minha máquina', 'feat: dark mode às 3h da manhã', 'fix: era só um ponto e vírgula', 'chore: apaga código comentado de 2021'];
const MSGE = ['feat: adds a touch of magic', 'fix: squashes a bug that only happened in production', 'chore: refills the coffee', 'refactor: renames a variable for the fifth time', 'feat: nice visitor detected', 'docs: updates the README (lie)', 'perf: removes a forgotten console.log', 'style: aligns a pixel nobody noticed', 'test: works on my machine', 'feat: dark mode at 3am', 'fix: it was just a semicolon', 'chore: deletes commented code from 2021'];
const hash = s => {
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 7);
};

const LS = 'alisson-commits-v2';
let db = null, uid = null, mode = 'local', ready = false, ro = false, mine = [], all = [], who = 'visitante-' + hash(String(Math.random())).slice(0, 4), last = 0, timer = 0, saving = 0, dirty = 0;

function total() {
  const u = new Set();
  for (const c of [...all, ...mine]) if (c && typeof c === 'object' && c.h && c.m) u.add(String(c.h));
  const b = $('#cnt');
  b.textContent = u.size;
  b.classList.remove('bump');
  void b.offsetWidth;
  b.classList.add('bump');
  paint();
}

function hint() {
  $('#hint').textContent = ro ? L('clique em qualquer lugar · somente leitura, não será salvo', 'click anywhere · read-only, not saved') : mode === 'local' ? L('clique em qualquer lugar · salvo só neste navegador', 'click anywhere · saved only in this browser') : L('clique ou toque em qualquer lugar para commitar', 'click or tap anywhere to commit');
}

async function flush() {
  if (saving) { timer = setTimeout(flush, 400); return; }
  if (!dirty) return;
  dirty = 0; saving = 1;
  try { await db.collection('commits').doc(uid).set({ items: mine }); } catch (e) { ro = true; hint(); }
  saving = 0;
}

function pop(x, y, c) {
  const p = document.createElement('div'), r = document.createElement('div'), k = document.createElement('code');
  r.className = 'rp';
  r.style.left = x + 'px';
  r.style.top = y + 'px';
  p.className = 'cp';
  p.style.left = Math.max(10, Math.min(x + 14, innerWidth - 262)) + 'px';
  p.style.top = Math.max(80, y - 44) + 'px';
  k.textContent = '[' + c.h + ']';
  p.append(k, c.m);
  document.body.append(r, p);
  setTimeout(() => { r.remove(); p.remove(); }, 2500);
}

function commit(cX, cY) {
  const c = { h: hash(who + Math.random() + t), m: L(MSG, MSGE)[Math.random() * MSG.length | 0], a: who, ts: t };
  pop(cX, cY, c);
  burst(cX, cY, 26);
  mine = [...mine, c].slice(-500);
  total();
  if (mode === 'local') {
    try { localStorage.setItem(LS, JSON.stringify(mine)); } catch (e) {}
  } else if (ready && !ro) {
    dirty = 1;
    clearTimeout(timer);
    timer = setTimeout(flush, 0);
  }
}

addEventListener('click', e => {
  if (e.target.closest && e.target.closest('a,button,input,textarea,select,label,.tw')) return;
  commit(e.clientX, e.clientY);
});

function local() {
  mode = 'local';
  try { mine = JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { mine = []; }
  if (!Array.isArray(mine)) mine = [];
  total();
  hint();
}

(async () => {
  let d = null;
  try {
    const [a, u] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (a && u) { uid = await u.id(); d = uid ? a : null; }
  } catch (e) {}
  
  if (!d) return local();
  db = d;
  mode = 'shared';
  who = 'visitante-' + hash(String(uid)).slice(0, 4);
  hint();
  
  db.collection('commits').onSnapshot(s => {
    all = [];
    for (const x of s.docs) {
      const it = (x.data() || {}).items;
      if (Array.isArray(it) && x.id !== uid) all = all.concat(it);
    }
    const m = s.docs.find(x => x.id === uid);
    if (m && !dirty && !saving) {
      const it = (m.data() || {}).items;
      if (Array.isArray(it)) mine = it;
    }
    ready = true;
    total();
  }, () => local());
})();

total();

/* formulário de contato: monta a mensagem e abre direto no WhatsApp */
$('#cf').onsubmit = e => {
  e.preventDefault();
  const f = e.target, g = n => f.elements[n].value.trim();
  const txt = L('Olá, Alisson! Vim pelo seu portfólio.\n\n*Nome:* ', 'Hi Alisson! I found you through your portfolio.\n\n*Name:* ') + g('nome') + L('\n*E-mail:* ', '\n*Email:* ') + g('email') + L('\n*Assunto:* ', '\n*Subject:* ') + g('assunto') + L('\n\n*Mensagem:*\n', '\n\n*Message:*\n') + g('msg');
  const url = 'https://wa.me/5585991984804?text=' + encodeURIComponent(txt);
  window.open(url, '_blank', 'noopener');
  
  const st = $('#cst'), a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = L('toque aqui', 'tap here');
  st.textContent = L('Abrindo o WhatsApp… se não abrir, ', 'Opening WhatsApp… if it doesn’t open, ');
  st.append(a, '.');
  
  const r = f.querySelector('button').getBoundingClientRect();
  burst(r.left + r.width / 2, r.top, 40);
};

/* terminal interativo */
const out = $('#out'), ti = $('#ti'), hist = [];
let hi = 0;

const pr = (t, c) => {
  const d = document.createElement('div');
  if (c) d.className = c;
  d.textContent = t;
  out.append(d);
  out.scrollTop = out.scrollHeight;
};

const AL = { sobre: 'about', projetos: 'projects', habilidades: 'skills', trajetoria: 'experience', contato: 'contact', limpar: 'clear', idioma: 'lang', tema: 'theme', ajuda: 'help' };

const CMD = {
  help: () => [L('comandos disponíveis:', 'available commands:'), '  about · projects · skills · experience', '  contact · github · commits', '  theme · lang · clear · ls', L('dica: existe um comando secreto com sudo…', 'hint: there is a secret command with sudo…')],
  about: () => ['Alisson Aragão · ' + L('Desenvolvedor Full Stack em formação', 'Full Stack developer in training'), L('Bacharel em Ciência da Computação (Estácio) · Fortaleza, CE', 'B.Sc. in Computer Science (Estácio) · Fortaleza, Brazil'), L('Foco atual: React, TypeScript e Tailwind CSS.', 'Current focus: React, TypeScript and Tailwind CSS.')],
  projects: () => PR.map(p => '  ' + p.n + '  [' + p.t.join(', ') + ']'),
  skills: () => ['React · TypeScript · JavaScript · Tailwind CSS', 'Vite · Firebase · HTML5 · CSS3', 'Git · Vercel · Python 3 · Excel'],
  experience: () => [L('nov 2024 → atual · Assistente educacional · Fundação Demócrito Rocha', 'Nov 2024 → present · Educational assistant · Fundação Demócrito Rocha'), L('2021–2025 · Bacharelado em Ciência da Computação · Estácio', '2021–2025 · B.Sc. in Computer Science · Estácio'), L('out–nov 2023 · Assistente administrativo · AGC Fitness', 'Oct–Nov 2023 · Administrative assistant · AGC Fitness'), L('2021 · Professor de informática · Curso Professor Airley', '2021 · Computer science teacher · Curso Professor Airley')],
  contact: () => ['email     alissonaragao000@gmail.com', 'linkedin  linkedin.com/in/alissonaragao', 'github    github.com/aragonp1', L('ou use o formulário abaixo ↓', 'or use the form below ↓')],
  github: () => ['github.com/aragonp1', repos + ' ' + L('repositórios públicos', 'public repositories')],
  commits: () => [$('#cnt').textContent + ' ' + L('commits deixados neste site', 'commits left on this site')],
  ls: () => ['projects/  skills/  contact.txt'],
  whoami: () => [L('um visitante curioso 👀', 'a curious visitor 👀')],
  theme: () => { $('#theme').click(); return [L('tema alternado', 'theme toggled')]; },
  lang: () => { $('#lang').click(); return []; },
  clear: () => { out.textContent = ''; return []; }
};

function sudo(a) {
  if (a === 'hire alisson') {
    setTimeout(() => $('#contato').scrollIntoView({ behavior: 'smooth' }), 700);
    return ['[sudo] ' + L('permissão concedida', 'permission granted') + ' ✓', L('rolando até o contato…', 'scrolling to contact…')];
  }
  return [L('nice try. você não está no arquivo sudoers 😉', 'nice try. you are not in the sudoers file 😉')];
}

function exec(v) {
  const raw = v.trim();
  pr('$ ' + raw, 'a');
  if (!raw) return;
  hist.push(raw);
  hi = hist.length;
  const [c0, ...rest] = raw.split(/\s+/);
  const c = AL[c0.toLowerCase()] || c0.toLowerCase();
  const r = c === 'sudo' ? sudo(rest.join(' ').toLowerCase()) : CMD[c] ? CMD[c]() : [L('comando não encontrado: ', 'command not found: ') + c0, L('digite help', 'type help')];
  r.forEach(l => pr(l));
}

function boot() {
  out.textContent = '';
  pr(L('Terminal do Alisson v1.0 · digite help para começar', 'Alisson’s terminal v1.0 · type help to get started'), 'm');
}

$('#tf').onsubmit = e => {
  e.preventDefault();
  exec(ti.value);
  ti.value = '';
};

ti.onkeydown = e => {
  if (e.key === 'ArrowUp' && hist.length) {
    e.preventDefault();
    hi = Math.max(0, hi - 1);
    ti.value = hist[hi];
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    hi = Math.min(hist.length, hi + 1);
    ti.value = hist[hi] || '';
  } else if (e.key === 'Tab') {
    e.preventDefault();
    const m = Object.keys(CMD).filter(k => k.startsWith(ti.value.trim().toLowerCase()));
    if (m.length === 1) ti.value = m[0];
  }
};

$('.tw').onclick = () => ti.focus({ preventScroll: true });

/* idioma PT/EN: troca o texto de toda a página */
const EN = {
  'sobre': 'about', 'projetos': 'projects', 'trajetória': 'journey', 'contato': 'contact', '> olá, mundo. eu sou': '> hello, world. i’m',
  'Desenvolvedor Web e Bacharel em Ciência da Computação. Construo aplicações modernas com React, TypeScript, Tailwind CSS e Firebase, sempre de olho em UX e performance.': 'Web developer with a B.Sc. in Computer Science. I build modern applications with React, TypeScript, Tailwind CSS and Firebase, always with an eye on UX and performance.',
  'ver projetos': 'view projects', 'Bacharelado em Ciência da Computação': 'B.Sc. in Computer Science', 'Catálogo digital com pedido no WhatsApp': 'Digital catalog with WhatsApp ordering', 'Dashboard Financeiro Pro': 'Financial Dashboard Pro', 'aberto a freelas ✦': 'open to freelance ✦',
  'feat: sobre mim': 'feat: about me',
  'Mexo com computador desde pequeno e acompanho de perto a evolução da tecnologia. Hoje meu foco é': 'I’ve been into computers since I was a kid and closely follow how technology evolves. Today my focus is',
  'React, TypeScript e Tailwind CSS': 'React, TypeScript and Tailwind CSS',
  '. Também tenho histórico no ensino de informática e na resolução de problemas práticos de hardware e sistemas. Fora do código: videogames, séries e filmes.': '. I also have a background teaching computer science and solving practical hardware and systems problems. Outside of code: video games, TV shows and movies.',
  'repositórios públicos': 'public repositories', 'certificações': 'certifications', 'bacharelado concluído': 'completed bachelor’s degree',
  'feat: projetos': 'feat: projects', 'Todos': 'All', 'Catálogo Digital & Pedidos': 'Digital Catalog & Orders',
  'Para o comércio local: navegue pelos produtos, monte o carrinho e envie o pedido direto para o WhatsApp da loja.': 'For local businesses: browse products, build a cart and send the order straight to the store’s WhatsApp.',
  'Painel para microempresas e autônomos, com gráficos interativos e filtros de transações em tempo real.': 'Dashboard for small businesses and freelancers, with interactive charts and real-time transaction filters.',
  'Convite de casamento digital.': 'Digital wedding invitation.', 'Projeto pessoal desenvolvido em TypeScript.': 'Personal project built with TypeScript.', 'Fascículo digital: um teste de HTML estilizado com CSS.': 'Digital booklet: an HTML experiment styled with CSS.',
  'feat: atividade no GitHub': 'feat: GitHub activity', 'menos': 'less', 'mais': 'more',
  'Curioso? Abra o terminal e digite': 'Curious? Open the terminal and type', '. Tem ovo de páscoa escondido.': '. There’s a hidden easter egg.',
  'chore: trajetória': 'chore: journey', 'nov 2024 → atual': 'Nov 2024 → present', 'jan 2021 → nov 2025': 'Jan 2021 → Nov 2025', 'out → nov 2023': 'Oct → Nov 2023', 'fev → nov 2021': 'Feb → Nov 2021',
  'Assistente educacional': 'Educational assistant', 'Assistente administrativo': 'Administrative assistant', 'Professor de informática': 'Computer science teacher', 'Fundação Demócrito Rocha · Fortaleza': 'Fundação Demócrito Rocha · Fortaleza, Brazil',
  'feat: contato': 'feat: contact', 'Precisa de uma landing page, dashboard, sistema web ou catálogo digital? Conte sua ideia: o formulário monta a mensagem e abre direto no meu WhatsApp.': 'Need a landing page, dashboard, web system or digital catalog? Tell me your idea: the form builds the message and opens straight in my WhatsApp.',
  'e-mail': 'email', 'Nome': 'Name', 'E-mail': 'Email', 'Assunto': 'Subject', 'Mensagem': 'Message', 'Oportunidade profissional': 'Job opportunity', 'Novo projeto': 'New project', 'Freelance / colaboração': 'Freelance / collaboration', 'Outro assunto': 'Other', 'Enviar pelo WhatsApp ↗': 'Send via WhatsApp ↗',
  '© 2026 Alisson Aragão · feito com HTML5, CSS3 e JavaScript': '© 2026 Alisson Aragão · built with HTML5, CSS3 and JavaScript'
};

function tr() {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), ns = [];
  while (w.nextNode()) ns.push(w.currentNode);
  for (const n of ns) {
    const p = n.parentNode;
    if (!p || /^(SCRIPT|STYLE)$/.test(p.nodeName) || p.id === 'role' || (p.closest && p.closest('#out'))) continue;
    if (n.__pt === undefined) n.__pt = n.nodeValue;
    const k = n.__pt.trim();
    if (!k) continue;
    const v = lang === 'en' ? EN[k] : null;
    n.nodeValue = v ? n.__pt.replace(k, () => v) : n.__pt;
  }
}

const lb = $('#lang');

function setLang(l) {
  lang = l;
  try { localStorage.setItem('lang', l); } catch (e) {}
  root.lang = l === 'en' ? 'en' : 'pt-BR';
  lb.textContent = l === 'en' ? 'PT' : 'EN';
  tr();
  paint();
  hint();
  boot();
}

lb.onclick = () => setLang(lang === 'en' ? 'pt' : 'en');
setLang(lang);
