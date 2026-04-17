import React from 'react';
import { Target, Users, MessageCircle, Calendar, TrendingUp, Heart } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const Features: React.FC = () => {
  return (
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
  );
};
