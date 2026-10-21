import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" style={{ backgroundImage: "url('/img/Footer.jpg')" }}>
      <div className="footer-top">
        <div className="footer-brand">
          <img src="/img/SpursbasefoundationlandscapeB-08.png" alt="Spursbase Foundation" className="footer-logo" />
          <p className="footer-tagline">Empowering vulnerable children and families through education, healthcare, and community development.</p>
          <div className="footer-address">
            <div className="footer-contact-item">
              <span>GA-414-3438, La Bawaleshie,<br />East Legon, Accra, Ghana</span>
            </div>
            <div className="footer-contact-item">
              <a href="mailto:info@spursbasefoundation.org">info@spursbasefoundation.org</a>
            </div>
          </div>
        </div>

        <div className="footer-links-col">
          <span className="footer-col-title">Quick Links</span>
          <ul>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/library">Library</Link></li>
            <li><Link href="/involve">Get Involved</Link></li>
            <li><Link href="/donation">Donate</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-programs-col">
          <Link href="/programs" className="footer-col-title">Our Programs</Link>
          <ul>
            <li><Link href="/education">Education Programs</Link></li>
            <li><Link href="/health">Health &amp; Wellbeing</Link></li>
            <li><Link href="/community">Community Development</Link></li>
            <li><Link href="/policy">Policy &amp; Advocacy</Link></li>
            <li><Link href="/elevate">Elevate Hub</Link></li>
            <li><Link href="/innovation">Innovation Development</Link></li>
          </ul>
        </div>

        <div className="footer-newsletter-col">
          <span className="footer-col-title">Newsletter</span>
          <p className="footer-newsletter-text">Subscribe for updates on our projects, events, and impact stories.</p>
          <form action="#" method="post" className="newsletter-form">
            <input type="email" name="email" aria-label="Your Email Address" placeholder="Your Email Address" required />
            <button type="submit" className="btn btn-orange">Subscribe</button>
          </form>
          <span className="footer-follow-label">Follow Us</span>
          <div className="social-icons">
            <a href="https://x.com/Spursbase_F" aria-label="X">X</a>
            <a href="https://www.facebook.com/spursbasefoundation" aria-label="Facebook">f</a>
            <a href="https://www.instagram.com/spursbasefoundation/" aria-label="Instagram">in</a>
            <a href="https://www.youtube.com/@SpursbaseFoundation" aria-label="YouTube">▶</a>
            <a href="https://www.linkedin.com/in/spursbase-foundationi-8560b8287/" aria-label="LinkedIn">in</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Spursbase Foundation. All Rights Reserved.</p>
        <ul className="footer-bottom-links">
          <li><Link href="/privacy">Privacy Policy</Link></li>
          <li><a href="https://www.spursbasefoundation.org/terms.html">Terms &amp; Conditions</a></li>
          <li><Link href="/annual-reports">Annual Reports</Link></li>
        </ul>
      </div>
    </footer>
  );
}