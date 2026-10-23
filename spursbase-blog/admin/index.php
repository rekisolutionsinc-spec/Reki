<?php
declare(strict_types=1);
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();
require __DIR__ . '/config.php';

$ROOT    = dirname(__DIR__);
$PRIVATE = __DIR__ . '/data/posts.json';       // all posts incl. drafts (blocked from web by data/.htaccess)
$PUBLIC  = $ROOT . '/blog-data/posts.json';    // published posts only (read by the website)
$UPLOADS = $ROOT . '/uploads/blog';
const TYPES = ['blog', 'article', 'news', 'story'];

function read_posts(): array {
    global $PRIVATE;
    if (!is_file($PRIVATE)) return [];
    $d = json_decode((string) file_get_contents($PRIVATE), true);
    return is_array($d) ? $d : [];
}
function write_posts(array $posts): void {
    global $PRIVATE, $PUBLIC;
    usort($posts, fn($a, $b) => strcmp($b['date'], $a['date']));
    $posts = array_values($posts);
    $pub = array_values(array_filter($posts, fn($p) => ($p['status'] ?? 'published') === 'published'));
    $flags = JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
    foreach ([[$PRIVATE, $posts], [$PUBLIC, $pub]] as [$file, $data]) {
        if (!is_dir(dirname($file))) mkdir(dirname($file), 0755, true);
        if (file_put_contents($file, json_encode($data, $flags), LOCK_EX) === false) {
            out(['error' => 'Could not save. Check that the folder ' . basename(dirname($file)) . ' is writable (permissions 755).'], 500);
        }
    }
}
function out($data, int $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function slugify(string $s): string {
    $s = strtolower(trim($s));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim((string) $s, '-') ?: 'post';
}
function clean_html(string $h): string {
    $h = strip_tags($h, '<p><h2><h3><strong><b><em><i><u><ul><ol><li><a><br><blockquote><figure><img><figcaption>');
    $h = preg_replace('/\son\w+\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/i', '', $h);
    $h = preg_replace('/(href|src)\s*=\s*(["\'])\s*javascript:[^"\']*\2/i', '$1=$2#$2', $h);
    return (string) $h;
}
function shrink(string $path, string $mime): void {
    if (!function_exists('imagecreatefromjpeg') || !in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) return;
    $info = @getimagesize($path);
    if (!$info || $info[0] <= 1800) return;
    $img = match ($mime) { 'image/jpeg' => @imagecreatefromjpeg($path), 'image/png' => @imagecreatefrompng($path), default => @imagecreatefromwebp($path) };
    if (!$img) return;
    $small = imagescale($img, 1800);
    if ($small) match ($mime) { 'image/jpeg' => imagejpeg($small, $path, 85), 'image/png' => imagepng($small, $path), default => imagewebp($small, $path, 85) };
}

/* ---------- logout ---------- */
if (isset($_GET['logout'])) { $_SESSION = []; session_destroy(); header('Location: ./'); exit; }

/* ---------- login / first-time setup ---------- */
$error = ''; $newHash = '';
if (ADMIN_PASSWORD_HASH === '' && isset($_POST['new_password'])) {
    if (strlen($_POST['new_password']) < 10) $error = 'Use at least 10 characters.';
    else $newHash = password_hash($_POST['new_password'], PASSWORD_DEFAULT);
} elseif (ADMIN_PASSWORD_HASH !== '' && isset($_POST['password'])) {
    if (password_verify($_POST['password'], ADMIN_PASSWORD_HASH)) {
        session_regenerate_id(true);
        $_SESSION['ok'] = true;
        $_SESSION['csrf'] = bin2hex(random_bytes(16));
        header('Location: ./'); exit;
    }
    sleep(1); $error = 'Wrong password.';
}
$authed = !empty($_SESSION['ok']);

/* ---------- API ---------- */
if (isset($_GET['action'])) {
    if (!$authed) out(['error' => 'Please log in again.'], 401);
    if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF'] ?? '')) out(['error' => 'Session expired. Refresh the page.'], 403);
    $action = $_GET['action'];

    if ($action === 'upload') {
        $f = $_FILES['file'] ?? null;
        if (!$f || $f['error'] !== UPLOAD_ERR_OK) out(['error' => 'Upload failed. Try a smaller image.'], 400);
        if ($f['size'] > 10 * 1024 * 1024) out(['error' => 'Image is over 10 MB.'], 400);
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']);
        $ext = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'][$mime] ?? null;
        if (!$ext) out(['error' => 'Use a JPG, PNG, WebP or GIF image.'], 400);
        if (!is_dir($UPLOADS)) mkdir($UPLOADS, 0755, true);
        $name = date('Ymd') . '-' . bin2hex(random_bytes(5)) . '.' . $ext;
        if (!move_uploaded_file($f['tmp_name'], "$UPLOADS/$name")) out(['error' => 'Could not store the image. Check that uploads/blog is writable.'], 500);
        shrink("$UPLOADS/$name", $mime);
        out(['url' => '/uploads/blog/' . $name]);
    }

    if ($action === 'save') {
        $in = json_decode(file_get_contents('php://input'), true);
        if (!is_array($in)) out(['error' => 'Bad request.'], 400);
        $title = trim((string) ($in['title'] ?? ''));
        $thumb = trim((string) ($in['thumb'] ?? ''));
        $excerpt = trim((string) ($in['excerpt'] ?? ''));
        if ($title === '') out(['error' => 'Add a title.'], 422);
        if ($thumb === '' || !preg_match('#^(/|https?://)#', $thumb)) out(['error' => 'Add a thumbnail image.'], 422);
        if ($excerpt === '') out(['error' => 'Add a short summary (shown on the cards).'], 422);

        $posts = read_posts();
        $id = preg_replace('/[^a-z0-9]/', '', (string) ($in['id'] ?? '')) ?: bin2hex(random_bytes(6));
        $base = slugify((string) (($in['slug'] ?? '') ?: $title));
        $slug = $base; $n = 2;
        $taken = fn($s) => count(array_filter($posts, fn($p) => $p['slug'] === $s && $p['id'] !== $id)) > 0;
        while ($taken($slug)) $slug = $base . '-' . $n++;

        $gallery = [];
        foreach (($in['gallery'] ?? []) as $g) {
            $src = trim((string) ($g['src'] ?? ''));
            if ($src !== '' && preg_match('#^(/|https?://)#', $src)) $gallery[] = ['src' => $src, 'alt' => trim((string) ($g['alt'] ?? ''))];
        }
        $post = [
            'id' => $id, 'slug' => $slug, 'title' => $title,
            'type' => in_array($in['type'] ?? '', TYPES, true) ? $in['type'] : 'blog',
            'topic' => trim((string) ($in['topic'] ?? '')),
            'excerpt' => $excerpt,
            'date' => preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($in['date'] ?? '')) ? $in['date'] : date('Y-m-d'),
            'author' => trim((string) ($in['author'] ?? '')),
            'featured' => !empty($in['featured']),
            'status' => ($in['status'] ?? '') === 'draft' ? 'draft' : 'published',
            'thumb' => $thumb, 'thumbAlt' => trim((string) ($in['thumbAlt'] ?? '')),
            'body' => clean_html((string) ($in['body'] ?? '')),
            'gallery' => $gallery,
        ];
        $found = false;
        foreach ($posts as $i => $p) if ($p['id'] === $id) { $posts[$i] = $post; $found = true; }
        if (!$found) $posts[] = $post;
        write_posts($posts);
        out(['posts' => read_posts(), 'slug' => $slug]);
    }

    if ($action === 'delete') {
        $in = json_decode(file_get_contents('php://input'), true);
        $posts = array_values(array_filter(read_posts(), fn($p) => $p['id'] !== ($in['id'] ?? '')));
        write_posts($posts);
        out(['posts' => read_posts()]);
    }
    out(['error' => 'Unknown action.'], 400);
}
header('X-Robots-Tag: noindex');
?><!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Blog admin | Spursbase Foundation</title>
<style>
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#1c1c2e;background:#f5f6fa}
a{color:#2b2b88}button,input,select,textarea{font:inherit}
.top{background:#2b2b88;color:#fff;display:flex;justify-content:space-between;align-items:center;padding:14px 5%}
.top a{color:#fff}
.wrap{max-width:1000px;margin:28px auto;padding:0 5%}
.card{background:#fff;border:1px solid #e4e4ef;border-radius:12px;padding:24px}
h1,h2{margin:0 0 16px}
.btn{background:#d9481a;color:#fff;border:0;border-radius:8px;padding:11px 20px;font-weight:700;cursor:pointer}
.btn.alt{background:#fff;color:#2b2b88;border:1.5px solid #2b2b88}
.btn.danger{background:#fff;color:#b00020;border:1.5px solid #b00020}
.btn:disabled{opacity:.6;cursor:wait}
label{display:block;font-weight:700;margin:16px 0 6px}
.hint{font-weight:400;color:#5a5a72;font-size:.88rem}
input[type=text],input[type=date],input[type=password],select,textarea{width:100%;padding:10px 12px;border:1.5px solid #cfcfe0;border-radius:8px;background:#fff}
textarea{min-height:80px}
.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #e4e4ef;vertical-align:middle}
td img{width:72px;height:54px;object-fit:cover;border-radius:6px;display:block}
.badge{font-size:.78rem;font-weight:700;padding:2px 10px;border-radius:50px;background:#e9e9f7;color:#2b2b88}
.badge.draft{background:#fff3cd;color:#7a5a00}
.err{color:#b00020;font-weight:700}
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1c1c2e;color:#fff;padding:12px 22px;border-radius:8px;z-index:50}
.thumb-box{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
.thumb-box img{width:240px;height:160px;object-fit:cover;border-radius:10px;background:#e4e4ef}
.toolbar{display:flex;flex-wrap:wrap;gap:6px;padding:8px;border:1.5px solid #cfcfe0;border-bottom:0;border-radius:8px 8px 0 0;background:#f5f6fa}
.toolbar button{background:#fff;border:1px solid #cfcfe0;border-radius:6px;padding:6px 12px;cursor:pointer;font-weight:700}
#body{min-height:320px;padding:16px;border:1.5px solid #cfcfe0;border-radius:0 0 8px 8px;background:#fff;line-height:1.7;overflow:auto}
#body figure{margin:16px 0}#body img{max-width:100%;height:auto;border-radius:8px}#body figcaption{color:#5a5a72;font-size:.9rem}
#body blockquote{border-left:4px solid #ff6633;margin:12px 0;padding-left:14px;font-style:italic}
.gal{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px;margin-top:10px}
.gal div{border:1px solid #e4e4ef;border-radius:10px;padding:8px}.gal img{width:100%;height:110px;object-fit:cover;border-radius:6px}
.gal input{margin-top:6px;padding:6px 8px;font-size:.85rem}.gal button{margin-top:6px;width:100%}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px;align-items:center}
code{background:#eef;padding:2px 6px;border-radius:4px;word-break:break-all}
@media(max-width:640px){.row{grid-template-columns:1fr}}
</style></head><body>

<?php if (!$authed): ?>
<div class="wrap" style="max-width:460px"><div class="card">
  <h1>Blog admin</h1>
  <?php if (ADMIN_PASSWORD_HASH === ''): ?>
    <?php if ($newHash): ?>
      <p>Almost done. Open <code>admin/config.php</code> in cPanel File Manager and replace its content with this line, then save and refresh this page:</p>
      <p><code>&lt;?php const ADMIN_PASSWORD_HASH = '<?= htmlspecialchars($newHash) ?>';</code></p>
    <?php else: ?>
      <p>First time here. Choose a password for the blog admin.</p>
      <?php if ($error) echo '<p class="err">' . htmlspecialchars($error) . '</p>'; ?>
      <form method="post"><label for="np">New password <span class="hint">(10+ characters)</span></label>
      <input id="np" type="password" name="new_password" required minlength="10"><div class="actions"><button class="btn">Create password</button></div></form>
    <?php endif; ?>
  <?php else: ?>
    <?php if ($error) echo '<p class="err">' . htmlspecialchars($error) . '</p>'; ?>
    <form method="post"><label for="pw">Password</label>
    <input id="pw" type="password" name="password" required autofocus><div class="actions"><button class="btn">Log in</button></div></form>
  <?php endif; ?>
</div></div>

<?php else: ?>
<div class="top"><strong>Spursbase blog admin</strong><a href="?logout=1">Log out</a></div>

<div class="wrap" id="list-view">
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:12px">
      <h2 style="margin:0">All posts</h2><button class="btn" id="new">New post</button></div>
    <div style="overflow-x:auto"><table><thead><tr><th></th><th>Title</th><th>Type</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody id="rows"></tbody></table></div>
  </div>
</div>

<div class="wrap" id="edit-view" hidden>
  <div class="card">
    <h2 id="edit-title">New post</h2>
    <label for="title">Title</label><input type="text" id="title" maxlength="140">
    <div class="row">
      <div><label for="type">Type</label>
        <select id="type"><option value="blog">Blog</option><option value="article">Article</option><option value="news">News</option><option value="story">Story</option></select></div>
      <div><label for="topic">Topic <span class="hint">(pick or type a new one)</span></label>
        <input type="text" id="topic" list="topics" maxlength="40"><datalist id="topics"></datalist></div>
    </div>
    <div class="row">
      <div><label for="date">Date</label><input type="date" id="date"></div>
      <div><label for="author">Author <span class="hint">(optional)</span></label><input type="text" id="author" maxlength="80"></div>
    </div>
    <label for="excerpt">Short summary <span class="hint">(shown on the cards)</span></label>
    <textarea id="excerpt" maxlength="260"></textarea>

    <label>Thumbnail <span class="hint">(opens the article and shows on the blog page)</span></label>
    <div class="thumb-box">
      <img id="thumb-preview" alt="Thumbnail preview" hidden>
      <div><input type="file" id="thumb-file" accept="image/*">
        <label for="thumbAlt" style="margin-top:12px">Describe the picture <span class="hint">(for screen readers)</span></label>
        <input type="text" id="thumbAlt"></div>
    </div>

    <label>Story <span class="hint">(use “Add picture” to place photos between paragraphs)</span></label>
    <div class="toolbar" id="toolbar">
      <button type="button" data-cmd="p">Paragraph</button><button type="button" data-cmd="h2">Heading</button>
      <button type="button" data-cmd="h3">Subheading</button><button type="button" data-cmd="bold"><b>B</b></button>
      <button type="button" data-cmd="italic"><i>I</i></button><button type="button" data-cmd="ul">List</button>
      <button type="button" data-cmd="quote">Quote</button><button type="button" data-cmd="link">Link</button>
      <button type="button" data-cmd="image">Add picture</button>
    </div>
    <input type="file" id="body-file" accept="image/*" hidden>
    <div id="body" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Story text"></div>

    <label>More pictures <span class="hint">(a gallery shown under the story)</span></label>
    <input type="file" id="gal-file" accept="image/*" multiple>
    <div class="gal" id="gal"></div>

    <div class="row">
      <div><label for="status">Status</label><select id="status"><option value="published">Published</option><option value="draft">Draft (hidden)</option></select></div>
      <div><label for="slug">Web address ending <span class="hint">(auto if empty)</span></label><input type="text" id="slug"></div>
    </div>
    <label style="display:flex;gap:10px;align-items:center;font-weight:700"><input type="checkbox" id="featured"> Feature this post at the top of the blog</label>

    <p class="err" id="err"></p>
    <div class="actions"><button class="btn" id="save">Save post</button><button class="btn alt" id="cancel" type="button">Back to all posts</button></div>
  </div>
</div>

<script>
const CSRF = <?= json_encode($_SESSION['csrf']) ?>;
let posts = <?= json_encode(read_posts(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE) ?>;
let current = null, gallery = [], savedRange = null;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

async function api(action, { json, body } = {}) {
  const headers = { 'X-CSRF': CSRF };
  if (json) headers['Content-Type'] = 'application/json';
  const r = await fetch('?action=' + action, { method: 'POST', headers, body: json ? JSON.stringify(json) : body });
  const d = await r.json().catch(() => ({ error: 'Unexpected server response.' }));
  if (!r.ok) throw new Error(d.error || 'Something went wrong.');
  return d;
}
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
async function upload(file) { const fd = new FormData(); fd.append('file', file); return (await api('upload', { body: fd })).url; }

function renderList() {
  $('rows').innerHTML = posts.length ? posts.map((p) => `<tr>
    <td><img src="${esc(p.thumb)}" alt=""></td><td><strong>${esc(p.title)}</strong></td>
    <td>${esc(p.type)}</td><td>${esc(p.date)}</td>
    <td><span class="badge ${p.status === 'draft' ? 'draft' : ''}">${p.status === 'draft' ? 'Draft' : 'Published'}</span></td>
    <td style="white-space:nowrap"><button class="btn alt" data-edit="${p.id}">Edit</button> <button class="btn danger" data-del="${p.id}">Delete</button></td></tr>`).join('')
    : '<tr><td colspan="6">No posts yet. Select “New post” to write your first one.</td></tr>';
  $('topics').innerHTML = [...new Set(posts.map((p) => p.topic).filter(Boolean))].map((t) => `<option value="${esc(t)}">`).join('');
}
function show(view) { $('list-view').hidden = view !== 'list'; $('edit-view').hidden = view !== 'edit'; window.scrollTo(0, 0); }

function renderGallery() {
  $('gal').innerHTML = gallery.map((g, i) => `<div><img src="${esc(g.src)}" alt="">
    <input type="text" data-alt="${i}" placeholder="Describe picture" value="${esc(g.alt)}">
    <button type="button" class="btn danger" data-rm="${i}">Remove</button></div>`).join('');
}
function setThumb(url) { const i = $('thumb-preview'); i.hidden = !url; if (url) i.src = url; $('thumb-preview').dataset.url = url || ''; }

function openEditor(p) {
  current = p;
  $('edit-title').textContent = p ? 'Edit post' : 'New post';
  $('title').value = p?.title ?? ''; $('type').value = p?.type ?? 'blog'; $('topic').value = p?.topic ?? '';
  $('date').value = p?.date ?? new Date().toISOString().slice(0, 10); $('author').value = p?.author ?? 'Spursbase Foundation';
  $('excerpt').value = p?.excerpt ?? ''; $('thumbAlt').value = p?.thumbAlt ?? ''; setThumb(p?.thumb ?? '');
  $('body').innerHTML = p?.body ?? '<p><br></p>'; gallery = (p?.gallery ?? []).map((g) => ({ ...g })); renderGallery();
  $('status').value = p?.status ?? 'published'; $('slug').value = p?.slug ?? ''; $('featured').checked = !!p?.featured; $('err').textContent = '';
  show('edit');
}

$('new').onclick = () => openEditor(null);
$('cancel').onclick = () => show('list');
$('rows').onclick = async (e) => {
  const ed = e.target.closest('[data-edit]'), del = e.target.closest('[data-del]');
  if (ed) openEditor(posts.find((p) => p.id === ed.dataset.edit));
  if (del) {
    const p = posts.find((x) => x.id === del.dataset.del);
    if (!confirm(`Delete “${p.title}”? This cannot be undone.`)) return;
    try { posts = (await api('delete', { json: { id: p.id } })).posts; renderList(); toast('Deleted'); } catch (err) { alert(err.message); }
  }
};

$('thumb-file').onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try { setThumb(await upload(f)); } catch (err) { $('err').textContent = err.message; }
  e.target.value = '';
};
$('gal-file').onchange = async (e) => {
  try { for (const f of e.target.files) gallery.push({ src: await upload(f), alt: '' }); renderGallery(); } catch (err) { $('err').textContent = err.message; }
  e.target.value = '';
};
$('gal').oninput = (e) => { if (e.target.dataset.alt !== undefined) gallery[+e.target.dataset.alt].alt = e.target.value; };
$('gal').onclick = (e) => { const b = e.target.closest('[data-rm]'); if (b) { gallery.splice(+b.dataset.rm, 1); renderGallery(); } };

/* rich text editor */
document.execCommand('defaultParagraphSeparator', false, 'p');
$('body').addEventListener('paste', (e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); });
$('toolbar').addEventListener('mousedown', (e) => e.preventDefault());
$('toolbar').addEventListener('click', (e) => {
  const b = e.target.closest('[data-cmd]'); if (!b) return;
  const c = b.dataset.cmd; $('body').focus();
  if (c === 'p' || c === 'h2' || c === 'h3') document.execCommand('formatBlock', false, c);
  else if (c === 'quote') document.execCommand('formatBlock', false, 'blockquote');
  else if (c === 'bold' || c === 'italic') document.execCommand(c);
  else if (c === 'ul') document.execCommand('insertUnorderedList');
  else if (c === 'link') { const u = prompt('Paste the link (https://…)'); if (u) document.execCommand('createLink', false, u); }
  else if (c === 'image') {
    const s = getSelection(); savedRange = s.rangeCount && $('body').contains(s.anchorNode) ? s.getRangeAt(0) : null;
    $('body-file').click();
  }
});
$('body-file').onchange = async (e) => {
  const f = e.target.files[0]; if (!f) return; e.target.value = '';
  try {
    const url = await upload(f);
    const caption = prompt('Caption for this picture (optional)') || '';
    $('body').focus();
    if (savedRange) { const s = getSelection(); s.removeAllRanges(); s.addRange(savedRange); }
    document.execCommand('insertHTML', false, `<figure><img src="${esc(url)}" alt="${esc(caption)}"><figcaption>${esc(caption)}</figcaption></figure><p><br></p>`);
  } catch (err) { $('err').textContent = err.message; }
};

$('save').onclick = async () => {
  const btn = $('save'); btn.disabled = true; $('err').textContent = '';
  try {
    const d = await api('save', { json: {
      id: current?.id, title: $('title').value, type: $('type').value, topic: $('topic').value, date: $('date').value,
      author: $('author').value, excerpt: $('excerpt').value, thumb: $('thumb-preview').dataset.url, thumbAlt: $('thumbAlt').value,
      body: $('body').innerHTML, gallery, status: $('status').value, slug: $('slug').value, featured: $('featured').checked } });
    posts = d.posts; renderList(); show('list'); toast('Saved');
  } catch (err) { $('err').textContent = err.message; }
  btn.disabled = false;
};
renderList();
</script>
<?php endif; ?>
</body></html>
