import React from 'react';
import { FaRobot, FaUserCircle } from 'react-icons/fa';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth bg-slate-50/10">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
          <div className={`mt-1 size-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
            msg.role === 'user' ? 'bg-orange-600 text-white' : 'bg-white text-slate-500 border border-slate-100'
          }`}>
            {msg.role === 'user' ? <FaUserCircle size={20} /> : <FaRobot size={18} />}
          </div>
          <div className={`group relative max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm transition-all duration-200 ${
            msg.role === 'user' 
            ? 'bg-orange-600 text-white rounded-tr-none' 
            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
          }`}>
            {msg.content}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
