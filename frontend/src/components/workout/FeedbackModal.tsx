import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { X, MessageSquare, Sparkles, TrendingUp, ShieldAlert, Zap } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  isGenerating: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit, isGenerating }) => {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  const quickFeedback = [
    { label: "Too Intense", icon: Zap, value: "The current plan is too intense, please lower the volume or RPE." },
    { label: "Too Easy", icon: TrendingUp, value: "The workout is too easy, I need more challenge or higher intensity." },
    { label: "More Variety", icon: Sparkles, value: "I'd like more exercise variety, it feels a bit repetitive." },
    { label: "Injured/Pain", icon: ShieldAlert, value: "I'm feeling some pain in [body part], please adjust the exercises accordingly." },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-6 flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
               <MessageSquare className="text-orange-500" size={24} />
               Modify Plan
            </h3>
            <p className="text-sm text-slate-400 font-medium">Tell the AI coach how to adjust your training.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-8 pb-8 space-y-6">
          {/* Quick Tags */}
          <div className="grid grid-cols-2 gap-3">
            {quickFeedback.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setFeedback(item.value)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-orange-200 hover:shadow-md hover:shadow-orange-500/5 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
                  <item.icon size={16} />
                </div>
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Detailed Instructions</label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="e.g., Add more focus on my lateral delts, or I don't have access to a squat rack right now..."
              className="w-full h-32 rounded-3xl bg-slate-50 border-slate-100 p-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all resize-none placeholder:text-slate-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              disabled={isGenerating || !feedback.trim()}
              onClick={() => onSubmit(feedback)}
              className="flex-[2] h-14 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black tracking-wide shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              {isGenerating ? 'AI Re-evaluating...' : 'Apply Modifications'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
