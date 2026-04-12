import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUserCircle, FaPlus, FaComments } from 'react-icons/fa';
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Session {
  _id: string;
  threadId: string;
  title: string;
  updatedAt: string;
}

const API_URL = 'http://localhost:8000/api';

const Chatbot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
        if (data.length > 0 && !activeThreadId) {
          loadSession(data[0].threadId);
        } else if (data.length === 0) {
          startNewChat();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadSession = async (threadId: string) => {
    setActiveThreadId(threadId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat/${threadId}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const loadedMessages = data.map((m: any, i: number) => ({
          id: `${Date.now()}_${i}`,
          role: m.role,
          content: m.content
        }));
        setMessages(loadedMessages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startNewChat = () => {
    setActiveThreadId(null);
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hi! I am your AI Coach. How can I help you crush your fitness goals today?'
      }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    
    const tempId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: tempId, role: 'assistant', content: '...' }]);

    try {
      const token = localStorage.getItem('token');
      const payload: any = { message: userMsg.content };
      if (activeThreadId) payload.threadId = activeThreadId;

      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chat error');

      setMessages((prev) => prev.map(msg => 
        msg.id === tempId ? { ...msg, content: data.reply } : msg
      ));

      if (data.threadId !== activeThreadId) {
        setActiveThreadId(data.threadId);
        fetchSessions();
      }

    } catch (err: any) {
      setMessages((prev) => prev.map(msg => 
        msg.id === tempId ? { ...msg, content: `Error: ${err.message}` } : msg
      ));
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full max-w-[1400px] mx-auto p-4 gap-4 bg-slate-50/20 font-sans">
      
      {/* Sidebar - Sessions */}
      <aside className="w-[300px] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100">
          <Button 
            onClick={startNewChat}
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
              onClick={() => loadSession(s.threadId)}
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

      {/* Chat Area */}
      <main className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Header */}
        <header className="px-6 h-16 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-sm z-10">
          <div className="bg-orange-100 p-2 rounded-xl">
            <FaRobot className="size-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-none">FitMate AI Coach</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">AI Assistant Online</span>
            </div>
          </div>
        </header>

        {/* Messages */}
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

        {/* Improved Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="max-w-[1000px] mx-auto flex items-center gap-3">
            <div className="relative flex-1 group">
              <input 
                type="text" 
                placeholder="Type your fitness question..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full h-12 pl-6 pr-12 rounded-full border border-slate-200 bg-slate-50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white placeholder:text-slate-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">
                <FaRobot size={16} />
              </div>
            </div>
            <Button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="size-12 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 shrink-0 p-0 transition-all hover:scale-105 active:scale-95"
            >
              <FaPaperPlane className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
