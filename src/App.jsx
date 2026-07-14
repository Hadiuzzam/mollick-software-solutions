import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Blocks,
  Check,
  ChevronRight,
  CloudCog,
  Cpu,
  Globe2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MonitorSmartphone,
  Rocket,
  ShieldCheck,
  Smartphone,
  X,
  Zap
} from 'lucide-react';

const services = [
  {
    title: 'Mobile Apps',
    text: 'Android and iOS applications with clean UX, reliable releases, and React Native delivery.',
    icon: Smartphone
  },
  {
    title: 'Websites',
    text: 'Fast marketing sites, business portals, dashboards, and React/Vite frontends.',
    icon: Globe2
  },
  {
    title: 'Server Systems',
    text: 'Node.js APIs, backend logic, integrations, deployment support, and scalable architecture.',
    icon: CloudCog
  },
  {
    title: 'IoT Devices',
    text: 'Device connectivity, sensor dashboards, firmware-aware integrations, and data pipelines.',
    icon: Cpu
  }
];

const stack = ['React Native', 'Vite', 'React.js', 'Node.js', 'REST APIs', 'IoT Integration'];

const process = [
  'Understand the business goal',
  'Design a clear user flow',
  'Build in focused releases',
  'Test, optimize, and launch'
];

const contactCards = [
  {
    title: 'Email',
    text: 'hadiuzzamanmollick07@gmail.com',
    href: 'mailto:hadiuzzamanmollick07@gmail.com',
    icon: Mail
  },
  {
    title: 'WhatsApp',
    text: '01818225467',
    href: 'https://wa.me/8801818225467',
    icon: MessageCircle
  },
  {
    title: 'Location',
    text: 'Dhanbandhi, Sirajganj Sadar, Sirajganj',
    href: 'https://www.google.com/maps/search/?api=1&query=Dhanbandhi%2C%20Sirajganj%20Sadar%2C%20Sirajganj',
    icon: MapPin
  }
];

const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="Mollick Software Solutions home">
          <span className="brand-icon">
            <img src={assetPath('mollick-mark.png')} alt="" />
          </span>
          <span>
            <strong>Mollick</strong>
            <small>Software Solutions</small>
          </span>
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={menuOpen ? 'nav-links open' : 'nav-links'} aria-label="Primary navigation">
          <a onClick={closeMenu} href="#services">Services</a>
          <a onClick={closeMenu} href="#stack">Stack</a>
          <a onClick={closeMenu} href="#process">Process</a>
          <a onClick={closeMenu} href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <img className="hero-logo" src={assetPath('mollick-logo.png')} alt="Mollick Software Solutions logo" />
            <span className="eyebrow"><Zap size={16} /> Premium software team</span>
            <h1>Mollick Software Solutions</h1>
            <p>
              We build fast, smooth, user-friendly digital products for mobile, web, server, and IoT.
              A focused engineering team for companies that need reliable execution.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#contact">
                Start a project <ArrowRight size={18} />
              </a>
              <a className="secondary-button" href="#services">
                View services <ChevronRight size={18} />
              </a>
            </div>

            <div className="proof-strip" aria-label="Company qualities">
              <span><Check size={16} /> Light</span>
              <span><Check size={16} /> Fast</span>
              <span><Check size={16} /> Smooth</span>
              <span><Check size={16} /> Responsive</span>
            </div>
          </div>

          <div className="hero-visual" aria-label="Software, server, and IoT product ecosystem">
            <img src={assetPath('brand-ecosystem.png')} alt="Mobile app, web dashboard, server, and IoT device setup" />
          </div>
        </section>

        <section className="section-band intro-band reveal">
          <div className="section-grid">
            <div>
              <span className="section-kicker">What we do</span>
              <h2>Product engineering from idea to launch.</h2>
            </div>
            <div className="intro-copy">
              <p>
                We are a four-person team: two software engineers, one Figma designer, and one IoT engineer.
                That mix helps us design usable interfaces, write clean software, and connect real devices to
                practical digital systems.
              </p>
              <div className="intro-tags" aria-label="Team strengths">
                <span>4 person core team</span>
                <span>Design + code + IoT</span>
                <span>Launch-ready delivery</span>
              </div>
            </div>
          </div>
        </section>

        <section className="services-section reveal" id="services">
          <div className="section-heading reveal">
            <span className="section-kicker">Services</span>
            <h2>Everything a modern product needs.</h2>
          </div>

          <div className="service-grid">
            {services.map(({ title, text, icon: Icon }, index) => (
              <article className={`service-card reveal stagger-${index + 1}`} key={title}>
                <Icon size={26} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-band stack-band reveal" id="stack">
          <div className="section-heading compact">
            <span className="section-kicker">Technology</span>
            <h2>Built with tools we use every day.</h2>
          </div>

          <div className="stack-grid">
            {stack.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </section>

        <section className="split-section reveal">
          <div className="split-copy reveal stagger-1">
            <span className="section-kicker">Why us</span>
            <h2>Small team, careful execution, premium finish.</h2>
            <p>
              We keep communication direct, designs realistic, and builds maintainable. The result is a
              software partner that can move quickly without making the product feel rushed.
            </p>
          </div>

          <div className="feature-list reveal stagger-2">
            <div><Rocket size={22} /><span>Launch-focused delivery</span></div>
            <div><ShieldCheck size={22} /><span>Reliable architecture decisions</span></div>
            <div><MonitorSmartphone size={22} /><span>Responsive across mobile and tablet</span></div>
            <div><Blocks size={22} /><span>Design, frontend, backend, and IoT together</span></div>
          </div>
        </section>

        <section className="process-section reveal" id="process">
          <div className="section-heading">
            <span className="section-kicker">Process</span>
            <h2>A simple path from requirement to release.</h2>
          </div>

          <div className="process-grid">
            {process.map((step, index) => (
              <article className={`process-card reveal stagger-${index + 1}`} key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="contact-section reveal" id="contact">
          <div>
            <span className="section-kicker">Contact</span>
            <h2>Ready to build something useful?</h2>
            <p>
              Tell us about your app, website, server, or IoT idea. We will help shape it into a clean,
              practical product plan.
            </p>
          </div>
          <a className="primary-button dark" href="mailto:hadiuzzamanmollick07@gmail.com">
            Email the team <ArrowRight size={18} />
          </a>
        </section>

        <section className="get-in-touch-section reveal" aria-labelledby="get-in-touch-title">
          <div className="section-heading compact">
            <span className="section-kicker">Get in touch</span>
            <h2 id="get-in-touch-title">Tell us what you want to build.</h2>
          </div>

          <div className="contact-card-grid">
            {contactCards.map(({ title, text, href, icon: Icon }, index) => (
              <a className={`contact-card reveal stagger-${index + 1}`} href={href} key={title}>
                <Icon size={24} />
                <span>{title}</span>
                <p>{text}</p>
              </a>
            ))}
          </div>

          <div className="map-panel reveal">
            <div className="map-copy">
              <MapPin size={24} />
              <div>
                <span>Office location</span>
                <p>Dhanbandhi, Sirajganj Sadar, Sirajganj</p>
              </div>
            </div>
            <iframe
              title="Mollick Software Solutions location map"
              src="https://www.google.com/maps?q=Dhanbandhi%2C%20Sirajganj%20Sadar%2C%20Sirajganj&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src={assetPath('mollick-mark.png')} alt="" />
          <div>
            <strong>Mollick Software Solutions</strong>
            <p>Dhanbandhi, Sirajganj Sadar, Sirajganj</p>
          </div>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#services">Services</a>
          <a href="#stack">Stack</a>
          <a href="#process">Process</a>
          <a href="#contact">Contact</a>
        </nav>
        <small>Email: hadiuzzamanmollick07@gmail.com | WhatsApp: 01818225467 | © 2026 Mollick Software Solutions.</small>
      </footer>
    </div>
  );
}

export default App;


