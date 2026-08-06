'use client';

import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <footer className="bg-primary-950 text-white py-16 lg:py-20">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-12">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <Logo invert />
            </div>
            <p className="text-primary-400 text-sm leading-relaxed mb-6">
              Websites, Google presence and ads for small businesses across India.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 border border-primary-700 flex items-center justify-center hover:border-accent-600 hover:bg-accent-600 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-primary-700 flex items-center justify-center hover:border-accent-600 hover:bg-accent-600 transition-all duration-300"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 border border-primary-700 flex items-center justify-center hover:border-accent-600 hover:bg-accent-600 transition-all duration-300"
                aria-label="Website"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Services</h4>
            <ul className="space-y-3 text-primary-400 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Website Design
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Google Maps Setup
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Instagram Setup
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('services')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Meta &amp; Google Ads
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Company</h4>
            <ul className="space-y-3 text-primary-400 text-sm">
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:text-white transition-colors duration-200"
                >
                  About Us
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Blog
                </a>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-3 text-primary-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors duration-200">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-400 text-sm">
            © {currentYear} FOXI TECH. All rights reserved.
          </p>
          <div className="flex gap-6 text-primary-400 text-sm">
            <a href="#" className="hover:text-white transition-colors duration-200">
              4.9/5 on Google
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              120+ Clients
            </a>
            <a href="#" className="hover:text-white transition-colors duration-200">
              Based in Pune
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
