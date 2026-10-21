function prgShowSection(id, tab) {
    document.querySelectorAll('.prg-section').forEach(s => s.classList.remove('prg-section--active'));
    document.querySelectorAll('.prg-sidebar__tab').forEach(t => t.classList.remove('prg-sidebar__tab--active'));
    document.getElementById(id).classList.add('prg-section--active');
    tab.classList.add('prg-sidebar__tab--active');
  }

  function prgCardClick(event, title, text) {
    document.getElementById('prg-modal-title').innerText = title;
    document.getElementById('prg-modal-text').innerText  = text;
    document.getElementById('prg-modal').classList.add('prg-modal--open');
  }

  function prgCloseModal() {
    document.getElementById('prg-modal').classList.remove('prg-modal--open');
  }

  document.getElementById('prg-modal').addEventListener('click', function(e) {
    if (e.target === this) prgCloseModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') prgCloseModal(); });
