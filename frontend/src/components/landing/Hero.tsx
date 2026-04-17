import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

interface HeroProps {
  onGetStarted: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden bg-[#FFFDF9]">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-in fade-in slide-in-from-left-5 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} /> Transform Your Body & Mind
            </div>
            
            <h1 className="text-5xl md:text-7xl font-[950] tracking-tight leading-[1.05] text-slate-900">
              Your Personal Fitness Journey Starts Here
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">
              Get personalized coaching, custom workout plans, and expert guidance tailored to your unique goals. Transform your life with our proven methodology.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 text-slate-900">
              <Button 
                onClick={onGetStarted}
                className="h-14 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-base shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center gap-3"
              >
                Start Free Trial <ArrowRight size={18} />
              </Button>
              <Button 
                variant="outline"
                className="h-14 px-8 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-base active:scale-95 transition-all"
              >
                Learn More
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 pt-6">
              <div>
                <div className="text-2xl font-black text-orange-600 tracking-tight">5000+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Active Members</div>
              </div>
              <div>
                <div className="text-2xl font-black text-orange-600 tracking-tight">50+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Expert Trainers</div>
              </div>
              <div>
                <div className="text-2xl font-black text-orange-600 tracking-tight">95%</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Image/Mockup */}
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="rounded-[3rem] overflow-hidden shadow-2xl skew-y-1 hover:skew-y-0 transition-transform duration-700">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=2070&auto=format&fit=crop" 
                alt="Training rings"
                className="w-full aspect-[4/5] object-cover"
              />
            </div>
            
            {/* Rating Card Overlay */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4 animate-in slide-in-from-bottom-10 duration-1000 delay-700">
              <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                <Star fill="currentColor" size={24} />
              </div>
              <div>
                <div className="text-xl font-black text-slate-900 tracking-tight">4.9/5</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Client Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
