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

  const MAX_MB = 8;
  const MIN_IMAGES = 4;
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

  let settings = null, socials = [], projects = [], messages = [], subscribers = [];

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));

  function setStatus(text, error = false) {
    $('saveState').textContent = text;
    $('saveState').classList.toggle('error', error);
  }

  function setLoginError(text) {
    $('loginError').textContent = text;
  }

async function verifyAdmin(userId) {
  console.log("========== VERIFY ADMIN ==========");
  console.log("UID recherché :", userId);

  const { data, error } = await sb
    .from('admins')
    .select('*')
    .eq('user_id', userId);

  console.log("Résultat admins :", data);
  console.log("Erreur Supabase :", error);

  if (error) {
    console.error("ERREUR ADMIN :", error);
    return false;
  }

  if (!data || data.length === 0) {
    console.warn("AUCUN ADMIN TROUVÉ POUR CE UID");
    return false;
  }

  console.log("ADMIN TROUVÉ :", data[0]);
  return true;
}

  async function start() {
    if (!sb) {
      setLoginError('Antaŭ ol uzi la administradon, agordu supabase-config.js.');
      return;
    }
    const { data: { session } } = await sb.auth.getSession();
    if (session && await verifyAdmin(session.user.id)) {
      await showDash(session);
    } else if (session) {
      await sb.auth.signOut();
      setLoginError('Ĉi tiu konto ne estas registrita kiel administranto.');
    }
  }

  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!sb) return;
    setLoginError('');
    const email = $('emailInput').value.trim();
    const password = $('passwordInput').value;

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      setLoginError('Ensaluto malsukcesis. Kontrolu la retpoŝton kaj pasvorton.');
      return;
    }

    if (!await verifyAdmin(data.session.user.id)) {
      await sb.auth.signOut();
      setLoginError('La konto estas valida, sed ĝi ne havas administrajn rajtojn.');
      return;
    }

    await showDash(data.session);
  });

  async function showDash(session) {
    $('loginPanel').classList.add('hidden');
    $('dashboard').classList.remove('hidden');
    $('adminIdentity').textContent = session.user.email || '';
    await loadData();
  }

  $('logoutBtn').addEventListener('click', async () => {
    await sb.auth.signOut();
    $('dashboard').classList.add('hidden');
    $('loginPanel').classList.remove('hidden');
    $('passwordInput').value = '';
  });

  async function loadData() {
    setStatus('Ŝargante…');
    const [s, so, p, m, sub] = await Promise.all([
      sb.from('site_settings').select('*').eq('id', 1).maybeSingle(),
      sb.from('social_links').select('*').order('sort_order', { ascending: true }),
      sb.from('projects').select('*,project_images(*)').order('created_at', { ascending: false }),
      sb.from('messages').select('*').order('created_at', { ascending: false }),
      sb.from('subscribers').select('*').order('created_at', { ascending: false })
    ]);

    if (s.error || so.error || p.error || m.error || sub.error) {
      console.error({ s, so, p, m, sub });
      setStatus('Eraro dum ŝargado. Kontrolu Supabase/RLS.', true);
      return;
    }

    settings = s.data || {};
    socials = so.data || [];
    projects = p.data || [];
    messages = m.data || [];
    subscribers = sub.data || [];
    fill();
    setStatus('Datumoj ŝargitaj.');
  }

  function fill() {
    $('aName').value = settings.name || '';
    $('aEmail').value = settings.email || '';
    $('aPhone').value = settings.phone || '';
    $('aLocation').value = settings.location || '';
    $('aTagline').value = settings.tagline || '';
    $('aBio').value = settings.bio || '';
    $('aAccent').value = settings.accent || '#dfff3f';
    $('aBg').value = settings.background || '#08090d';
    $('aFont').value = settings.font || 'Inter';
    renderMedia('profilePreview', settings.profile_image);
    renderMedia('bgPreview', settings.background_image);
    renderSocials();
    renderProjects();
    renderMessages();
    renderSubscribers();
  }

  function renderMedia(id, url) {
    $(id).innerHTML = url
      ? `<img src="${esc(url)}" alt="" loading="lazy">`
      : '<span class="muted">Neniu dosiero elektita.</span>';
  }

  function renderSocials() {
    $('socialEditor').innerHTML = socials.map((s, i) =>
      `<div class="editor-item">
        <div class="row">
          <input data-s="${i}" data-k="name" value="${esc(s.name)}" placeholder="Platformo">
          <input data-s="${i}" data-k="url" value="${esc(s.url)}" placeholder="https://...">
        </div>
        <div class="editor-actions"><button type="button" class="mini-btn danger" data-remove-social="${s.id}">Forigi</button></div>
      </div>`
    ).join('');

    $('socialEditor').querySelectorAll('[data-remove-social]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Forigi ĉi tiun ligilon?')) return;
        const { error } = await sb.from('social_links').delete().eq('id', button.dataset.removeSocial);
        if (error) setStatus(error.message, true); else await loadData();
      });
    });
  }

  function renderProjects() {
    $('projectEditor').innerHTML = projects.map((p, i) => {
      const imgs = [...(p.project_images || [])].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
      const readyToPublish = imgs.length >= MIN_IMAGES;
      return `<div class="editor-item project-admin">
        <div class="project-admin-head">
          <div><b>${esc(p.title || 'Nova projekto')}</b><span class="badge ${readyToPublish ? 'ok' : 'warn'}">${imgs.length}/${MIN_IMAGES} bildoj</span></div>
          <span class="muted">${p.published ? 'Publikigita' : 'Malpublikigita'}</span>
        </div>
        <div class="row">
          <input data-p="${i}" data-k="title" value="${esc(p.title)}" placeholder="Nomo">
          <select data-p="${i}" data-k="category">
            ${['ĈIO','GRAFIKA DESIGNO','FOTOGRAFIO','VIDEO','CINEMO','WEB','PROJEKTOJ'].map((c) => `<option ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <textarea data-p="${i}" data-k="description" rows="3" placeholder="Malgranda priskribo">${esc(p.description)}</textarea>
        <input data-p="${i}" data-k="collaborators" value="${esc(p.collaborators || '')}" placeholder="Kunlaborantoj / organizoj">
        <label class="switch"><input data-p="${i}" data-k="published" type="checkbox" ${p.published ? 'checked' : ''}> Publikigi projekton</label>
        <div class="upload-row">
          <div><input type="file" multiple accept="image/jpeg,image/png,image/webp" data-images="${p.id}">
          <div class="upload-help">JPG / PNG / WebP · max. ${MAX_MB} MB · rekomendita 1600×1000 px.</div></div>
          <span class="muted">${readyToPublish ? '✓ Minimumo atingita' : `⚠ Aldonu ${MIN_IMAGES - imgs.length} bild${MIN_IMAGES - imgs.length === 1 ? 'on' : 'ojn'}`}</span>
        </div>
        <div class="image-list">
          ${imgs.map((im, j) => `<div class="admin-image">
            <img src="${esc(im.public_url)}" alt="" loading="lazy">
            <span>#${j + 1}</span>
            <button type="button" class="mini-btn danger" data-delete-image="${im.id}" data-path="${esc(im.storage_path)}">Forigi</button>
          </div>`).join('')}
        </div>
        <div class="editor-actions"><button type="button" class="mini-btn danger" data-delete-project="${p.id}">Forigi projekton</button></div>
      </div>`;
    }).join('');

    $('projectEditor').querySelectorAll('[data-images]').forEach((input) => {
      input.addEventListener('change', () => uploadImages(input.dataset.images, input.files));
    });
    $('projectEditor').querySelectorAll('[data-delete-image]').forEach((button) => {
      button.addEventListener('click', () => deleteImage(button.dataset.deleteImage, button.dataset.path));
    });
    $('projectEditor').querySelectorAll('[data-delete-project]').forEach((button) => {
      button.addEventListener('click', () => deleteProject(button.dataset.deleteProject));
    });
  }

  function renderMessages() {
    $('messageCount').textContent = String(messages.filter((m) => !m.read).length);
    $('messagesEditor').innerHTML = messages.length
      ? messages.map((m) => `<div class="editor-item message-item">
          <div><b>${esc(m.name)}</b><span class="muted"> · ${esc(m.email)} · ${new Date(m.created_at).toLocaleString()}</span></div>
          <strong>${esc(m.request_type)}</strong><p>${esc(m.message)}</p>
          <div class="editor-actions">
            <button type="button" class="mini-btn" data-read="${m.id}">${m.read ? 'Legita' : 'Marki legita'}</button>
            <button type="button" class="mini-btn danger" data-delete-message="${m.id}">Forigi</button>
          </div>
        </div>`).join('')
      : '<p class="muted">Neniu mesaĝo.</p>';

    document.querySelectorAll('[data-read]').forEach((button) => {
      button.addEventListener('click', async () => {
        await sb.from('messages').update({ read: true }).eq('id', button.dataset.read);
        await loadData();
      });
    });
    document.querySelectorAll('[data-delete-message]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Forigi ĉi tiun mesaĝon?')) return;
        await sb.from('messages').delete().eq('id', button.dataset.deleteMessage);
        await loadData();
      });
    });
  }

  function renderSubscribers() {
    $('subscriberCount').textContent = String(subscribers.length);
    $('subscribersEditor').innerHTML = subscribers.length
      ? subscribers.map((s) => `<div class="subscriber-row"><div><b>${esc(s.email)}</b><span class="muted"> · ${new Date(s.created_at).toLocaleString()}</span></div><button type="button" class="mini-btn danger" data-delete-subscriber="${s.id}">Forigi</button></div>`).join('')
      : '<p class="muted">Neniu abonanto.</p>';

    document.querySelectorAll('[data-delete-subscriber]').forEach((button) => {
      button.addEventListener('click', async () => {
        if (!confirm('Forigi ĉi tiun abonanton?')) return;
        await sb.from('subscribers').delete().eq('id', button.dataset.deleteSubscriber);
        await loadData();
      });
    });
  }

  $('addSocial').addEventListener('click', async () => {
    const { error } = await sb.from('social_links').insert({
      name: 'Nova platformo', url: 'https://', sort_order: socials.length
    });
    if (error) setStatus(error.message, true); else await loadData();
  });

  $('addProject').addEventListener('click', async () => {
    const { data, error } = await sb.from('projects').insert({
      title: 'Nova projekto', description: 'Priskribo de la projekto.',
      category: 'ĈIO', collaborators: '', published: false
    }).select('*,project_images(*)').single();

    if (error) {
      setStatus(error.message, true);
      return;
    }
    projects.unshift(data);
    renderProjects();
    setStatus('Nova projekto kreita. Aldonu almenaŭ 4 bildojn.');
  });

  async function deleteProject(id) {
    if (!confirm('Ĉu vi vere volas forigi ĉi tiun projekton kaj ĉiujn ĝiajn bildojn?')) return;
    const project = projects.find((p) => p.id === id);
    const paths = (project?.project_images || []).map((x) => x.storage_path).filter(Boolean);
    if (paths.length) await sb.storage.from('portfolio-media').remove(paths);
    const { error } = await sb.from('projects').delete().eq('id', id);
    if (error) setStatus(error.message, true); else await loadData();
  }

  async function deleteImage(id, path) {
    if (!confirm('Forigi ĉi tiun bildon?')) return;
    const { error: storageError } = await sb.storage.from('portfolio-media').remove([path]);
    if (storageError) console.warn(storageError);
    const { error } = await sb.from('project_images').delete().eq('id', id);
    if (error) setStatus(error.message, true); else await loadData();
  }

  function validateFile(file) {
    if (!ALLOWED.includes(file.type)) return 'Formato ne subtenata. Uzu JPG, PNG aŭ WebP.';
    if (file.size > MAX_MB * 1024 * 1024) return `Dosiero tro granda. Maksimumo ${MAX_MB} MB.`;
    return '';
  }

  function checkDimensions(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => {
        const result = { width: image.naturalWidth, height: image.naturalHeight };
        URL.revokeObjectURL(url);
        resolve(result);
      };
      image.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      image.src = url;
    });
  }

  async function uploadImages(projectId, fileList) {
    const files = [...fileList];
    if (!files.length) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    let nextOrder = Math.max(-1, ...(project.project_images || []).map((x) => Number(x.sort_order ?? -1))) + 1;

    for (const file of files) {
      const validation = validateFile(file);
      if (validation) {
        setStatus(`${file.name}: ${validation}`, true);
        continue;
      }

      const dims = await checkDimensions(file);
      if (dims && (dims.width < 1200 || dims.height < 750)) {
        setStatus(`${file.name}: bildo iom malgranda (${dims.width}×${dims.height}). Rekomendo: almenaŭ 1600×1000 px.`, true);
        continue;
      }

      const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
      const path = `projects/${projectId}/${crypto.randomUUID()}-${safe}`;

      const { error: uploadError } = await sb.storage.from('portfolio-media').upload(path, file, {
        upsert: false, contentType: file.type, cacheControl: '31536000'
      });

      if (uploadError) {
        setStatus(`Upload malsukcesis: ${uploadError.message}`, true);
        continue;
      }

      const { data: urlData } = sb.storage.from('portfolio-media').getPublicUrl(path);
      const { error: dbError } = await sb.from('project_images').insert({
        project_id: projectId,
        storage_path: path,
        public_url: urlData.publicUrl,
        alt_text: project.title || '',
        sort_order: nextOrder++
      });

      if (dbError) {
        await sb.storage.from('portfolio-media').remove([path]);
        setStatus(`Bildo alŝutita sed ne registrita: ${dbError.message}`, true);
      }
    }

    await loadData();
    setStatus('Bildoj sinkronigitaj kun la publika retejo.');
  }

  async function handleSpecialUploads() {
    for (const [inputId, column] of [['profileFile', 'profile_image'], ['bgFile', 'background_image']]) {
      const input = $(inputId);
      if (!input.files?.length) continue;

      const file = input.files[0];
      const validation = validateFile(file);
      if (validation) {
        setStatus(validation, true);
        continue;
      }

      const path = `site/${column}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]+/g, '-')}`;
      const { error: uploadError } = await sb.storage.from('portfolio-media').upload(path, file, {
        upsert: false, contentType: file.type, cacheControl: '31536000'
      });

      if (uploadError) {
        setStatus(uploadError.message, true);
        continue;
      }

      const { data } = sb.storage.from('portfolio-media').getPublicUrl(path);
      const { error: updateError } = await sb.from('site_settings').update({ [column]: data.publicUrl }).eq('id', 1);
      if (updateError) {
        setStatus(updateError.message, true);
        continue;
      }
    }
  }

  $('saveAllBtn').addEventListener('click', async () => {
    if (!sb) return;
    setStatus('Konservante…');

    const settingsUpdate = {
      id: 1,
      name: $('aName').value.trim(),
      email: $('aEmail').value.trim(),
      phone: $('aPhone').value.trim(),
      location: $('aLocation').value.trim(),
      tagline: $('aTagline').value.trim(),
      bio: $('aBio').value.trim(),
      accent: $('aAccent').value,
      background: $('aBg').value,
      font: $('aFont').value,
      updated_at: new Date().toISOString()
    };

    const { error: settingsError } = await sb.from('site_settings').upsert(settingsUpdate);
    if (settingsError) {
      setStatus(settingsError.message, true);
      return;
    }

    for (const input of document.querySelectorAll('[data-s]')) {
      const index = Number(input.dataset.s);
      if (socials[index]) socials[index][input.dataset.k] = input.value.trim();
    }
    for (const social of socials) {
      const { error } = await sb.from('social_links').update({
        name: social.name, url: social.url
      }).eq('id', social.id);
      if (error) setStatus(error.message, true);
    }

    for (const input of document.querySelectorAll('[data-p]')) {
      const index = Number(input.dataset.p);
      if (!projects[index]) continue;
      projects[index][input.dataset.k] = input.type === 'checkbox' ? input.checked : input.value;
    }

    for (const project of projects) {
      const count = (project.project_images || []).length;
      if (project.published && count < MIN_IMAGES) {
        project.published = false;
        setStatus(`“${project.title}” ne estas publikigita: minimumo ${MIN_IMAGES} bildoj.`, true);
      }

      const { error } = await sb.from('projects').update({
        title: String(project.title || '').trim(),
        description: String(project.description || '').trim(),
        category: project.category,
        collaborators: String(project.collaborators || '').trim(),
        published: Boolean(project.published),
        updated_at: new Date().toISOString()
      }).eq('id', project.id);

      if (error) setStatus(`${project.title}: ${error.message}`, true);
    }

    await handleSpecialUploads();
    await loadData();
    setStatus('✓ Ŝanĝoj konservitaj kaj sinkronigitaj.');
  });

  start();
})();
