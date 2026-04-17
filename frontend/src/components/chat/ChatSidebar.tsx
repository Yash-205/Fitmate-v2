import React from 'react';
import { FaPlus, FaComments } from 'react-icons/fa';
import { Button } from "@/components/ui/button";

interface Session {
  _id: string;
  threadId: string;
  title: string;
}

interface ChatSidebarProps {
  sessions: Session[];
  activeThreadId: string | null;
  onNewChat: () => void;
  onLoadSession: (threadId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  sessions, activeThreadId, onNewChat, onLoadSession 
}) => {
  return (
    <aside className="w-[300px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
      <div className="p-4 border-b border-slate-100">
        <Button 
          onClick={onNewChat}
          className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md shadow-orange-500/10 gap-2 font-semibold"
        >
          <FaPlus className="size-3" /> New Chat
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <h3 className="px-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">History</h3>
        {sessions.map(s => (
          <button 
            key={s._id} 
            onClick={() => onLoadSession(s.threadId)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left ${
              activeThreadId === s.threadId 
              ? 'bg-orange-50 text-orange-700 font-medium' 
              : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FaComments className={`size-4 ${activeThreadId === s.threadId ? 'text-orange-600' : 'text-slate-400'}`} />
            <span className="text-sm truncate leading-none">{s.title}</span>
          </button>
        ))}
      </div>
    </aside>
  );
};
