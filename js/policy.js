function paShow(id){document.querySelectorAll('.pa-pane').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');}
  function paNavActive(el){document.querySelectorAll('.pa-nav-item').forEach(n=>n.classList.remove('active'));el.classList.add('active');}
