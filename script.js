    (function () {
      var R = document.documentElement,
    reduce = matchMedia('(prefers-reduced-motion: reduce)').matches,
    G = !!(window.gsap && window.ScrollTrigger),
    fx = G && !reduce,
    fine = matchMedia('(pointer:fine)').matches;
    var $ = function (s) { return document.querySelector(s) },
    $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)) };

    // Edite esta lista com os seus projetos reais.
    var PROJETOS = [
    {t: 'Projeto Marketing Tech', d: 'Projeto pessoal em TypeScript com Vite, publicado na Vercel.', tech: ['TypeScript', 'Vite', 'Vercel'], c: 'https://github.com/aragonp1/Projeto-Marketing-Tech', l: 'https://projeto-marketing-tech.vercel.app' },
    {t: 'Convite de casamento digital', d: 'Convite de casamento em formato de site, feito em TypeScript.', tech: ['TypeScript'], c: 'https://github.com/aragonp1/conviteteste', l: '' },
    {t: 'Site de chá de casa nova', d: 'Projeto pessoal em TypeScript: um site para um chá de casa nova.', tech: ['TypeScript'], c: 'https://github.com/aragonp1/chadecasanova', l: '' },
    {t: 'Fascículo digital', d: 'Fascículo digital criado para praticar HTML e CSS.', tech: ['HTML', 'CSS'], c: 'https://github.com/aragonp1/fasciculo', l: '' },
    {t: 'Site de estudo', d: 'Site feito nos estudos de HTML.', tech: ['HTML'], c: 'https://github.com/aragonp1/site-estudo', l: '' },
    {t: 'Atividade de CSS', d: 'Exercício de estilização com CSS.', tech: ['HTML', 'CSS'], c: 'https://github.com/aragonp1/AtividadeCSS', l: '' },

    ];
    $('#grid').innerHTML = PROJETOS.map(function (p) {
        return '<article class="card"><h3>' + p.t + '</h3><p>' + p.d + '</p><ul class="tags">' + p.tech.map(function (x) { return '<li>' + x + '</li>' }).join('') + '</ul><div class="links"><a href="' + p.c + '" target="_blank" rel="noopener">Ver código</a>' + (p.l ? '<a href="' + p.l + '" target="_blank" rel="noopener">Ver online</a>' : '') + '</div></article>';
      }).join('');
    $('#ano').textContent = new Date().getFullYear();

    // Tema
    var S = null;
    function setCol() {
        if (!S) return;
    var c = new THREE.Color(getComputedStyle(R).getPropertyValue('--accent').trim());
    S.wire.material.color = c; S.pts.material.color = c;
      }
    $('#tema').onclick = function () {
        var a = R.getAttribute('data-theme');
    var dark = a ? a === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches;
    R.setAttribute('data-theme', dark ? 'light' : 'dark'); setCol();
      };

    // Fundo 3D
    if (window.THREE && !reduce) {
        try {
          var cv = $('#bg'), r = new THREE.WebGLRenderer({canvas: cv, alpha: true, antialias: true });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    var sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(60, 1, .1, 100); cam.position.z = 7;
    var wire = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 2), new THREE.MeshBasicMaterial({wireframe: true, transparent: true, opacity: .35 }));
    var n = 900, pos = new Float32Array(n * 3);
    for (var i = 0; i < n; i++) {
            var rr = 4 + Math.random() * 5, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = rr * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = rr * Math.sin(ph) * Math.sin(th); pos[i * 3 + 2] = rr * Math.cos(ph)
          }
    var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var pts = new THREE.Points(pg, new THREE.PointsMaterial({size: .04, transparent: true, opacity: .8 }));
    sc.add(wire); sc.add(pts); S = {wire: wire, pts: pts }; setCol();
    var mx = 0, my = 0, cx = 0, cy = 0;
    var size = function () {r.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix() };
    size(); addEventListener('resize', size);
    addEventListener('pointermove', function (e) {mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5 });
    (function loop() {
            var p = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
    cx += (mx - cx) * .05; cy += (my - cy) * .05;
    wire.rotation.y += .002; wire.rotation.x = cy * 1.2 + p * 3; wire.rotation.z = cx * .6;
    pts.rotation.y -= .0007; pts.rotation.x = cy * .3;
    wire.position.x = Math.sin(p * 6.283) * 2.4; wire.scale.setScalar(1 + p * .5);
    r.render(sc, cam); requestAnimationFrame(loop);
          })();
        } catch (e) { }
      }

    // Efeitos GSAP
    function split(el) {
        var t = el.textContent; el.setAttribute('aria-label', t);
    el.innerHTML = t.split(' ').map(function (w) { return '<span class="w" aria-hidden="true">' + w.split('').map(function (c) { return '<span class="ch">' + c + '</span>' }).join('') + '</span>' }).join(' ');
      }
    function scramble(el, txt) {
        var f = 0, tot = 24, ch = 'abcdefghijklmnopqrstuvwxyz<>/{ }';
        (function step() {
          var o = ''; for (var i = 0; i < txt.length; i++) {o += (i < txt.length * f / tot || txt[i] === ' ') ? txt[i] : ch[Math.random() * ch.length | 0]}
        el.textContent = o; if (f++ < tot) requestAnimationFrame(step)
        })();
      }
        if (fx) {
            gsap.registerPlugin(ScrollTrigger); R.classList.add('fx');
        split($('#h1'));
        var roles = ['Desenvolvedor Full Stack em formação', 'React e Tailwind CSS', 'JavaScript e TypeScript'], ri = 0;
        var enter = function () {
            gsap.from('.ch', { yPercent: 115, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: .025 });
        gsap.from('.role,.sub,.hero .btn', {y: 30, opacity: 0, delay: .4, duration: .9, stagger: .15 });
        setInterval(function () {ri = (ri + 1) % roles.length; scramble($('#role'), roles[ri]) }, 2800);
        };
        var c = {v: 0 }, num = $('#cnt');
        gsap.to(c, {
            v: 100, duration: 1.4, ease: 'power2.inOut', onUpdate: function () {num.textContent = Math.round(c.v)},
        onComplete: function () {gsap.to('#loader', { yPercent: -100, duration: .9, ease: 'power4.inOut', onComplete: function () { $('#loader').style.display = 'none' } }); enter() }
        });

        gsap.to('.prog', {scaleX: 1, ease: 'none', scrollTrigger: {start: 0, end: 'max', scrub: .3 } });
        ScrollTrigger.create({
            start: 0, end: 'max', onUpdate: function (s) {
            gsap.to('header.top', { yPercent: (s.direction === 1 && s.scroll() > 200) ? -110 : 0, duration: .35, overwrite: true })
        }
        });

        $$('.h2').forEach(function (h) {
            gsap.fromTo(h, { clipPath: 'inset(0 100% 0 0)', x: -30 }, { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%' } });
        });
        gsap.from('.card', {y: 90, rotationX: -18, opacity: 0, transformPerspective: 900, duration: 1, stagger: .12, ease: 'power3.out', scrollTrigger: {trigger: '#grid', start: 'top 80%' } });
        gsap.from('.tl li', {x: -40, opacity: 0, duration: .8, stagger: .12, ease: 'power3.out', scrollTrigger: {trigger: '.tl', start: 'top 85%' } });
        gsap.from('.stats div', {scaleY: 0, transformOrigin: '0 0', opacity: 0, duration: .8, stagger: .15, scrollTrigger: {trigger: '.stats', start: 'top 85%' } });
        $$('[data-n]').forEach(function (el) {
          var n = +el.dataset.n, o = {v: 0 };
        ScrollTrigger.create({
            trigger: el, start: 'top 90%', once: true, onEnter: function () {
            gsap.fromTo(o, { v: 0 }, { v: n, duration: 1.6, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v) } })
        }
          });
        });
        var tr = $('#track'); tr.innerHTML += tr.innerHTML;
        var tw = gsap.to(tr, {xPercent: -50, repeat: -1, duration: 28, ease: 'none' });
        ScrollTrigger.create({onUpdate: function (s) {tw.timeScale(1 + Math.abs(s.getVelocity()) / 250); gsap.to(tw, {timeScale: 1, duration: 1.2, overwrite: true }) } });
      }

        // Cursor, imã e inclinação (só com mouse)
        if (fine) {
            $$('.card').forEach(function (c) {
                c.addEventListener('pointermove', function (e) {
                    var b = c.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
                    c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
                    if (fx) gsap.to(c, { rotationY: (x - .5) * 12, rotationX: (.5 - y) * 12, transformPerspective: 900, duration: .4, overwrite: 'auto' });
                });
                c.addEventListener('pointerleave', function () { if (fx) gsap.to(c, { rotationX: 0, rotationY: 0, duration: .6, ease: 'power3.out', overwrite: 'auto' }) });
            });
      }
        if (fx && fine) {
            $$('[data-mag]').forEach(function (m) {
                m.addEventListener('pointermove', function (e) {
                    var b = m.getBoundingClientRect();
                    gsap.to(m, { x: (e.clientX - b.left - b.width / 2) * .35, y: (e.clientY - b.top - b.height / 2) * .35, duration: .3 })
                });
                m.addEventListener('pointerleave', function () { gsap.to(m, { x: 0, y: 0, duration: .8, ease: 'elastic.out(1,.4)' }) });
            });
        var ring = $('#ring'), dot = $('#dot');
        var rx = gsap.quickTo(ring, 'x', {duration: .4, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', {duration: .4, ease: 'power3' }),
        dx = gsap.quickTo(dot, 'x', {duration: .08 }), dy = gsap.quickTo(dot, 'y', {duration: .08 });
        addEventListener('pointermove', function (e) {rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); R.classList.add('cur-on') });
        document.addEventListener('pointerover', function (e) {ring.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,.card')))});
      }
    })();