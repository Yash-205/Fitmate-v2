import React from 'react';
import { Card } from "@/components/ui/card";
import { Brain, Sparkles, MessageSquare } from 'lucide-react';

interface AIMemoryCardProps {
  memories: any[];
}

/**
 * AI Memory Card
 * 
 * Displays the "Brain" of the AI agent, showing what it has learned about the user
 * from past interactions and profile updates.
 */
export const AIMemoryCard: React.FC<AIMemoryCardProps> = ({ memories }) => {
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Brain size={20} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-black text-lg tracking-tight">AI Insights</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Neural Context</p>
            </div>
          </div>
          <Sparkles size={16} className="text-orange-500 animate-pulse" />
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {memories.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare size={16} className="text-slate-500" />
              </div>
              <p className="text-xs font-bold text-slate-500 italic">No patterns detected yet. Chat with your AI coach to build memory.</p>
            </div>
          ) : (
            memories.map((m, i) => (
              <div 
                key={i} 
                className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group relative overflow-hidden"
              >
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles size={32} />
                </div>
                
                <p className="text-sm font-semibold leading-relaxed text-slate-200">
                  {m.memory || m.text || "Insight extracted"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                   <div className="h-1 w-1 rounded-full bg-orange-500" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                     Stored {new Date(m.created_at || Date.now()).toLocaleDateString()}
                   </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <span>Context Sync: Live</span>
            <span className="text-orange-500">{memories.length} Clusters</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
