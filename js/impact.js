// Counter — slow and smooth using requestAnimationFrame
document.addEventListener('DOMContentLoaded', function () {
  const counters = document.querySelectorAll('.counter');
  const duration = 2800; // ms — total animation time

  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      counter.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
      else counter.textContent = target.toLocaleString();
    }

    requestAnimationFrame(update);
  });
});
