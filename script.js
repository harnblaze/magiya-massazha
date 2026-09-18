// «Магия массажа» — поведение лендинга: меню, вкладки прейскуранта, FAQ,
// появление блоков и нижняя панель записи на телефонах.
(() => {
  const root = document.documentElement;
  root.classList.remove('no-js');

  // ——— Шапка: тень после прокрутки ———
  const header = document.querySelector('[data-header]');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ——— Мобильное меню ———
  const burger = document.querySelector('[data-burger]');
  const nav = document.querySelector('[data-nav]');
  const desktop = window.matchMedia('(min-width: 1024px)');

  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  desktop.addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // ——— Вкладки прейскуранта (с управлением стрелками) ———
  document.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const list = [...tabs.querySelectorAll('[role="tab"]')];
    const select = (tab, focus = false) => {
      list.forEach((t) => {
        const active = t === tab;
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    };
    list.forEach((tab, i) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (step) { e.preventDefault(); select(list[(i + step + list.length) % list.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(list[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(list[list.length - 1], true); }
      });
    });
    // ссылка «подробнее об акции» и значок на первом экране открывают нужную вкладку
    document.querySelectorAll('a[href="#promo"]').forEach((a) => a.addEventListener('click', () => {
      const wrapTab = tabs.querySelector('#tab-wrap');
      if (wrapTab) select(wrapTab);
    }));
  });

  // ——— FAQ: открыт только один вопрос ———
  document.querySelectorAll('[data-faq]').forEach((faq) => {
    faq.addEventListener('toggle', (e) => {
      if (!e.target.open) return;
      faq.querySelectorAll('details[open]').forEach((d) => { if (d !== e.target) d.open = false; });
    }, true);
  });

  // ——— Появление блоков при прокрутке ———
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el, i) => {
      // лёгкая лесенка для карточек в одной сетке
      const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
      const idx = siblings.indexOf(el);
      if (siblings.length > 2 && idx > 0) el.style.transitionDelay = `${Math.min(idx, 4) * 70}ms`;
      io.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ——— Нижняя панель записи: после первого экрана и не над контактами ———
  const bar = document.querySelector('[data-mobile-bar]');
  const hero = document.querySelector('.hero');
  const contacts = document.getElementById('contacts');
  if (bar && hero && 'IntersectionObserver' in window) {
    let heroVisible = true;
    let contactsVisible = false;
    const update = () => bar.classList.toggle('is-visible', !heroVisible && !contactsVisible);
    new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; update(); }, { threshold: 0.15 }).observe(hero);
    if (contacts) new IntersectionObserver(([e]) => { contactsVisible = e.isIntersecting; update(); }, { threshold: 0.2 }).observe(contacts);
  }

  // ——— Видео: играют только на экране, без звука; при «уменьшить движение» — по кнопке ———
  const videos = document.querySelectorAll('[data-reel] video');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (calm || !('IntersectionObserver' in window)) {
    videos.forEach((v) => { v.controls = true; v.preload = 'metadata'; });
  } else {
    const vio = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) target.play().catch(() => { target.controls = true; });
        else target.pause();
      });
    }, { threshold: 0.5 });
    videos.forEach((v) => vio.observe(v));
  }

  // ——— Год в подвале ———
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
})();
