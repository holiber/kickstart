function qs(sel, root = document) {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

function setTab(next) {
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-tab]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"][data-panel]'));

  for (const t of tabs) {
    const isSelected = t.getAttribute('data-tab') === next;
    t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  }

  for (const p of panels) {
    const isSelected = p.getAttribute('data-panel') === next;
    p.classList.toggle('hidden', !isSelected);
  }
}

async function loadVideos() {
  const container = qs('#videos');
  container.innerHTML = '<div class="muted">Loading…</div>';
  try {
    const res = await fetch('./videos.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load videos.json (${res.status})`);
    const data = await res.json();
    const videos = Array.isArray(data?.videos) ? data.videos : [];

    if (videos.length === 0) {
      container.innerHTML = '<div class="muted">No videos found under artifacts/.</div>';
      return;
    }

    container.innerHTML = '';
    for (const p of videos) {
      const wrap = document.createElement('div');
      wrap.className = 'video-item';
      wrap.setAttribute('data-testid', 'video-item');

      const code = document.createElement('div');
      code.className = 'video-path';
      code.textContent = p;

      const video = document.createElement('video');
      video.controls = true;
      video.src = `./${p}`;
      video.setAttribute('preload', 'metadata');

      wrap.appendChild(code);
      wrap.appendChild(video);
      container.appendChild(wrap);
    }
  } catch (err) {
    container.innerHTML = `<div class="muted">Error: ${String(err)}</div>`;
  }
}

function boot() {
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-tab]'));
  for (const tab of tabs) {
    tab.addEventListener('click', async () => {
      const next = tab.getAttribute('data-tab');
      if (!next) return;
      setTab(next);
      if (next === 'videos') await loadVideos();
    });
  }
}

boot();
