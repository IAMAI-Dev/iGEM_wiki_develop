import initNavigation from './nav.js';

const AppState = {
    currentLang: 'en',
    currentTheme: 'dark',
    currentSection: 'home',
    isMenuOpen: false,
    isLoaded: false
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initTheme();
    initLoaderAnimation();
    initLanguage();
    initNavigation();
    initScrollEffects();
    initMobildMenu();
    updateThemeUI();
    initSubpageTransitions();
    init3DTiltAndGlow();
    
    // 渐显页面内容，防止语言及主题切换闪烁
    document.body.classList.remove('page-loading');
});

/**
 * 初始化应用状态
 */
function initializeApp() {
    loadPreferences();
}

function loadPreferences() {
    // 从本地存储加载用户偏好
    const savedLang = sessionStorage.getItem('portfolio-lang');
    const savedTheme = sessionStorage.getItem('portfolio-theme');
    if (savedLang) AppState.currentLang = savedLang;
    if (savedTheme) AppState.currentTheme = savedTheme;
}

/**
 * 语言切换
 */
function initLanguage() {
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
    }
    setLanguage(AppState.currentLang);
}

function toggleLanguage() {
    const newLang = AppState.currentLang === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
    sessionStorage.setItem('portfolio-lang', newLang);
}

function setLanguage(lang) {
    AppState.currentLang = lang;
    const html = document.documentElement;
    const body = document.body;
    if (lang === 'zh') {
        html.setAttribute('lang', 'zh');
        body.setAttribute('data-lang', 'zh');
    } else {
        html.setAttribute('lang', 'en');
        body.setAttribute('data-lang', 'en');
    }
    updateLanguageUI();
}

function updateLanguageUI() {
    const textElements = document.querySelectorAll('[data-text-en],[data-text-zh]');
    textElements.forEach(element => {
        const enText = element.getAttribute('data-text-en') || '';
        const zhText = element.getAttribute('data-text-zh') || '';
        // 双重过滤防御：如果是 data-html 或是文本中检测到 HTML 标签图案，则以 innerHTML 形式解析渲染
        const hasHTMLTags = /<\/?[a-z][\s\S]*>/i.test(enText) || /<\/?[a-z][\s\S]*>/i.test(zhText);
        const useHTML = element.hasAttribute('data-html') || hasHTMLTags;
        const setter = useHTML ? 'innerHTML' : 'textContent';
        if (AppState.currentLang === 'zh' && zhText) {
            element[setter] = zhText;
        } else if (AppState.currentLang === 'en' && enText) {
            element[setter] = enText;
        }
    });
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langText = langToggle.querySelector('.lang-text');
        if (langText) {
            langText.textContent = AppState.currentLang === 'en' ? 'ZH' : 'EN';
        }
    }
}

/**
 * 主题风格切换：亮/暗
 */
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    setTheme(AppState.currentTheme);
}

function toggleTheme() {
    const newTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    sessionStorage.setItem('portfolio-theme', newTheme); // 本地存储
}

function setTheme(theme) {
    AppState.currentTheme = theme;
    document.body.setAttribute('data-theme', theme);
    updateThemeUI();
}

function updateThemeUI() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = AppState.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}


/**
 * 滚动响应
 */
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
}

/**
 * 动态适应移动端布局
 */
function initMobildMenu() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMoblieMenu);
    }
    document.addEventListener('click', (e) => {
        const navMenu = document.getElementById('navMenu');
        const menuToggle = document.getElementById('menuToggle');
        if (AppState.isMenuOpen && !navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            toggleMoblieMenu();
        }
    });
}

function toggleMoblieMenu() {
    AppState.isMenuOpen = !AppState.isMenuOpen;
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');
    if (navMenu) {
        navMenu.classList.toggle('active', AppState.isMenuOpen);
    }
    if (menuToggle) {
        menuToggle.classList.toggle('active', AppState.isMenuOpen);
    }
    // Collapse all dropdown sub-menus when closing the drawer
    if (!AppState.isMenuOpen) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => menu.classList.remove('active'));
        document.querySelectorAll('.has-dropdown .nav-link').forEach(link => link.classList.remove('expanded'));
    }
}

/**
 * 子页面平滑过渡
 * 处理 Logo 点击和当前页面链接
 */
function initSubpageTransitions() {
    if (!window.__IS_SUBPAGE) return;

    const currentPath = window.location.pathname;
    const homeUrl = window.__HOME_URL || '/';

    // Logo 点击 → 淡出过渡回首页
    // 使用 nav-brand 内的链接，而不是硬编码 href="/"
    const logoLink = document.querySelector('.nav-brand a');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.setItem('skipLoader', 'true');
            document.body.classList.add('page-fade-out');
            setTimeout(() => {
                window.location.href = homeUrl;
            }, 300);
        });
    }

    // 当前子页面内的链接（如 /wetlab/salicylic-acid）不需要跳转
    const currentPageLinks = document.querySelectorAll(`a[href="${currentPath}"]`);
    currentPageLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });
}

/**
 * Interactive 3D Tilt and Cursor Glow for Glass Cards and Illustration Containers
 */
function init3DTiltAndGlow() {
    // Disable 3D tilt on touch-only devices
    if (window.matchMedia('(hover: none)').matches) return;

    const targets = document.querySelectorAll('.glass-card, .illustration-container');
    targets.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Remove transition for latency-free 60fps tracking
            card.style.transition = 'none';

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            // Max rotation: 5 degrees for premium subtle tilt
            const tiltX = ((y - centerY) / centerY) * -5;
            const tiltY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px)`;
            card.style.setProperty('--glow-x', `${x}px`);
            card.style.setProperty('--glow-y', `${y}px`);
        });

        card.addEventListener('mouseleave', () => {
            // Restore smooth transition on exit
            card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.5s ease, border-color 0.5s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}


function initLoaderAnimation() {
    const loader = document.getElementById('loader');
    const loaderPercent = document.getElementById('loaderPercent');
    const loaderBar = document.querySelector('.loader-progress-bar');
    const loaderStatus = document.getElementById('loaderStatus');
    if (!loader || !loaderPercent || !loaderBar) return;

    // 从子页面返回时跳过加载动画
    if (sessionStorage.getItem('skipLoader') === 'true') {
        sessionStorage.removeItem('skipLoader');
        loaderPercent.textContent = '100%';
        loaderBar.style.transform = 'scaleX(1)';
        loader.style.setProperty('--loader-progress', '100%');
        loader.setAttribute('aria-valuenow', '100');
        loader.setAttribute('aria-hidden', 'true');
        loader.classList.add('hidden');
        loader.hidden = true;
        return;
    }

    const motionEngine = window.anime;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minimumDuration = reducedMotion ? 650 : 3000;
    const maximumDuration = 8000;
    const progressRampDuration = reducedMotion ? 500 : 2600;
    const startTime = performance.now();
    let pageReady = document.readyState === 'complete';
    let progress = 0;
    let lastRenderedProgress = -1;
    let lastAnnouncedProgress = -10;
    let progressFrame = null;
    let isCompleting = false;

    if (!pageReady) {
        window.addEventListener('load', () => {
            pageReady = true;
        }, { once: true });
    }

    const renderProgress = (value, announce = false) => {
        const safeValue = Math.max(0, Math.min(100, value));
        const roundedValue = Math.floor(safeValue);
        loaderBar.style.transform = `scaleX(${safeValue / 100})`;
        loader.style.setProperty('--loader-progress', `${safeValue}%`);

        if (roundedValue !== lastRenderedProgress) {
            loaderPercent.textContent = `${roundedValue}%`;
            loader.setAttribute('aria-valuenow', String(roundedValue));
            lastRenderedProgress = roundedValue;
        }

        if (loaderStatus && (announce || roundedValue >= lastAnnouncedProgress + 10)) {
            loaderStatus.textContent = `Loading homepage: ${roundedValue}%`;
            lastAnnouncedProgress = roundedValue;
        }
    };

    const hideLoader = () => {
        loader.classList.add('hidden');
        loader.setAttribute('aria-hidden', 'true');
        window.setTimeout(() => {
            loader.hidden = true;
        }, reducedMotion ? 180 : 440);
    };

    const completeLoader = () => {
        if (isCompleting) return;
        isCompleting = true;
        if (progressFrame !== null) cancelAnimationFrame(progressFrame);

        const finish = () => {
            progress = 100;
            renderProgress(100, true);
            loader.classList.add('is-complete');
            window.setTimeout(hideLoader, reducedMotion ? 0 : 110);
        };

        if (motionEngine && !reducedMotion) {
            const progressState = { value: progress };
            motionEngine({
                targets: progressState,
                value: 100,
                duration: 280,
                easing: 'easeOutQuad',
                update: () => renderProgress(progressState.value),
                complete: finish
            });
        } else {
            finish();
        }
    };

    const easeOutCubic = value => 1 - Math.pow(1 - value, 3);
    const updateProgress = now => {
        const elapsed = now - startTime;
        let targetProgress;

        if (elapsed < progressRampDuration) {
            targetProgress = 85 * easeOutCubic(elapsed / progressRampDuration);
        } else {
            const waitingRatio = Math.min(1, (elapsed - progressRampDuration) / (maximumDuration - progressRampDuration));
            targetProgress = 85 + (10 * waitingRatio);
        }

        progress += (targetProgress - progress) * 0.16;
        renderProgress(progress);

        if ((pageReady && elapsed >= minimumDuration) || elapsed >= maximumDuration) {
            completeLoader();
            return;
        }

        progressFrame = requestAnimationFrame(updateProgress);
    };

    renderProgress(0, true);
    startLoaderScene(loader, motionEngine, reducedMotion);
    progressFrame = requestAnimationFrame(updateProgress);
}

const loaderMoleculeLayout = [
    [0.06, 0.13, 0.09, -16], [0.22, 0.08, 0.12, 12], [0.42, 0.18, 0.08, -8],
    [0.13, 0.34, 0.13, 9], [0.33, 0.31, 0.1, -13], [0.57, 0.37, 0.08, 18],
    [0.04, 0.53, 0.11, -6], [0.22, 0.56, 0.08, 16], [0.45, 0.51, 0.12, -19],
    [0.64, 0.58, 0.07, 11], [0.12, 0.75, 0.09, 14], [0.31, 0.84, 0.13, -10],
    [0.5, 0.73, 0.08, 21], [0.68, 0.81, 0.11, -15], [0.7, 0.16, 0.07, 8],
    [0.53, 0.9, 0.08, -22], [0.29, 0.67, 0.07, 17], [0.7, 0.43, 0.09, -9]
];

function startLoaderScene(loader, motionEngine, reducedMotion) {
    const glow = loader.querySelector('.loader-pahs-glow');

    if (reducedMotion || !motionEngine) {
        if (glow) glow.style.opacity = '0.22';
        return;
    }

    requestAnimationFrame(() => {
        animateLoaderMolecules(loader, motionEngine);
        animateLoaderSignals(loader, motionEngine);
        animateLoaderSensor(loader, motionEngine);
    });
}

function animateLoaderMolecules(loader, motionEngine) {
    const field = loader.querySelector('[data-loader-molecules]');
    const target = loader.querySelector('[data-loader-target]');
    if (!field || !target) return;

    const fieldRect = field.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetX = targetRect.left + (targetRect.width / 2) - fieldRect.left;
    const targetY = targetRect.top + (targetRect.height / 2) - fieldRect.top;
    const particles = [...field.querySelectorAll('[data-loader-particle]')]
        .filter(particle => getComputedStyle(particle).display !== 'none');

    particles.forEach((particle, index) => {
        const [xRatio, yRatio, sizeRatio, rotation] = loaderMoleculeLayout[index];
        particle.style.left = '0';
        particle.style.top = '0';
        particle.style.width = `${sizeRatio * 100}%`;

        const particleRect = particle.getBoundingClientRect();
        const startX = (fieldRect.width * xRatio) - (particleRect.width / 2);
        const startY = (fieldRect.height * yRatio) - (particleRect.height / 2);
        const endX = targetX - (particleRect.width / 2) + (((index % 3) - 1) * 3);
        const endY = targetY - (particleRect.height / 2) + (((index % 5) - 2) * 2);

        motionEngine.set(particle, {
            translateX: startX,
            translateY: startY,
            rotate: rotation,
            scale: 0.76 + ((index % 4) * 0.08),
            opacity: 0.38 + ((index % 5) * 0.1)
        });

        motionEngine({
            targets: particle,
            translateX: endX,
            translateY: endY,
            rotate: rotation + ((index % 2 === 0 ? 1 : -1) * 42),
            scale: 0.16,
            opacity: 0,
            duration: 1500 + ((index % 6) * 135),
            delay: 180 + ((index % 6) * 105) + (Math.floor(index / 6) * 80),
            easing: 'easeInQuad'
        });
    });
}

function animateLoaderSignals(loader, motionEngine) {
    const signals = [...loader.querySelectorAll('[data-loader-signal]')]
        .filter(signal => getComputedStyle(signal).display !== 'none');

    signals.forEach((signal, index) => {
        motionEngine({
            targets: signal,
            translateX: [-24, 18 + (index * 7)],
            translateY: [((index % 3) - 1) * 5, ((index % 3) - 1) * 14],
            scale: [0.48, 1 + ((index % 3) * 0.08)],
            opacity: [0, 0.9, 0.62],
            duration: 1550 + ((index % 3) * 230),
            delay: 520 + (index * 135),
            easing: 'easeOutCubic'
        });
    });
}

function animateLoaderSensor(loader, motionEngine) {
    const shadowColor = getComputedStyle(loader).getPropertyValue('--loader-shadow').trim();
    const timeline = motionEngine.timeline({ easing: 'easeOutQuad' });

    timeline
        .add({
            targets: '.loader-pahs-circuit, .loader-pahs-circuit-core',
            opacity: [0.58, 1],
            duration: 520
        }, 0)
        .add({
            targets: '.loader-pahs-glow',
            opacity: [0.08, 0.42, 0.2],
            duration: 1150
        }, 420)
        .add({
            targets: '.loader-receptor-core',
            boxShadow: [`0 0 0 0 ${shadowColor}`, `0 0 24px 8px ${shadowColor}`, `0 0 10px 2px ${shadowColor}`],
            duration: 920
        }, 540);
}
