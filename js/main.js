// Shared Spursbase Foundation header and footer.
class Myheader extends HTMLElement {
connectedCallback() {
  this.innerHTML = `
    <header class="site-header">
      <div class="container">

        <!-- Logo -->
            <a href="/index.html" class="logo" aria-label="Spursbase Foundation home">
          <img src="/img/SpursbasefoundationlandscapeB-08.png" alt="Spursbase Foundation Logo" />
        </a>

        <!-- Main navigation (moved inside container) -->
        <nav class="main-nav" id="primary-navigation" aria-label="Main navigation" aria-hidden="false">
          <ul class="nav-menu">
            <li><a href="/index.html">Home</a></li>
            <li><a href="/pages/about.html">About</a></li>
            <li><a href="/pages/library.html">Library</a></li>
            <li><a href="/pages/blog.html">Blog</a></li>
            <li class="dropdown"><a href="/pages/involve.html">Get Involved</a></li>
            <li><a href="/pages/contact.html">Contact</a></li>
          </ul>
        </nav>

        <!-- Right side group -->
        <div class="header-right">
          <!-- Mobile menu toggle -->
          <button class="nav-toggle" type="button" aria-label="Open navigation menu" aria-controls="primary-navigation" aria-expanded="false">Menu</button>

          <!-- Donate button -->
          <a class="donate-btn" href="/pages/donation.html">
            <span class="donate-text">Donate Now</span>
          </a>
        </div>

      </div>
    </header>
  `;


    // Get elements
    this._toggleBtn = this.querySelector('.nav-toggle');
    this._mainNav = this.querySelector('.main-nav');

    if (!this._toggleBtn || !this._mainNav) return;

    // Toggle menu
    this._toggleMenu = (ev) => {
      ev.stopPropagation();
      const isOpen = this._mainNav.classList.toggle('open');
      this.querySelector('.site-header')?.classList.toggle('menu-open', isOpen);
      this._toggleBtn.setAttribute('aria-expanded', isOpen);
      this._toggleBtn.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      this._toggleBtn.textContent = isOpen ? 'Close' : 'Menu';
      this._mainNav.setAttribute('aria-hidden', !isOpen);
    };

    // Close menu when clicking outside
    this._outsideClickHandler = (ev) => {
      if (this._mainNav.classList.contains('open') && !this.contains(ev.target)) {
        this._mainNav.classList.remove('open');
        this.querySelector('.site-header')?.classList.remove('menu-open');
        this._toggleBtn.setAttribute('aria-expanded', 'false');
        this._toggleBtn.setAttribute('aria-label', 'Open navigation menu');
        this._toggleBtn.textContent = 'Menu';
        this._mainNav.setAttribute('aria-hidden', 'true');
      }
    };

    // Escape key closes menu
    this._escHandler = (ev) => {
      if (ev.key === 'Escape') {
        this._mainNav.classList.remove('open');
        this.querySelector('.site-header')?.classList.remove('menu-open');
        this._toggleBtn.setAttribute('aria-expanded', 'false');
        this._toggleBtn.setAttribute('aria-label', 'Open navigation menu');
        this._toggleBtn.textContent = 'Menu';
        this._mainNav.setAttribute('aria-hidden', 'true');
      }
    };

    this._navClickHandler = (ev) => {
      if (!(ev.target instanceof Element) || !ev.target.closest('a')) return;
      this._mainNav.classList.remove('open');
      this.querySelector('.site-header')?.classList.remove('menu-open');
      this._toggleBtn.setAttribute('aria-expanded', 'false');
      this._toggleBtn.setAttribute('aria-label', 'Open navigation menu');
      this._toggleBtn.textContent = 'Menu';
      this._mainNav.setAttribute('aria-hidden', 'false');
    };

    this._resizeHandler = () => {
      if (window.matchMedia('(min-width: 769px)').matches) {
        this._mainNav.classList.remove('open');
        this.querySelector('.site-header')?.classList.remove('menu-open');
        this._toggleBtn.setAttribute('aria-expanded', 'false');
        this._toggleBtn.setAttribute('aria-hidden', 'true');
        this._toggleBtn.textContent = 'Menu';
        this._mainNav.setAttribute('aria-hidden', 'false');
      } else {
        this._toggleBtn.removeAttribute('aria-hidden');
        if (!this._mainNav.classList.contains('open')) this._mainNav.setAttribute('aria-hidden', 'true');
      }
    };

    // Event listeners
    this._toggleBtn.addEventListener('click', this._toggleMenu);
    this._mainNav.addEventListener('click', this._navClickHandler);
    document.addEventListener('click', this._outsideClickHandler);
    document.addEventListener('keydown', this._escHandler);
    window.addEventListener('resize', this._resizeHandler);
    this._resizeHandler();
  }

  disconnectedCallback() {
    if (this._toggleBtn) this._toggleBtn.removeEventListener('click', this._toggleMenu);
    if (this._mainNav) this._mainNav.removeEventListener('click', this._navClickHandler);
    document.removeEventListener('click', this._outsideClickHandler);
    document.removeEventListener('keydown', this._escHandler);
    window.removeEventListener('resize', this._resizeHandler);
  }
}

if (!customElements.get('my-header')) customElements.define('my-header', Myheader);



/* Footer component */
class Myfooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer" style="background-image:url('/img/Footer.jpg')">

        <!-- TOP GRID -->
        <div class="footer-top">

          <!-- COL 1: Brand + Address -->
          <div class="footer-brand">
            <img src="/img/SpursbasefoundationlandscapeB-08.png" alt="Spursbase Foundation" class="footer-logo" />
            <p class="footer-tagline">Empowering vulnerable children and families through education, healthcare, and community development.</p>
            <div class="footer-address">
              <div class="footer-contact-item">
                <i class="fas fa-map-marker-alt"></i>
                <span>GA-414-3438, La Bawaleshie,<br>East Legon, Accra, Ghana</span>
              </div>
              <div class="footer-contact-item">
                <i class="fas fa-envelope"></i>
                <a href="mailto:info@spursbasefoundation.org">info@spursbasefoundation.org</a>
              </div>
            </div>
          </div>

          <!-- COL 2: Quick Links -->
          <div class="footer-links-col">
            <span class="footer-col-title">Quick Links</span>
            <ul>
                <li><a href="/index.html">Home</a></li>
                <li><a href="/pages/about.html">About Us</a></li>
                <li><a href="/pages/library.html">Library</a></li>
                <li><a href="/pages/involve.html">Get Involved</a></li>
                <li><a href="/pages/donation.html">Donate</a></li>
                <li><a href="/pages/contact.html">Contact Us</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>

          <!-- COL 3: Programs -->
          <div class="footer-programs-col">
            <a href="/pages/programs.html" class="footer-col-title">Our Programs</a>
            <ul>
              <li><a href="/pages/education.html">Education Programs</a></li>
              <li><a href="/pages/health.html">Health &amp; Wellbeing</a></li>
              <li><a href="/pages/community.html">Community Development</a></li>
              <li><a href="/pages/policy.html">Policy &amp; Advocacy</a></li>
              <li><a href="/pages/elevate.html">Elevate Hub</a></li>
              <li><a href="/pages/innovation.html">Innovation Development</a></li>
            </ul>
          </div>

          <!-- COL 4: Newsletter + Social -->
          <div class="footer-newsletter-col">
            <span class="footer-col-title">Newsletter</span>
            <p class="footer-newsletter-text">Subscribe to receive updates on our projects, events, and impact stories.</p>
            <form action="#" method="post" class="newsletter-form">
              <input type="email" name="email" aria-label="Your Email Address" placeholder="Your Email Address" required />
              <button type="submit" class="btn btn-orange">Subscribe</button>
            </form>
            <span class="footer-follow-label">Follow Us</span>
            <div class="social-icons">
              <a href="https://x.com/Spursbase_F" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="https://www.facebook.com/spursbasefoundation" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/spursbasefoundation/" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="https://www.youtube.com/@SpursbaseFoundation" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
              <a href="https://www.linkedin.com/in/spursbase-foundationi-8560b8287/" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            </div>
          </div>

        </div>
        <!-- END TOP GRID -->

        <!-- BOTTOM BAR -->
        <div class="footer-bottom">
          <p>&copy; 2025 Spursbase Foundation. All Rights Reserved.</p>
          <ul class="footer-bottom-links">
            <li><a href="/pages/privacy.html">Privacy Policy</a></li>
            <li><a href="https://www.spursbasefoundation.org/terms.html">Terms &amp; Conditions</a></li>
            <li><a href="/pages/annual-reports.html">Annual Reports</a></li>
          </ul>
        </div>
      </footer>
    `;
  }
}

if (!customElements.get('my-footer')) customElements.define('my-footer', Myfooter);

function initializeHomeCarousel() {
  const carousel = document.querySelector('.hero-slider');
  if (!carousel || carousel.dataset.carouselReady === 'true') return;

  const slides = Array.from(carousel.querySelectorAll('.swiper-slide'));
  if (slides.length < 2) return;

  let activeIndex = 0;
  let interval;
  let typingInterval;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const titles = slides.map((slide) => {
    const heading = slide.querySelector('h1');
    if (!heading) return null;
    const text = heading.textContent.trim();
    const typedText = document.createElement('span');
    typedText.className = 'hero-title-text';
    typedText.setAttribute('aria-hidden', 'true');
    heading.setAttribute('aria-label', text);
    heading.replaceChildren(typedText);
    return { heading, text, typedText };
  });

  function typeHeading(index) {
    if (typingInterval !== undefined) {
      window.clearInterval(typingInterval);
      typingInterval = undefined;
    }
    const title = titles[index];
    if (!title) return;

    title.typedText.textContent = '';
    if (reduceMotion) {
      title.typedText.textContent = title.text;
      return;
    }

    let character = 0;
    typingInterval = window.setInterval(() => {
      character += 1;
      title.typedText.textContent = title.text.slice(0, character);
      if (character >= title.text.length && typingInterval !== undefined) {
        window.clearInterval(typingInterval);
        typingInterval = undefined;
      }
    }, 38);
  }

  slides.forEach((slide, index) => {
    slide.classList.toggle('is-active', index === activeIndex);
    slide.setAttribute('aria-hidden', String(index !== activeIndex));
    if (index !== activeIndex) slide.setAttribute('inert', '');
  });

  function showSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const active = index === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      if (active) slide.removeAttribute('inert');
      else slide.setAttribute('inert', '');
    });
    typeHeading(activeIndex);
  }

  function startAutoplay() {
    if (interval !== undefined || document.hidden) return;
    interval = window.setInterval(() => showSlide(activeIndex + 1), 3000);
  }

  function stopAutoplay() {
    if (interval === undefined) return;
    window.clearInterval(interval);
    interval = undefined;
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowLeft') showSlide(activeIndex - 1);
    if (event.key === 'ArrowRight') showSlide(activeIndex + 1);
  }

  carousel.addEventListener('keydown', handleKeydown);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('aria-label', 'Spursbase Foundation highlights');
  carousel.dataset.carouselReady = 'true';
  typeHeading(activeIndex);
  startAutoplay();
}

function initializeStaticLibrary() {
  const library = document.querySelector('[data-library-browser]');
  if (!library) return;

  const search = library.querySelector('[data-library-search]');
  const filters = Array.from(library.querySelectorAll('[data-library-filter]'));
  const cards = Array.from(library.querySelectorAll('[data-library-category]'));
  const count = library.querySelector('[data-library-count]');
  const empty = library.querySelector('[data-library-empty]');
  let activeCategory = 'all';

  function updateResults() {
    const query = (search?.value ?? '').trim().toLocaleLowerCase();
    let visibleCount = 0;
    cards.forEach((card) => {
      const matchesCategory = activeCategory === 'all' || card.dataset.libraryCategory === activeCategory;
      const matchesSearch = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !(matchesCategory && matchesSearch);
      if (!card.hidden) visibleCount += 1;
    });
    if (count) count.textContent = `${visibleCount} ${visibleCount === 1 ? 'resource' : 'resources'}`;
    if (empty) empty.hidden = visibleCount > 0;
  }

  filters.forEach((filter) => filter.addEventListener('click', () => {
    activeCategory = filter.dataset.libraryFilter ?? 'all';
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button === filter)));
    updateResults();
  }));
  search?.addEventListener('input', updateResults);
  updateResults();
}

function initializePageInteractions() {
  initializeHomeCarousel();
  initializeStaticLibrary();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePageInteractions, { once: true });
} else {
  initializePageInteractions();
}