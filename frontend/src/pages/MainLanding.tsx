import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Bot, 
  Target, 
  Zap, 
  Sparkles, 
  Star, 
  Users, 
  MessageCircle, 
  Calendar, 
  TrendingUp, 
  Heart,
  Brain,
  Clock,
  Send
} from 'lucide-react';
import { ImageWithFallback } from '@/components/common/ImageWithFallback';

interface MainLandingProps {
  onGetStarted: () => void;
}

const MainLanding: React.FC<MainLandingProps> = ({ onGetStarted }) => {
  return (
    <div className="bg-white text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* Hero Section */}
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

      {/* Everything You Need to Succeed Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
              Everything You Need to Succeed
            </h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Our comprehensive approach combines expert coaching, personalized programs, and cutting-edge tools to help you achieve your fitness goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Target size={28} className="text-orange-500" />}
              title="Personalized Plans"
              description="AI-generated workout and nutrition plans tailored to your goals and lifestyle."
            />
            <FeatureCard 
              icon={<Users size={28} className="text-orange-500" />}
              title="1-on-1 Coaching"
              description="Certified trainers offering personalized guidance and accountability."
            />
            <FeatureCard 
              icon={<MessageCircle size={28} className="text-orange-500" />}
              title="AI Fitness Assistant"
              description="24/7 AI chat support for quick fitness, diet, and workout solutions."
            />
            <FeatureCard 
              icon={<Calendar size={28} className="text-orange-500" />}
              title="Flexible Scheduling"
              description="Daily to-dos, habit reminders, and quick micro-workouts on your time."
            />
            <FeatureCard 
              icon={<TrendingUp size={28} className="text-orange-500" />}
              title="Progress Tracking"
              description="Monitor habits and milestones with smart, AI-driven insights."
            />
            <FeatureCard 
              icon={<Heart size={28} className="text-orange-500" />}
              title="Holistic Approach"
              description="Balanced fitness, nutrition, and mental wellness for long-term results."
            />
          </div>
        </div>
      </section>

      {/* AI Coach Hero Section */}
      <section className="py-32 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-10 order-2 lg:order-1">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                  Meet Your 24/7 AI Fitness Coach
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Get instant, expert fitness guidance powered by AI. Whether you're wondering about workouts, nutrition, or which program is right for you — our chatbot has the answers.
                </p>
              </div>

              <div className="space-y-6">
                <CoachHighlight 
                  icon={<Zap size={20} className="text-orange-600" />}
                  title="Instant Answers"
                  description="Get immediate responses to your fitness questions, 24/7."
                />
                <CoachHighlight 
                  icon={<Brain size={20} className="text-orange-600" />}
                  title="Smart Recommendations"
                  description="AI-powered program and workout suggestions tailored to you."
                />
                <CoachHighlight 
                  icon={<Clock size={20} className="text-orange-600" />}
                  title="Always Available"
                  description="No waiting for callbacks or appointments - chat anytime."
                />
                <CoachHighlight 
                  icon={<Users size={20} className="text-orange-600" />}
                  title="Expert Knowledge"
                  description="Trained on insights from certified fitness professionals."
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Button className="h-12 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all flex items-center gap-2">
                    <MessageCircle size={18} /> Start Chatting Now
                  </Button>
                  <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-200 hover:bg-white font-bold transition-all">
                    Learn More
                  </Button>
                </div>
                <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl w-fit">
                  <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 flex items-center gap-2">
                    <Sparkles size={12} /> 100% Free Forever - No credit card required
                  </span>
                </div>
              </div>
            </div>

            {/* Right Chat Mockup */}
            <div className="order-1 lg:order-2">
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden relative">
                <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Bot size={22} />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        FitCoach AI <Sparkles size={12} className="text-orange-500" />
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">Always here to help</div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase tracking-widest border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </div>
                </div>

                <div className="p-6 space-y-6 h-[400px] overflow-y-auto bg-slate-50/30">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="space-y-1">
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-600 leading-relaxed">
                        Hi! I'm here to help you with workouts, nutrition, and program recommendations. What would you like to know?
                      </div>
                      <div className="text-[10px] font-bold text-slate-300 ml-1 uppercase">Just now</div>
                    </div>
                  </div>

                  <div className="flex flex-row-reverse gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white flex-shrink-0">
                      <Users size={16} />
                    </div>
                    <div className="space-y-1 text-right">
                      <div className="bg-orange-600 p-4 rounded-2xl rounded-tr-none text-white text-sm leading-relaxed shadow-lg shadow-orange-600/20">
                        How do I start losing weight?
                      </div>
                      <div className="text-[10px] font-bold text-slate-300 mr-1 uppercase">Just now</div>
                    </div>
                  </div>

                  <div className="flex gap-4 animate-in fade-in duration-1000">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="space-y-1">
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-600 leading-relaxed">
                        Great goal! For effective weight loss, combine cardio 3-4 times/week with strength training 2-3 times/week. Focus on a caloric deficit through balanced nutrition.
                      </div>
                      <div className="text-[10px] font-bold text-slate-300 ml-1 uppercase">Just now</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Ask me anything about fitness..."
                      className="w-full h-12 rounded-xl bg-slate-50 px-4 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all border border-slate-100"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                      <Send size={16} />
                    </button>
                  </div>
                </div>

                {/* Promotional Badge on Mockup */}
                <div className="absolute top-4 right-4 rotate-12 -mx-4">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 animate-bounce">
                    <Sparkles size={10} /> Try it free!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard 
              initials="JM"
              name="Jessica Martinez"
              role="Lost 35 lbs in 4 months"
              quote="The personalized plan and constant support from my trainer kept me motivated. I've never felt better!"
            />
            <TestimonialCard 
              initials="DT"
              name="David Thompson"
              role="Gained 20 lbs of muscle"
              quote="My trainer's expertise and the structured workout plans made all the difference. Highly recommend!"
            />
            <TestimonialCard 
              initials="RL"
              name="Rachel Lee"
              role="Marathon Runner"
              quote="The athletic performance program helped me PR my marathon time by 15 minutes. Outstanding coaching!"
            />
            <TestimonialCard 
              initials="MB"
              name="Michael Brown"
              role="Busy Professional"
              quote="With my hectic schedule, I thought fitness was impossible. The flexible scheduling and quick workouts fit perfectly."
            />
            <TestimonialCard 
              initials="AF"
              name="Amanda Foster"
              role="New Mom"
              quote="After having my baby, I struggled to get back in shape. The supportive community and trainers made it amazing."
            />
            <TestimonialCard 
              initials="JW"
              name="James Wilson"
              role="Senior Executive"
              quote="At 55, I wasn't sure if I could get fit again. My trainer proved age is just a number. I'm stronger than ever!"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-500 group">
    <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-500">
      {icon}
    </div>
    <h3 className="text-xl font-black mb-4 text-slate-800 tracking-tight">{title}</h3>
    <p className="text-slate-500 font-medium leading-relaxed text-sm">{description}</p>
  </div>
);

const CoachHighlight = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
      {icon}
    </div>
    <div>
      <div className="font-bold text-slate-800 tracking-tight">{title}</div>
      <div className="text-sm text-slate-400 font-medium">{description}</div>
    </div>
  </div>
);

const TestimonialCard = ({ initials, name, role, quote }: { initials: string; name: string; role: string; quote: string }) => (
  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-orange-200 hover:shadow-2xl hover:shadow-slate-100/30 transition-all duration-500 flex flex-col justify-between">
    <div className="space-y-6">
      <div className="flex gap-1 text-orange-500">
        {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="currentColor" />)}
      </div>
      <p className="text-slate-600 font-medium italic leading-relaxed">"{quote}"</p>
    </div>
    <div className="flex items-center gap-4 mt-8 pt-8 border-t border-slate-50">
      <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 font-black text-sm border-2 border-white shadow-sm">
        {initials}
      </div>
      <div>
        <div className="font-bold text-slate-900 tracking-tight">{name}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{role}</div>
      </div>
    </div>
  </div>
);

export default MainLanding;
