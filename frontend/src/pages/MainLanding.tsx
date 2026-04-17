import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { AiCoachShowcase } from '@/components/landing/AiCoachShowcase';
import { Testimonials } from '@/components/landing/Testimonials';

interface MainLandingProps {
  onGetStarted: () => void;
}

const MainLanding: React.FC<MainLandingProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      <Hero onGetStarted={onGetStarted} />
      <Features />
      <AiCoachShowcase />
      <Testimonials />
    </div>
  );
};

export default MainLanding;
