import React from 'react';
import { Dumbbell } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F172A] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-orange-600 rounded-lg text-white">
                <Dumbbell size={18} />
              </div>
              <span className="font-black text-xl tracking-tight">FitMate</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium max-w-[220px]">
              Transform your body and mind with personalized fitness coaching that delivers real results.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white tracking-tight">Quick Links</h4>
            <ul className="space-y-3">
              <FooterLink to="/services">Services</FooterLink>
              <FooterLink to="/workout">Workout Plan</FooterLink>
              <FooterLink to="/trainers">Trainers</FooterLink>
              <FooterLink to="/testimonials">Testimonials</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white tracking-tight">Company</h4>
            <ul className="space-y-3">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/careers">Careers</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </ul>
          </div>

          {/* Connect With Us */}
          <div className="space-y-5">
            <h4 className="text-sm font-bold text-white tracking-tight">Connect With Us</h4>
            <div className="flex items-center gap-3">
              <SocialLink icon={<FaFacebook size={16} />} href="#" />
              <SocialLink icon={<FaInstagram size={16} />} href="#" />
              <SocialLink icon={<FaTwitter size={16} />} href="#" />
              <SocialLink icon={<FaYoutube size={16} />} href="#" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex justify-center items-center">
          <p className="text-slate-500 text-xs font-medium text-center">
            © 2026 FitMate. All rights reserved. | 
            <Link to="/privacy" className="hover:text-orange-500 transition-colors mx-1">Privacy Policy</Link> | 
            <Link to="/terms" className="hover:text-orange-500 transition-colors mx-1">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link to={to} className="text-slate-400 hover:text-orange-500 transition-colors text-sm font-medium">
      {children}
    </Link>
  </li>
);

const SocialLink = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a
    href={href}
    className="w-8 h-8 flex items-center justify-center rounded-md bg-slate-800 text-slate-400 hover:bg-orange-600 hover:text-white transition-all duration-200"
  >
    {icon}
  </a>
);

export default Footer;
