import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
import { ChatService } from '@/services/api';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { MessageList } from '@/components/chat/MessageList';

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

/**
 * AI Chatbot Page
 * 
 * Provides an interactive interface for users to consult with the AI Coach.
 * It manages:
 * - Real-time streaming of AI responses via SSE (Server-Sent Events).
 * - Persistent chat sessions and message history retrieval.
 * - Dynamic UI updates for message lists and sidebars.
 */
const Chatbot: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      const scrollContainer = messagesEndRef.current.parentElement;
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await ChatService.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeThreadId) {
        loadSession(data[0].threadId);
      } else if (data.length === 0) {
        startNewChat();
      }
    } catch (err) { console.error(err); }
  };

  const loadSession = async (threadId: string) => {
    setActiveThreadId(threadId);
    try {
      const data = await ChatService.getHistory(threadId);
      const loadedMessages = data.map((m: any, i: number) => ({
        id: `${Date.now()}_${i}`,
        role: m.role,
        content: m.content
      }));
      setMessages(loadedMessages);
    } catch (err) { console.error(err); }
  };

  const startNewChat = () => {
    setActiveThreadId(null);
    setMessages([{ id: '1', role: 'assistant', content: 'Hi! I am your AI Coach. How can I help you crush your fitness goals today?' }]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    let accumulatedContent = "";

    try {
      setIsTyping(true);
      await ChatService.streamMessage(
        userMsg.content,
        activeThreadId,
        (chunk) => {
          setIsTyping(false);
          accumulatedContent += chunk;
          setMessages(prev => prev.map(msg => 
            msg.id === assistantId ? { ...msg, content: accumulatedContent } : msg
          ));
        },
        (data) => {
          if (data.threadId && data.threadId !== activeThreadId) {
            setActiveThreadId(data.threadId);
            fetchSessions();
          }
        },
        (err) => {
          setIsTyping(false);
          setMessages(prev => prev.map(msg => 
            msg.id === assistantId ? { ...msg, content: `Error: ${err.message}` } : msg
          ));
        }
      );
    } catch (err: any) {
      setIsTyping(false);
      // Fallback for unexpected top-level errors
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] w-full max-w-[1400px] mx-auto p-4 gap-4 bg-slate-50/20 font-sans">
      <ChatSidebar sessions={sessions} activeThreadId={activeThreadId} onNewChat={startNewChat} onLoadSession={loadSession} />

      <main className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        <header className="px-6 h-16 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-sm z-10">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600"><FaRobot className="size-5" /></div>
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-none">FitMate AI Coach</h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter text-slate-400">AI Assistant Online</span>
            </div>
          </div>
        </header>

        <MessageList messages={messages} messagesEndRef={messagesEndRef} />
        
        {isTyping && (
          <div className="px-6 py-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex gap-4 items-start max-w-[800px]">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
                <FaRobot size={16} className="animate-bounce" />
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1.5 items-center">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-white border-t border-slate-100 text-slate-900">
          <div className="max-w-[1000px] mx-auto flex items-center gap-3">
            <div className="relative flex-1 group">
              <input type="text" placeholder="Type your fitness question..." value={input}
                onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="w-full h-12 rounded-full border border-slate-200 bg-slate-50 px-6 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white text-slate-900"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500"><FaRobot size={16} /></div>
            </div>
            <Button onClick={handleSend} disabled={!input.trim()} className="size-12 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20 shrink-0 p-0 transition-all hover:scale-105 active:scale-95">
              <FaPaperPlane className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chatbot;
