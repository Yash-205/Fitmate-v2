import React from 'react';
import { TestimonialCard } from './TestimonialCard';

export const Testimonials: React.FC = () => {
  return (
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
  );
};
