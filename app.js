(() => {
  'use strict';

  const cfg = window.SUPABASE_CONFIG || {};
  const ready = Boolean(
    cfg.url && cfg.anonKey &&
    !String(cfg.url).includes('YOUR-PROJECT') &&
    !String(cfg.anonKey).includes('YOUR_SUPABASE')
  );
  const sb = ready && window.supabase ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;
  const $ = (id) => document.getElementById(id);

  const fallback = {
    name: 'Sabin Maruhe',
    email: 'maruhesabin@gmail.com',
    phone: '0845360603',
    location: 'Goma, Nord-Kivu, RDC',
    bio: 'Mi estas Sabin Maruhe, kreiva profesiulo pasia pri grafika komunikado, foto, video kaj ciferecaj projektoj.',
    tagline: 'Mi transformas ideojn en vidajn spertojn.',
    accent: '#dfff3f',
    background: '#08090d',
    font: 'Inter'
  };

  let settings = { ...fallback };
  let socials = [];
  let projects = [];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));

  function applyTheme() {
    document.documentElement.style.setProperty('--accent', settings.accent || fallback.accent);
    document.documentElement.style.setProperty('--bg', settings.background || fallback.background);
    document.body.style.fontFamily = `${settings.font || 'Inter'}, Inter, system-ui, sans-serif`;
    if (settings.background_image) {
      document.body.style.backgroundImage =
        `linear-gradient(rgba(8,9,13,.78),rgba(8,9,13,.96)),url("${esc(settings.background_image)}")`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    }
  }

  function renderProfile() {
    const title = settings.tagline || fallback.tagline;
    const words = title.split(' ');
    const highlighted = words.slice(Math.max(0, words.length - 2)).join(' ');
    const prefix = words.slice(0, Math.max(0, words.length - 2)).join(' ');
    $('heroTitle').innerHTML = prefix
      ? `${esc(prefix)} <span>${esc(highlighted)}</span>`
      : `<span>${esc(title)}</span>`;

    $('heroBio').textContent = settings.bio || fallback.bio;
    const bio = String(settings.bio || fallback.bio).replace(/^Mi estas[^,]*,\s*/i, '');
    $('aboutBio').innerHTML = `Mi estas <b>${esc(settings.name || fallback.name)}</b>, ${esc(bio)}`;
    $('emailText').textContent = settings.email || fallback.email;
    $('phoneText').textContent = settings.phone || fallback.phone;
    $('locationText').textContent = settings.location || fallback.location;
    $('heroLocation').textContent = String(settings.location || fallback.location).replace(', Nord-Kivu, RDC', ' · RDC');

    if (settings.profile_image) {
      $('profileImage').src = settings.profile_image;
      $('profileImage').classList.remove('hidden');
      $('profileFallback').classList.add('hidden');
    }
  }

  function renderSocials() {
    $('socialLinks').innerHTML = socials.length
      ? socials.map((s) => `<a class="btn secondary" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗</a>`).join('')
      : '';
  }

  function renderCategories(active = 'ĈIO') {
    const categories = ['ĈIO', 'GRAFIKA DESIGNO', 'FOTOGRAFIO', 'VIDEO', 'CINEMO', 'WEB', 'PROJEKTOJ'];
    const bar = $('categoryBar');
    bar.innerHTML = categories.map((c) =>
      `<button type="button" class="filter-btn ${c === active ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`
    ).join('');

    bar.querySelectorAll('[data-cat]').forEach((button) => {
      button.addEventListener('click', () => {
        renderCategories(button.dataset.cat);
        renderProjects(button.dataset.cat);
      });
    });
  }

  function projectImages(project) {
    return [...(project.project_images || [])].sort(
      (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
    );
  }

  function renderProjects(category = 'ĈIO') {
    const list = category === 'ĈIO'
      ? projects
      : projects.filter((p) => String(p.category || '').toUpperCase() === category);

    const grid = $('projectGrid');
    $('emptyProjects').classList.toggle('hidden', list.length > 0);

    grid.innerHTML = list.map((p) => {
      const imgs = projectImages(p);
      const cover = imgs[0]?.public_url;
      return `<article class="project-card reveal in" data-project="${esc(p.id)}">
        <div class="project-media">
          ${cover
            ? `<img src="${esc(cover)}" alt="${esc(imgs[0]?.alt_text || p.title)}" loading="lazy" decoding="async">`
            : '<div class="media-fallback">SM</div>'}
          <span class="project-count">${imgs.length} bild${imgs.length === 1 ? 'o' : 'oj'}</span>
        </div>
        <div class="project-info">
          <div class="project-meta"><span>${esc(p.category)}</span><span>${esc(p.collaborators || '')}</span></div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <button type="button" class="text-link" data-open="${esc(p.id)}">Vidi la projekton →</button>
        </div>
      </article>`;
    }).join('');

    grid.querySelectorAll('[data-open]').forEach((button) => {
      button.addEventListener('click', () => openProject(button.dataset.open));
    });
  }

  function openProject(id) {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    const imgs = projectImages(project);
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.innerHTML = `<div class="modal-inner">
      <button type="button" class="modal-close" aria-label="Fermi">×</button>
      <div class="eyebrow">${esc(project.category)}</div>
      <h2>${esc(project.title)}</h2>
      <p>${esc(project.description)}</p>
      <div class="modal-gallery">
        ${imgs.map((im) => `<img src="${esc(im.public_url)}" alt="${esc(im.alt_text || project.title)}" loading="lazy" decoding="async">`).join('')}
      </div>
      ${project.collaborators ? `<p class="muted"><b>Kunlaborantoj:</b> ${esc(project.collaborators)}</p>` : ''}
      <a class="btn primary modal-contact" href="#contact">Kontakti pri ĉi tiu projekto →</a>
    </div>`;

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    const close = () => { modal.remove(); document.body.classList.remove('modal-open'); };
    modal.querySelector('.modal-close').addEventListener('click', close);
    modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
    modal.querySelector('.modal-contact').addEventListener('click', close);
  }

  function observe() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
  }

  async function load() {
    if (!sb) {
      renderCategories();
      renderProjects();
      renderProfile();
      renderSocials();
      $('formStatus').textContent = 'Agordu Supabase por aktivigi la tutmondan enhavon.';
      $('newsletterStatus').textContent = 'Agordu Supabase por aktivigi abonadon.';
      observe();
      return;
    }

    try {
      const [settingsRes, socialRes, projectRes] = await Promise.all([
        sb.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        sb.from('social_links').select('*').order('sort_order', { ascending: true }),
        sb.from('projects').select('*,project_images(*)').eq('published', true).order('created_at', { ascending: false })
      ]);

      if (settingsRes.error) console.warn('site_settings:', settingsRes.error);
      if (socialRes.error) console.warn('social_links:', socialRes.error);
      if (projectRes.error) console.warn('projects:', projectRes.error);

      if (settingsRes.data) settings = { ...settings, ...settingsRes.data };
      socials = socialRes.data || [];
      projects = projectRes.data || [];

      applyTheme();
      renderProfile();
      renderSocials();
      renderCategories();
      renderProjects();
      observe();
    } catch (error) {
      console.error(error);
      $('formStatus').textContent = 'Ne eblas ŝargi la datumojn nun.';
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const status = $('formStatus');
    const payload = {
      name: $('senderName').value.trim(),
      email: $('senderEmail').value.trim(),
      request_type: $('requestType').value,
      message: $('senderMessage').value.trim()
    };

    if (!sb) {
      status.textContent = 'La formularo bezonas konektitan Supabase.';
      return;
    }

    status.textContent = 'Sendante…';
    const { error } = await sb.from('messages').insert(payload);
    if (error) {
      console.error(error);
      status.textContent = 'Ne eblis sendi la mesaĝon. Provu denove.';
      return;
    }
    status.textContent = 'Mesaĝo sendita. Dankon!';
    form.reset();
  }

  async function subscribe(event) {
    event.preventDefault();
    const email = $('subscriberEmail').value.trim().toLowerCase();
    const status = $('newsletterStatus');

    if (!sb) {
      status.textContent = 'Abonado bezonas konektitan Supabase.';
      return;
    }

    status.textContent = 'Registrante…';
    const { error } = await sb.from('subscribers').insert({ email });
    if (error && error.code !== '23505') {
      console.error(error);
      status.textContent = 'Ne eblis registri la retpoŝton.';
      return;
    }
    status.textContent = '✓ Vi estas abonita.';
    $('newsletterForm').reset();
  }

  function bind() {
    $('year').textContent = new Date().getFullYear();

    $('menuBtn').addEventListener('click', () => {
      const nav = $('mainNav');
      const open = nav.classList.toggle('open');
      $('menuBtn').setAttribute('aria-expanded', String(open));
    });

    document.querySelectorAll('#mainNav a').forEach((a) => {
      a.addEventListener('click', () => {
        $('mainNav').classList.remove('open');
        $('menuBtn').setAttribute('aria-expanded', 'false');
      });
    });

    document.querySelectorAll('[data-request]').forEach((link) => {
      link.addEventListener('click', () => {
        const request = link.dataset.request;
        const select = $('requestType');
        const option = [...select.options].find((o) => o.text === request);
        if (option) select.value = option.value;
      });
    });

    $('contactForm').addEventListener('submit', sendMessage);
    $('newsletterForm').addEventListener('submit', subscribe);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') document.querySelector('.modal')?.remove();
    });
  }

  bind();
  load();
})();
