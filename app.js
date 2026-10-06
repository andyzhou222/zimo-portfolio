(() => {
  'use strict';
  const projects = window.portfolioProjects;
  const grid = document.querySelector('#project-grid');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('#player-dialog');
  const player = document.querySelector('#player-video');
  let returnFocus = null;

  projects.forEach((project, index) => {
    const article = document.createElement('article');
    article.className = 'project-card reveal';
    article.dataset.category = project.category;
    const button = document.createElement('button');
    button.className = 'project-button';
    button.dataset.play = project.id;
    button.setAttribute('aria-label', `播放 ${project.title}，时长 ${project.duration}`);
    const visual = document.createElement('div');
    visual.className = 'project-image';
    const image = document.createElement('img');
    image.src = project.poster;
    image.alt = `${project.title}，${project.subtitle}`;
    image.width = 1600;
    image.height = 900;
    image.loading = 'lazy';
    image.decoding = 'async';
    visual.append(image);
    const indexLabel = document.createElement('span');
    indexLabel.className = 'project-index';
    indexLabel.textContent = `0${index + 1} / ${project.label}`;
    const duration = document.createElement('span');
    duration.className = 'project-duration';
    duration.textContent = project.duration;
    const play = document.createElement('span');
    play.className = 'project-play';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '▶';
    visual.append(indexLabel, duration, play);
    const meta = document.createElement('div');
    meta.className = 'project-meta';
    const text = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = project.title;
    const subtitle = document.createElement('p');
    subtitle.textContent = project.subtitle;
    text.append(title, subtitle);
    const label = document.createElement('span');
    label.className = 'project-label';
    label.textContent = project.tags.join(' / ');
    meta.append(text, label);
    button.append(visual, meta);
    article.append(button);
    grid.append(article);
  });

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelectorAll('[data-category]').forEach(item => { item.hidden = filter !== 'all' && item.dataset.category !== filter; });
      grid.hidden = filter === 'web';
      const count = filter === 'all' ? 5 : filter === 'film' ? 4 : 1;
      document.querySelector('#work-count').textContent = `(0${count})`;
      document.querySelector('#filter-status').textContent = `显示${filter === 'all' ? '全部' : filter === 'film' ? 'AI 影像' : '网站开发'} ${count} 个作品`;
      document.querySelectorAll('[data-category]:not([hidden])').forEach(item => item.classList.add('is-visible'));
    });
  });

  function openPlayer(id, trigger) {
    const project = id === 'reel' ? { title: '先看这 12 秒', label: 'SHOWREEL', video: 'assets/reel.mp4', poster: 'assets/lovestory.jpg', duration: '00:12', description: '从四支短片里选出的几个镜头。往下看作品区，可以点开完整视频。' } : projects.find(item => item.id === id);
    if (!project) return;
    returnFocus = trigger;
    document.querySelector('#player-title').textContent = project.title;
    document.querySelector('#player-category').textContent = project.label;
    document.querySelector('#player-description').textContent = project.description;
    document.querySelector('#player-duration').textContent = project.duration;
    document.querySelector('#player-error').hidden = true;
    player.poster = project.poster;
    player.src = project.video;
    player.load();
    dialog.showModal();
    document.body.classList.add('dialog-open');
    document.querySelector('#reel-preview').pause();
    document.querySelector('.player-close').focus();
    player.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-play]');
    if (trigger) openPlayer(trigger.dataset.play, trigger);
  });
  document.querySelector('.player-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    document.body.classList.remove('dialog-open');
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    resumeReel();
  });
  player.addEventListener('error', () => {
    if (dialog.open && player.getAttribute('src')) document.querySelector('#player-error').hidden = false;
  });

  const menu = document.querySelector('#mobile-nav');
  const toggle = document.querySelector('.menu-toggle');
  function closeMenu() { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', '打开导航'); }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '关闭导航' : '打开导航');
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); } });
  document.querySelector('.copy-email').addEventListener('click', async () => {
    const status = document.querySelector('#copy-status');
    try {
      await navigator.clipboard.writeText('andyzhou2009@live.com');
      status.textContent = '邮箱已复制';
    } catch {
      status.textContent = '请直接复制上方邮箱地址';
    }
  });

  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.07 });
    document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
  }
  const reel = document.querySelector('#reel-preview');
  let reelVisible = false;
  function resumeReel() {
    if (reelVisible && !reducedMotion.matches && !document.hidden && !dialog.open) reel.play().catch(() => {});
    else reel.pause();
  }
  if ('IntersectionObserver' in window) {
    const reelObserver = new IntersectionObserver(entries => { reelVisible = entries[0].isIntersecting; resumeReel(); }, { threshold: 0.15 });
    reelObserver.observe(reel);
  }
  document.addEventListener('visibilitychange', resumeReel);
  reducedMotion.addEventListener('change', () => { document.documentElement.classList.toggle('motion-ready', !reducedMotion.matches); resumeReel(); });
  let scrollPending = false;
  const progress = document.querySelector('.scroll-progress');
  function updateProgress() {
    const distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${distance > 0 ? window.scrollY / distance * 100 : 0}%`;
    scrollPending = false;
  }
  window.addEventListener('scroll', () => { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateProgress); } }, { passive: true });
  updateProgress();
})();
