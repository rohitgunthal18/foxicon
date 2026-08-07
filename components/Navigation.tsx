'use client';

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Logo from './Logo';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <motion.nav
      style={{ backgroundColor }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isOpen ? 'backdrop-blur-lg shadow-sm bg-white/95' : ''
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12">
        <div className="flex items-center justify-between h-14 lg:h-18">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="cursor-pointer"
            onClick={() => {
              scrollToSection('hero');
              setIsOpen(false);
            }}
          >
            <Logo />
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex items-center gap-8 lg:gap-12"
          >
            <button
              onClick={() => handleNav('services')}
              className="text-sm lg:text-base font-medium text-primary-700 hover:text-primary-950 transition-colors duration-200"
            >
              Services
            </button>
            <button
              onClick={() => handleNav('pricing')}
              className="text-sm lg:text-base font-medium text-primary-700 hover:text-primary-950 transition-colors duration-200"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNav('about')}
              className="text-sm lg:text-base font-medium text-primary-700 hover:text-primary-950 transition-colors duration-200"
            >
              About
            </button>
            <button
              onClick={() => handleNav('contact')}
              className="text-sm lg:text-base font-medium text-primary-950 border border-primary-950 px-4 py-1.5 hover:bg-primary-950 hover:text-white transition-all duration-200"
            >
              Contact
            </button>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary-950 focus:outline-none p-2"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute top-14 left-0 right-0 bg-white border-b border-primary-100 md:hidden shadow-lg z-40 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-8 gap-6">
              <button
                onClick={() => {
                  handleNav('services');
                  setIsOpen(false);
                }}
                className="text-left text-lg font-medium text-primary-700 hover:text-primary-950 transition-colors py-2 border-b border-primary-50"
              >
                Services
              </button>
              <button
                onClick={() => {
                  handleNav('pricing');
                  setIsOpen(false);
                }}
                className="text-left text-lg font-medium text-primary-700 hover:text-primary-950 transition-colors py-2 border-b border-primary-50"
              >
                Pricing
              </button>
              <button
                onClick={() => {
                  handleNav('about');
                  setIsOpen(false);
                }}
                className="text-left text-lg font-medium text-primary-700 hover:text-primary-950 transition-colors py-2 border-b border-primary-50"
              >
                About
              </button>
              <button
                onClick={() => {
                  handleNav('contact');
                  setIsOpen(false);
                }}
                className="w-full text-center text-lg font-semibold text-white bg-primary-950 py-3 hover:bg-primary-900 transition-all shadow-sm rounded-none mt-2"
              >
                Contact Us
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
