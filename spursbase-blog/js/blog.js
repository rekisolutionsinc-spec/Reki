/* blog.js — Spursbase Foundation
   Reads /blog-data/posts.json (written by the admin) and builds
   the blog listing (blog.html) and single article (article.html). */
(() => {
  const DATA = '/blog-data/posts.json';
  const TYPES = { blog: 'Blog', article: 'Article', news: 'News', story: 'Story' };

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const day = (d) => String(d || '').slice(0, 10);
  const fmt = (d) => new Date(day(d) + 'T00:00:00').toLocaleDateString('en-GB',
    { day: 'numeric', month: 'long', year: 'numeric' });
  const link = (p) => 'article.html?slug=' + encodeURIComponent(p.slug);
  const label = (t) => TYPES[t] || 'Blog';
  const $ = (id) => document.getElementById(id);

  async function load() {
    const res = await fetch(DATA, { cache: 'no-cache' });
    if (!res.ok) throw new Error('Could not load posts');
    const all = await res.json();
    return all.filter((p) => p.status !== 'draft')
      .sort((a, b) => day(b.date).localeCompare(day(a.date)));
  }

  function card(p) {
    return `<article class="blog-card">
      <a class="blog-card-img" href="${link(p)}" tabindex="-1" aria-hidden="true">
        <img src="${esc(p.thumb)}" alt="" loading="lazy" /></a>
      <div class="blog-card-content">
        <div class="blog-card-meta">
          <span class="blog-type blog-type--${esc(p.type)}">${label(p.type)}</span>
          ${p.topic ? `<span class="blog-topic">${esc(p.topic)}</span>` : ''}
        </div>
        <h3><a href="${link(p)}">${esc(p.title)}</a></h3>
        <p>${esc(p.excerpt)}</p>
        <time class="blog-date" datetime="${day(p.date)}">${fmt(p.date)}</time>
      </div></article>`;
  }

  /* ───────── LISTING ───────── */
  async function initList() {
    let posts;
    try { posts = await load(); } catch (e) {
      $('blog-grid').innerHTML = '<p class="blog-empty">Stories could not be loaded. Please refresh the page.</p>';
      return;
    }
    const state = { type: '', topic: '', q: '' };

    const types = Object.keys(TYPES).filter((t) => posts.some((p) => p.type === t));
    $('type-chips').innerHTML = [['', 'All']].concat(types.map((t) => [t, label(t)]))
      .map(([v, l]) => `<button class="type-chip" type="button" data-type="${v}" aria-pressed="${v === ''}">${l}</button>`)
      .join('');

    const topics = [...new Set(posts.map((p) => p.topic).filter(Boolean))].sort();
    $('topic').innerHTML = '<option value="">All topics</option>' +
      topics.map((t) => `<option>${esc(t)}</option>`).join('');

    function render() {
      const q = state.q.trim().toLowerCase();
      const list = posts.filter((p) =>
        (!state.type || p.type === state.type) &&
        (!state.topic || p.topic === state.topic) &&
        (!q || [p.title, p.excerpt, p.topic].some((v) => String(v || '').toLowerCase().includes(q))));
      const filtering = state.type || state.topic || q;
      const feat = !filtering ? list.find((p) => p.featured) : null;
      const rest = feat ? list.filter((p) => p !== feat) : list;

      const f = $('featured');
      if (feat) {
        f.hidden = false;
        f.innerHTML = `<div class="featured-blog-image"><img src="${esc(feat.thumb)}" alt="${esc(feat.thumbAlt)}" /></div>
          <div class="featured-blog-content">
            <span class="featured-tag">Featured ${label(feat.type).toLowerCase()}</span>
            <h2><a href="${link(feat)}">${esc(feat.title)}</a></h2>
            <time class="blog-date" datetime="${day(feat.date)}">${fmt(feat.date)}</time>
            <p class="featured-excerpt">${esc(feat.excerpt)}</p>
            <a class="read-more-btn" href="${link(feat)}">Read ${label(feat.type).toLowerCase()}</a>
          </div>`;
      } else { f.hidden = true; f.innerHTML = ''; }

      $('blog-count').textContent = `${list.length} ${list.length === 1 ? 'post' : 'posts'}`;
      $('blog-grid').innerHTML = rest.length ? rest.map(card).join('')
        : (list.length ? '' : '<div class="blog-empty" style="grid-column:1/-1"><h3>Nothing found</h3><p>Try a different search or clear the filters.</p><button type="button" id="clear">Show all posts</button></div>');
      const clear = $('clear');
      if (clear) clear.onclick = () => {
        state.type = state.topic = state.q = '';
        $('topic').value = ''; $('q').value = ''; sync(); render();
      };
    }
    function sync() {
      document.querySelectorAll('.type-chip').forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.type === state.type)));
    }

    $('type-chips').addEventListener('click', (e) => {
      const b = e.target.closest('.type-chip'); if (!b) return;
      state.type = b.dataset.type; sync(); render();
    });
    $('topic').addEventListener('change', (e) => { state.topic = e.target.value; render(); });
    $('q').addEventListener('input', (e) => { state.q = e.target.value; render(); });
    render();
  }

  /* ───────── ARTICLE ───────── */
  function lightbox() {
    const box = document.createElement('div');
    box.className = 'lightbox'; box.hidden = true;
    box.innerHTML = '<button type="button" aria-label="Close picture">✕</button><img alt="" />';
    document.body.appendChild(box);
    const close = () => { box.hidden = true; };
    box.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    return (src, alt) => { box.querySelector('img').src = src; box.querySelector('img').alt = alt || ''; box.hidden = false; };
  }

  async function initArticle() {
    const slug = new URLSearchParams(location.search).get('slug');
    const root = $('article-root');
    let posts;
    try { posts = await load(); } catch (e) {
      root.innerHTML = '<p class="blog-message">This story could not be loaded. Please refresh the page.</p>'; return;
    }
    const p = posts.find((x) => x.slug === slug);
    if (!p) {
      root.innerHTML = '<div class="blog-message"><h1>Story not found</h1><p>It may have been moved or unpublished.</p><p><a href="blog.html">Back to all stories</a></p></div>';
      return;
    }
    document.title = `${p.title} | Spursbase Foundation`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = p.excerpt;

    const here = location.href;
    const enc = encodeURIComponent;
    const gallery = (p.gallery || []).filter((g) => g && g.src);
    const related = posts.filter((x) => x.slug !== p.slug)
      .sort((a, b) => (b.topic === p.topic) - (a.topic === p.topic) || day(b.date).localeCompare(day(a.date)))
      .slice(0, 3);

    root.innerHTML = `
      <header class="article-head">
        <p class="article-crumb"><a href="blog.html">Blog</a> / ${label(p.type)}</p>
        <div class="blog-card-meta">
          <span class="blog-type blog-type--${esc(p.type)}">${label(p.type)}</span>
          ${p.topic ? `<span class="blog-topic">${esc(p.topic)}</span>` : ''}
        </div>
        <h1>${esc(p.title)}</h1>
        <div class="article-meta">
          <time datetime="${day(p.date)}">${fmt(p.date)}</time>
          ${p.author ? `<span>By ${esc(p.author)}</span>` : ''}
        </div>
      </header>
      <div class="article-hero"><figure><img src="${esc(p.thumb)}" alt="${esc(p.thumbAlt)}" /></figure></div>
      <div class="article-body">${p.body || ''}</div>
      ${gallery.length ? `<section class="article-gallery" aria-label="More pictures">
        <h2>More pictures</h2>
        <div class="gallery-grid">${gallery.map((g) =>
          `<button type="button" data-src="${esc(g.src)}" data-alt="${esc(g.alt)}" aria-label="View picture larger"><img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" /></button>`).join('')}</div>
      </section>` : ''}
      <div class="article-share">
        <span>Share</span>
        <a class="share-btn" target="_blank" rel="noopener" href="https://wa.me/?text=${enc(p.title + ' ' + here)}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> WhatsApp</a>
        <a class="share-btn" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${enc(here)}"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i> Facebook</a>
        <a class="share-btn" target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${enc(here)}&text=${enc(p.title)}"><i class="fa-brands fa-x-twitter" aria-hidden="true"></i> X</a>
        <button class="share-btn" type="button" id="copy-link"><i class="fa-solid fa-link" aria-hidden="true"></i> <span id="copy-text" style="font-weight:700;margin:0">Copy link</span></button>
      </div>
      ${related.length ? `<section class="related"><div class="blog-wrap">
        <h2>You might also be interested in</h2>
        <div class="blog-grid">${related.map(card).join('')}</div></div></section>` : ''}`;

    const show = lightbox();
    root.addEventListener('click', (e) => {
      const g = e.target.closest('.gallery-grid button');
      if (g) return show(g.dataset.src, g.dataset.alt);
      const img = e.target.closest('.article-body figure img');
      if (img) show(img.src, img.alt);
    });
    $('copy-link').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(here); $('copy-text').textContent = 'Link copied'; }
      catch (e) { $('copy-text').textContent = 'Press Ctrl+C to copy'; }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if ($('blog-grid')) initList();
    if ($('article-root')) initArticle();
  });
})();
