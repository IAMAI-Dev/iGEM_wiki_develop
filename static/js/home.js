const CHAPTERS = ['beginning', 'air', 'soil', 'rain', 'sample', 'lab', 'pathway', 'signal', 'return'].map((name, i) => [name, i / 9]);
const FOCUS = [[1080, 660, .70], [490, 560, .62], [1040, 720, .65], [530, 640, .60], [1080, 660, .75], [1080, 650, .57], [1080, 630, .68], [540, 650, .62], [1110, 650, .57]];
const LAYOUT = ['left', 'right', 'left', 'right', 'left', 'left', 'left', 'right', 'left'];
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (a, b, p) => { const t = clamp((p - a) / (b - a)); return t * t * (3 - 2 * t); };
const range = (p, a, b, c, d) => ease(a, b, p) * (1 - ease(c, d, p));
let controller = null;
let resumeProgress = null;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
function canAnimate() {
    return !reducedMotion.matches && !!window.gsap && !!window.ScrollTrigger && window.innerHeight >= (window.innerWidth < 768 ? 600 : 500);
}
function boot() {
    controller?.destroy();
    controller = null;
    const root = document.querySelector('[data-story-root]');
    if (root && canAnimate()) controller = createStory(root);
}
function createStory(root) {
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);
    const find = name => root.querySelector('[data-story-' + name + ']');
    const stage = find('stage');
    const canvas = find('particles');
    const ctx = canvas.getContext('2d');
    const environments = [...root.querySelectorAll('[data-environment]')];
    const arts = [...root.querySelectorAll('[data-scene-art]')];
    const copies = [...root.querySelectorAll('[data-story-chapter]')];
    const shared = Object.fromEntries(['bottle', 'hand', 'drop', 'cell', 'salicylate'].map(name => [name, root.querySelector('[data-shared-' + name + ']')]));
    const car = root.querySelector('[data-car-v2]');
    const pipette = root.querySelector('[data-pipette-v2]');
    const state = { p: 0 };
    let width = innerWidth, height = innerHeight, mobile = width < 768;
    let cover = 1, offsetX = 0, offsetY = 0;
    let disposed = false, resizeTimer = null, tickerActive = false, lenis = null;
    let three = null, threeRequested = false, threeFailed = false;
    let lastChapter = -1, lastAriaProgress = -1;
    const cleanups = [];
    const on = (target, event, fn, options) => {
        target.addEventListener(event, fn, options);
        cleanups.push(() => target.removeEventListener(event, fn, options));
    };
    const alpha = (el, value) => { if (el) el.style.opacity = clamp(value).toFixed(4); };
    root.classList.add('is-enhanced');
    function measure() {
        width = innerWidth; height = innerHeight; mobile = width < 768;
        root.style.setProperty('--story-height', height + 'px');
        cover = Math.max(width / 1600, height / 1000);
        offsetX = (width - 1600 * cover) / 2; offsetY = (height - 1000 * cover) / 2;
        const dpr = Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2);
        canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
        ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        arts.forEach((art, i) => {
            const [x, y, scale] = FOCUS[i];
            art.setAttribute('transform', mobile ? `translate(800 735) scale(${scale}) translate(${-x} ${-y})` : 'translate(0 0)');
        });
        three?.resize(width, height, dpr);
    }
    function project(scene, x, y, scale = 1) {
        const [fx, fy, zoom] = FOCUS[scene];
        return { x: (mobile ? (x - fx) * zoom + 800 : x) * cover + offsetX,
            y: (mobile ? (y - fy) * zoom + 735 : y) * cover + offsetY,
            scale: scale * cover * (mobile ? zoom : 1) };
    }
    const mix = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), scale: lerp(a.scale, b.scale, t) });
    function pose(el, point, opacity = 1) {
        el.setAttribute('transform', `translate(${point.x} ${point.y}) scale(${point.scale})`);
        alpha(el, opacity);
    }
    const sprite = document.createElement('canvas'); sprite.width = sprite.height = 96;
    const sc = sprite.getContext('2d');
    if (sc) {
        const g = sc.createRadialGradient(48, 48, 0, 48, 48, 48);
        g.addColorStop(0, 'rgba(177,192,175,.64)'); g.addColorStop(.4, 'rgba(130,154,139,.36)'); g.addColorStop(1, 'rgba(103,131,115,0)');
        sc.fillStyle = g; sc.fillRect(0, 0, 96, 96);
    }
    function puff(x, y, radius, opacity) {
        if (!ctx || opacity < .001 || x + radius < 0 || x - radius > width || y + radius < 0 || y - radius > height) return;
        ctx.globalAlpha = clamp(opacity);
        ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
    }
    function dot(x, y, r, opacity) {
        if (!ctx || opacity < .001) return;
        ctx.globalAlpha = clamp(opacity); ctx.fillStyle = '#dfbc80'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    const carAt = f => ({ x: lerp(990, 1400, ease(0, .78, f)), y: lerp(727, 748, ease(0, .78, f)) });
    function drawParticles(q, current, t) {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        const n = mobile ? 30 : 52;
        if (q < 1.01) {
            for (let j = 0; j < n; j++) {
                const age = (q * 1.3 + j / n) % 1;
                const birth = carAt(clamp(q - age * .18));
                const a = project(0, birth.x - 236 - age * 220, birth.y + 10 - age * 155);
                puff(a.x, a.y, (10 + age * 65) * a.scale, Math.sin(age * Math.PI) * (1 - ease(.7, 1, q)));
            }
        }
        if (q > .7 && q < 2) {
            for (const [sx, sy, size] of [[310, 270, 1.15], [646, 410, .78]]) {
                for (let j = 0; j < n; j++) {
                    const age = ((q - .7) * .65 + j / n) % 1;
                    const a = project(1, sx + age * 210, sy - age * 370 - Math.sin(j * 2.4) * age * 33);
                    const driftY = current === 1 ? -height * t : 0;
                    puff(a.x, a.y + driftY, (12 + age * 95) * a.scale * size, Math.sin(age * Math.PI) * ease(.7, 1, q));
                }
            }
        }
        // The same particle IDs move from airborne dust to soil and runoff.
        if (q >= 1 && q <= 4.7) {
            for (let j = 0; j < 32; j++) {
                const seed = j * 2.399;
                const air = project(1, 330 + (j * 37) % 220, 270 - (j * 43) % 200);
                const soil = project(2, 800 + (j * 61) % 520, 591 + (j * 31) % 210);
                const settle = ease(1.55, 2.5, q);
                let a = mix(air, soil, settle);
                let opacity = range(q, 1, 1.2, 4.35, 4.7);
                if (q > 2.7) {
                    const river = project(3, 790 + (j * 31) % 370, 816 + (j * 23) % 130);
                    if (j % 3 === 0) a = mix(soil, river, ease(2.7, 3.7, q));
                    else { a.x -= width * ease(2.7, 3, q); opacity *= 1 - ease(2.7, 3, q); }
                    if (q > 3.7) a = mix(a, project(4, 1080 + Math.cos(seed) * 30, 710 + Math.sin(seed) * 20), ease(3.7, 4.65, q));
                }
                dot(a.x, a.y, Math.max(1.2, a.scale * (2 + j % 3)), opacity * .8);
            }
        }
        const rain = range(q, 2.5, 2.8, 3.6, 3.98);
        if (rain > 0) {
            ctx.globalAlpha = rain * .3; ctx.strokeStyle = '#d0e5d8'; ctx.lineWidth = 1; ctx.beginPath();
            for (let j = 0; j < (mobile ? 50 : 95); j++) {
                const x = (j * 157.37) % width, y = (j * 89.13 + q * 1700) % (height + 80) - 40;
                ctx.moveTo(x, y); ctx.lineTo(x - 8, y + 27);
            }
            ctx.stroke();
        }
        if (current === 0 && t > 0) {
            const veil = Math.sin(Math.PI * t);
            for (let j = 0; j < 20; j++) puff(width * (j % 5) / 4 + t * 70, height * Math.floor(j / 5) / 3, width * .30, veil * .85);
        }
        if (current === 3 && t > 0) {
            const y = height * (1 - t);
            ctx.globalAlpha = Math.sin(t * Math.PI) * .6; ctx.strokeStyle = '#d0eee0'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.bezierCurveTo(width * .3, y - 35, width * .7, y + 35, width, y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    async function loadThree() {
        if (threeRequested || threeFailed || disposed) return;
        threeRequested = true;
        try {
            const { createCellRenderer } = await import('./home-three.js?v=3.0.0');
            if (disposed) return;
            three = createCellRenderer(find('three'), () => { threeFailed = true; three?.destroy(); three = null; });
            three.resize(width, height, Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
            render();
        } catch { threeFailed = true; }
    }
    function render() {
        if (disposed) return;
        const q = Math.min(state.p * 9, 8.99999), current = Math.floor(q), f = q - current;
        const t = current < 8 ? ease(.7, 1, f) : 0;
        environments.forEach((el, i) => {
            const active = i === current || (i === current + 1 && t > 0);
            el.style.visibility = active ? 'visible' : 'hidden';
            el.style.display = active ? 'block' : 'none';
            el.style.opacity = '1'; el.style.transform = 'none'; el.style.clipPath = 'none'; el.style.zIndex = i === current ? '0' : '1';
        });
        if (t > 0) {
            const out = environments[current], next = environments[current + 1];
            if (current === 1) {
                out.style.transform = `translateY(${-t * 100}%)`; next.style.transform = `translateY(${(1 - t) * 100}%)`;
            } else if (current === 2) {
                out.style.transform = `translateX(${-t * 100}%)`; next.style.transform = `translateX(${(1 - t) * 100}%)`;
            } else if (current === 3) {
                next.style.clipPath = `inset(${(1 - t) * 100}% 0 0 0)`;
            } else if (current === 5) {
                const drop = project(5, 1120, 760);
                next.style.clipPath = `circle(${t * 150}% at ${drop.x / width * 100}% ${drop.y / height * 100}%)`;
            } else {
                out.style.opacity = String(1 - t); next.style.opacity = String(t);
                if (current !== 7) {
                    out.style.transform = `translateX(${-t * 80}px)`; next.style.transform = `translateX(${(1 - t) * 80}px)`;
                }
            }
        }
        const c = carAt(q); car.setAttribute('transform', `translate(${c.x} ${c.y}) scale(1.8)`);
        root.querySelectorAll('[data-story-wheel]').forEach(wheel => wheel.setAttribute('transform', `rotate(${(c.x - 990) / 45 * 180 / Math.PI})`));
        alpha(root.querySelector('[data-soil-dots]'), ease(1.8, 2.5, q));
        const bottleMove = ease(4.7, 5, q);
        let bottle = mix(project(4, 1080, 830 - ease(4.15, 4.55, q) * 145), project(5, 935, 792), bottleMove);
        let bottleAlpha = range(q, 3.9, 4.15, 5.58, 5.7);
        if (q >= 7.7) { bottle = project(8, 1460, 788, .7); bottleAlpha = ease(7.7, 8, q); }
        pose(shared.bottle, bottle, bottleAlpha);
        if (q < 4.5) shared.bottle.setAttribute('transform', shared.bottle.getAttribute('transform') + ` rotate(${-65 * (1 - ease(4.05, 4.45, q))})`);
        root.querySelector('[data-bottle-water]').setAttribute('transform', `translate(0 ${140 * (1 - ease(4.04, 4.3, q))})`);
        alpha(shared.hand, 1 - ease(4.68, 4.93, q));
        const pipetteX = lerp(935, 1120, ease(5.27, 5.45, q));
        const pipetteY = 490 - 150 * ease(5.12, 5.27, q) + 175 * ease(5.45, 5.55, q);
        pipette.setAttribute('transform', `translate(${pipetteX} ${pipetteY})`);
        pose(shared.drop, project(5, 1120, lerp(675, 795, ease(5.54, 5.7, q))), range(q, 5.53, 5.58, 5.72, 5.86));
        const cellPoint = mix(project(7, 540, 650, 1.08), project(8, 1190, 615, .28), ease(7.7, 8, q));
        const cellAlpha = ease(6.7, 7, q);
        pose(shared.cell, cellPoint, cellAlpha);
        const binding = ease(6.72, 7.22, q);
        const molecule = mix(project(6, 1245, 625, .85), { x: cellPoint.x + 180 * cellPoint.scale, y: cellPoint.y - 35 * cellPoint.scale, scale: cellPoint.scale * .18 }, binding);
        pose(shared.salicylate, molecule, range(q, 6.3, 6.56, 7.18, 7.28));
        alpha(root.querySelector('[data-naphthalene-v2]'), 1 - ease(6.25, 6.6, q) * .65);
        alpha(root.querySelector('[data-cell-transcript]'), range(q, 7.2, 7.34, 7.52, 7.65));
        alpha(root.querySelector('[data-cell-proteins]'), ease(7.38, 7.6, q));
        alpha(root.querySelector('[data-cell-promoter]'), .3 + ease(7.2, 7.35, q) * .7);
        alpha(find('note'), range(q, 3.9, 4.15, 8.1, 8.4));
        const left = lerp(LAYOUT[current] === 'left' ? 1 : 0, LAYOUT[Math.min(8, current + 1)] === 'left' ? 1 : 0, t);
        root.style.setProperty('--shade-left', left);
        root.style.setProperty('--shade-right', 1 - left);
        if (document.body.dataset.theme === 'light') {
            const micro = i => i === 6 || i === 7 ? 1 : 0;
            const amount = lerp(micro(current), micro(Math.min(8, current + 1)), t);
            const color = (a, b) => a.map((value, i) => Math.round(lerp(value, b[i], amount))).join(', ');
            root.style.setProperty('--story-shade', color([231, 238, 221], [6, 35, 29]));
            root.style.setProperty('--story-paper', 'rgb(' + color([23, 62, 48], [237, 240, 220]) + ')');
            root.style.setProperty('--story-muted', 'rgb(' + color([59, 93, 75], [192, 212, 189]) + ')');
        } else {
            ['--story-shade', '--story-paper', '--story-muted'].forEach(name => root.style.removeProperty(name));
        }
        const chapter = t > .5 ? current + 1 : current;
        copies.forEach((copy, i) => {
            const opacity = i === current ? 1 - ease(.7, .91, f) * (current < 8 ? 1 : 0) : i === current + 1 ? ease(.86, 1, f) : 0;
            copy.style.opacity = opacity.toFixed(3); copy.style.visibility = opacity > .001 ? 'visible' : 'hidden';
            copy.style.transform = `translateY(${i === current + 1 ? (1 - t) * 20 : 0}px)`;
        });
        if (chapter !== lastChapter) {
            copies.forEach((copy, i) => { copy.classList.toggle('is-current', i === chapter); copy.inert = i !== chapter; copy.setAttribute('aria-hidden', String(i !== chapter)); });
            root.dataset.chapter = CHAPTERS[chapter][0]; root.dataset.layout = LAYOUT[chapter]; lastChapter = chapter;
        }
        find('progress').style.setProperty('--story-progress', state.p);
        const ariaProgress = Math.round(state.p * 100);
        if (ariaProgress !== lastAriaProgress) { find('progress').setAttribute('aria-valuenow', ariaProgress); lastAriaProgress = ariaProgress; }
        drawParticles(q, current, t);
        if (q > 6.4) loadThree();
        three?.render({ ...cellPoint, scale: cellPoint.scale / .12 }, q / 9, cellAlpha, document.body.dataset.theme);
    }
    measure();
    const timeline = gsap.timeline({ paused: true, onUpdate: render });
    timeline.to(state, { p: 1, duration: 100, ease: 'none' });
    CHAPTERS.forEach(([name, start]) => timeline.addLabel(name, start * 100));
    const trigger = ScrollTrigger.create({ id: 'homepage-story', trigger: root, start: 0,
        end: () => height * (mobile ? 12 : 16), pin: stage, pinSpacing: true,
        animation: timeline, scrub: true, invalidateOnRefresh: true });
    function stopTicker() {
        if (!tickerActive) return;
        gsap.ticker.remove(tick);
        tickerActive = false;
    }
    function tick(time) {
        lenis?.raf(time * 1000);
        if (!lenis?.isScrolling) stopTicker();
    }
    function wakeTicker() {
        if (disposed || document.hidden || !lenis || tickerActive) return;
        tickerActive = true;
        gsap.ticker.add(tick);
    }
    function setupLenis() {
        lenis?.destroy();
        lenis = null;
        stopTicker();
        if (mobile || !window.Lenis) return;
        lenis = new window.Lenis({ autoRaf: false, lerp: 0.1, smoothWheel: true, anchors: false });
        lenis.on('scroll', ScrollTrigger.update);
    }
    setupLenis();
    on(window, 'wheel', wakeTicker, { passive: true });
    on(window, 'keydown', wakeTicker);
    on(window, 'touchmove', wakeTicker, { passive: true });
    on(window, 'scroll', wakeTicker, { passive: true });
    on(document, 'visibilitychange', () => {
        if (document.hidden) stopTicker();
        else { render(); wakeTicker(); }
    });
    const aliases = { Project: 'beginning', Description: 'beginning', road: 'beginning', Engineering: 'pathway',
        'Wet Lab': 'signal', Design: 'signal', Result: 'return', 'Dry Lab': 'return', Team: 'return' };
    function chapterName(hash) {
        let name;
        try { name = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
        if (name.startsWith('story-')) name = name.slice(6);
        name = aliases[name] || name;
        return CHAPTERS.some(([key]) => key === name) ? name : null;
    }
    function seek(name, immediate = false) {
        const cue = CHAPTERS.find(([key]) => key === name);
        if (!cue) return;
        const p = name === 'return' ? 0.985 : cue[1] + (cue[1] ? 0.026 : 0);
        const target = trigger.start + (trigger.end - trigger.start) * p;
        if (lenis) {
            lenis.scrollTo(target, { immediate, duration: 1.15 });
            wakeTicker();
        } else {
            window.scrollTo({ top: target, behavior: immediate ? 'instant' : 'smooth' });
        }
    }
    on(document, 'click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        // Leave mobile navigation accordion buttons to the existing menu handler.
        if (mobile && link.matches('.has-dropdown > .nav-link')) return;
        const name = link.dataset.storyJump || chapterName(link.hash);
        if (!name) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => menu.classList.remove('active'));
        const menu = document.querySelector('#navMenu');
        if (menu?.classList.contains('active')) document.querySelector('#menuToggle')?.click();
        history.replaceState(null, '', '#story-' + name);
        seek(name);
    }, true);
    on(window, 'hashchange', () => {
        const name = chapterName(location.hash);
        if (name) seek(name);
    });
    on(window, 'resize', () => {
        clearTimeout(resizeTimer);
        if (mobile && width === window.innerWidth && Math.abs(height - window.innerHeight) < 160) return;
        resizeTimer = setTimeout(() => {
            const p = state.p;
            const previousMobile = mobile;
            measure();
            if (previousMobile !== mobile) setupLenis();
            ScrollTrigger.refresh();
            const position = trigger.start + (trigger.end - trigger.start) * p;
            if (lenis) lenis.scrollTo(position, { immediate: true });
            else window.scrollTo(0, position);
            render();
        }, 160);
    });
    const preferences = new MutationObserver(() => render());
    preferences.observe(document.body, { attributes: true, attributeFilter: ['data-theme', 'data-lang'] });
    const loader = document.querySelector('#loader');
    let loaderObserver = null;
    const finishSetup = () => {
        if (disposed) return;
        ScrollTrigger.refresh();
        const name = chapterName(location.hash);
        const navigation = performance.getEntriesByType('navigation')[0];
        if (name && navigation?.type !== 'reload' && navigation?.type !== 'back_forward') seek(name, true);
        render();
    };
    if (loader && !loader.hidden && !loader.classList.contains('hidden')) {
        loaderObserver = new MutationObserver(() => {
            if (loader.hidden || loader.classList.contains('hidden')) {
                loaderObserver.disconnect();
                finishSetup();
            }
        });
        loaderObserver.observe(loader, { attributes: true, attributeFilter: ['hidden', 'class'] });
    } else finishSetup();
    document.fonts?.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    render();
    return {
        getProgress: () => state.p,
        restore(p) {
            const position = trigger.start + (trigger.end - trigger.start) * clamp(p);
            if (lenis) lenis.scrollTo(position, { immediate: true });
            else window.scrollTo(0, position);
            ScrollTrigger.update();
        },
        destroy() {
            if (disposed) return;
            disposed = true;
            clearTimeout(resizeTimer);
            stopTicker();
            lenis?.destroy();
            three?.destroy();
            preferences.disconnect();
            loaderObserver?.disconnect();
            cleanups.forEach(cleanup => cleanup());
            trigger.kill(true);
            timeline.kill();
            root.classList.remove('is-enhanced');
            environments.forEach(el => el.removeAttribute('style'));
            arts.forEach(el => el.removeAttribute('transform'));
            root.removeAttribute('data-chapter');
            root.removeAttribute('data-layout');
            ['--shade-left', '--shade-right', '--story-shade', '--story-paper', '--story-muted'].forEach(name => root.style.removeProperty(name));
            root.querySelector('[data-bottle-water]').removeAttribute('transform');
            Object.values(shared).forEach(el => { el.removeAttribute('transform'); el.removeAttribute('style'); });
            copies.forEach(copy => {
                copy.removeAttribute('style');
                copy.removeAttribute('aria-hidden');
                copy.inert = false;
            });
            ctx?.clearRect(0, 0, width, height);
        }
    };
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
reducedMotion.addEventListener('change', boot);
window.addEventListener('resize', () => {
    if (Boolean(controller) !== canAnimate()) boot();
});
window.addEventListener('pagehide', () => {
    resumeProgress = controller?.getProgress() ?? null;
    controller?.destroy();
    controller = null;
});
window.addEventListener('pageshow', event => {
    if (event.persisted) {
        document.body.classList.remove('page-fade-out');
        boot();
        if (resumeProgress !== null) controller?.restore(resumeProgress);
    }
});
