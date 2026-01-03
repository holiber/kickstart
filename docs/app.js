function qs(sel, root = document) {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

function qsa(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

function setTab(next) {
  const tabs = qsa('[role="tab"][data-tab]');
  const panels = qsa('[role="tabpanel"][data-panel]');

  for (const t of tabs) {
    const isSelected = t.getAttribute('data-tab') === next;
    t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    t.setAttribute('data-state', isSelected ? 'active' : 'inactive');
  }

  for (const p of panels) {
    const isSelected = p.getAttribute('data-panel') === next;
    p.classList.toggle('hidden', !isSelected);
  }
}

function getThemePreference() {
  const v = localStorage.getItem('theme');
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}

function applyTheme(pref) {
  // dark mode uses a class on <html>, matching Tailwind's `darkMode: 'class'`.
  const root = document.documentElement;
  root.classList.remove('dark');

  if (pref === 'dark') {
    root.classList.add('dark');
    return;
  }

  if (pref === 'light') return;

  // system
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    root.classList.add('dark');
  }
}

function bootTheme() {
  const select = qs('#theme');
  const pref = getThemePreference();
  select.value = pref;
  applyTheme(pref);

  select.addEventListener('change', () => {
    const next = select.value;
    localStorage.setItem('theme', next);
    applyTheme(next);
  });

  // If we are following system theme, re-apply when it changes.
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  if (!mq) return;
  mq.addEventListener('change', () => {
    if (getThemePreference() === 'system') applyTheme('system');
  });
}

let cachedVideoPaths = null;

function normalizeVideosJson(payload) {
  const list = Array.isArray(payload?.videos) ? payload.videos : [];
  return list.filter((p) => typeof p === 'string');
}

function renderVideos(paths, filterText) {
  const container = qs('#videos');
  const meta = qs('#videosMeta');

  const q = String(filterText || '').trim().toLowerCase();
  const filtered = q ? paths.filter((p) => p.toLowerCase().includes(q)) : paths;

  meta.textContent =
    filtered.length === paths.length
      ? `${paths.length} video${paths.length === 1 ? '' : 's'} found`
      : `${filtered.length} / ${paths.length} videos`;

  if (filtered.length === 0) {
    container.innerHTML =
      '<div class="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">No matching videos.</div>';
    return;
  }

  container.innerHTML = '';

  for (const p of filtered) {
    const card = document.createElement('div');
    card.className = 'rounded-lg border border-border bg-card shadow-sm';
    card.setAttribute('data-testid', 'video-item');

    const top = document.createElement('div');
    top.className =
      'flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between';

    const code = document.createElement('code');
    code.className = 'break-all text-xs text-muted-foreground';
    code.textContent = p;

    const actions = document.createElement('div');
    actions.className = 'flex items-center gap-2';

    const open = document.createElement('a');
    open.className =
      'inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring';
    open.href = `./${p}`;
    open.target = '_blank';
    open.rel = 'noreferrer';
    open.textContent = 'Open';

    const copy = document.createElement('button');
    copy.className =
      'inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring';
    copy.type = 'button';
    copy.textContent = 'Copy link';
    copy.addEventListener('click', async () => {
      const url = new URL(`./${p}`, window.location.href).toString();
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard API not available');
        await navigator.clipboard.writeText(url);
        copy.textContent = 'Copied';
        setTimeout(() => {
          copy.textContent = 'Copy link';
        }, 900);
      } catch {
        // Fallback: prompt still works on GH Pages and is better than silently failing.
        window.prompt('Copy link:', url);
      }
    });

    actions.appendChild(open);
    actions.appendChild(copy);
    top.appendChild(code);
    top.appendChild(actions);

    const body = document.createElement('div');
    body.className = 'p-3';

    const video = document.createElement('video');
    video.controls = true;
    video.src = `./${p}`;
    video.setAttribute('preload', 'metadata');
    video.className = 'w-full rounded-md bg-black';

    body.appendChild(video);
    card.appendChild(top);
    card.appendChild(body);
    container.appendChild(card);
  }
}

async function loadVideos({ force = false } = {}) {
  const container = qs('#videos');
  const meta = qs('#videosMeta');
  const filter = qs('#videoFilter');

  if (cachedVideoPaths && !force) {
    renderVideos(cachedVideoPaths, filter.value);
    return;
  }

  meta.textContent = 'Loading…';
  container.innerHTML = '<div class="text-sm text-muted-foreground">Loading…</div>';

  try {
    const res = await fetch('./videos.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load videos.json (${res.status})`);
    const data = await res.json();
    cachedVideoPaths = normalizeVideosJson(data);

    if (cachedVideoPaths.length === 0) {
      meta.textContent = '0 videos found';
      container.innerHTML =
        '<div class="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">No videos found under <code>artifacts/</code>.</div>';
      return;
    }

    renderVideos(cachedVideoPaths, filter.value);
  } catch (err) {
    meta.textContent = 'Error';
    container.innerHTML = `<div class="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">Error: ${String(
      err,
    )}</div>`;
  }
}

function bootTabs() {
  const tabs = qsa('[role="tab"][data-tab]');
  for (const tab of tabs) {
    tab.addEventListener('click', async () => {
      const next = tab.getAttribute('data-tab');
      if (!next) return;
      setTab(next);
      if (next === 'videos') await loadVideos();
    });
  }
}

function bootVideosControls() {
  const filter = qs('#videoFilter');
  const reload = qs('#reloadVideos');

  filter.addEventListener('input', () => {
    if (!cachedVideoPaths) return;
    renderVideos(cachedVideoPaths, filter.value);
  });

  reload.addEventListener('click', async () => {
    await loadVideos({ force: true });
  });
}

function boot() {
  bootTheme();
  bootTabs();
  bootVideosControls();
}

boot();
