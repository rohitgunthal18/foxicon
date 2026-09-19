'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const router = useRouter();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNav = (id: string) => {
    if (pathname === '/') {
      scrollToSection(id);
    } else {
      router.push(`/#${id}`);
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
            <p className="text-primary-400 text-sm leading-relaxed mb-4">
              Websites, Google presence, software solutions, and ads for businesses across India.
            </p>
            <div className="text-primary-300 text-xs space-y-1 mb-6">
              <p><span className="text-primary-400">Email:</span> <a href="mailto:contact@foxitech.in" className="hover:text-white transition-colors">contact@foxitech.in</a></p>
              <p><span className="text-primary-400">Phone:</span> <a href="tel:+917218616190" className="hover:text-white transition-colors">+91 72186 16190</a></p>
              <p><span className="text-primary-400">HQ:</span> Pune, Maharashtra, India</p>
            </div>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/company/foxi-tech"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-700 flex items-center justify-center hover:border-accent-600 hover:bg-accent-600 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/foxitech.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-700 flex items-center justify-center hover:border-accent-600 hover:bg-accent-600 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="/"
                className="w-10 h-10 border border-primary-700 flex items-center justify-center hover:border-accent-600 hover:bg-accent-600 transition-all duration-300"
                aria-label="Website"
              >
                <svg
                  width="20"
                  height="15"
                  viewBox="0 0 44 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-white"
                >
                  <rect x="0.5" y="0.5" width="43" height="31" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="7"    y1="21.5" x2="13"   y2="10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                  <line x1="11.5" y1="24.5" x2="20.5" y2="7.5"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                  <line x1="16"   y1="27"   x2="28"   y2="5"     stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="square" />
                  <line x1="23.5" y1="24.5" x2="32.5" y2="7.5"  stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                  <line x1="31"   y1="21.5" x2="37"   y2="10.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Services</h3>
            <ul className="space-y-3 text-primary-400 text-sm">
              <li>
                <Link
                  href="/services/web-design"
                  className="hover:text-white transition-colors duration-200"
                >
                  Website Design
                </Link>
              </li>
              <li>
                <Link
                  href="/services/local-seo"
                  className="hover:text-white transition-colors duration-200"
                >
                  Local SEO &amp; Maps
                </Link>
              </li>
              <li>
                <Link
                  href="/services/google-ads"
                  className="hover:text-white transition-colors duration-200"
                >
                  Meta &amp; Google Ads
                </Link>
              </li>
              <li>
                <Link
                  href="/services/custom-software"
                  className="hover:text-white transition-colors duration-200"
                >
                  Custom Software
                </Link>
              </li>
              <li>
                <Link
                  href="/services/ai-automation"
                  className="hover:text-white transition-colors duration-200"
                >
                  AI Automation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-3 text-primary-400 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-white transition-colors duration-200"
                >
                  Pricing &amp; Plans
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors duration-200">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors duration-200">
                  Blog &amp; Insights
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-display text-lg font-bold mb-4">Legal</h3>
            <ul className="space-y-3 text-primary-400 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-service" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-white transition-colors duration-200">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors duration-200">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-400 text-sm">
            © {currentYear} Foxi Tech. All rights reserved.
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
