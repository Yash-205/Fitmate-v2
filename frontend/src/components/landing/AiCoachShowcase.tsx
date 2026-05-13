import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/routes';
import { Button } from "@/components/ui/button";
import { 
  Dumbbell, 
  Brain, 
  Clock, 
  Users, 
  MessageCircle, 
  Sparkles, 
  Bot, 
  Send 
} from 'lucide-react';
import { CoachHighlight } from './CoachHighlight';

export const AiCoachShowcase: React.FC = () => {
  return (
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
                icon={<Dumbbell size={20} className="text-orange-600" />}
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
                <Button 
                  asChild
                  className="h-12 px-8 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all flex items-center gap-2"
                >
                  <Link to={ROUTES.CHAT}>
                    <MessageCircle size={18} /> Start Chatting
                  </Link>
                </Button>
                <Button 
                  asChild
                  variant="outline" 
                  className="h-12 px-8 rounded-xl border-slate-200 hover:bg-white font-bold transition-all"
                >
                  <Link to={ROUTES.WORKOUT}>
                    Learn More
                  </Link>
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
  );
};
