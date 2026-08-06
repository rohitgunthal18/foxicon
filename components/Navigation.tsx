'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import Logo from './Logo';

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
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

  return (
    <motion.nav
      style={{ backgroundColor }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'backdrop-blur-lg shadow-sm' : ''
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
            onClick={() => scrollToSection('hero')}
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
              onClick={() => scrollToSection('services')}
              className="text-sm lg:text-base font-medium text-primary-700 hover:text-primary-950 transition-colors duration-200"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="text-sm lg:text-base font-medium text-primary-700 hover:text-primary-950 transition-colors duration-200"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-sm lg:text-base font-medium text-primary-700 hover:text-primary-950 transition-colors duration-200"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
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
            className="md:hidden text-primary-950"
            aria-label="Menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
