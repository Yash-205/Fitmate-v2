import { useEffect, useState, useRef } from "react";
import { getSocket } from "../../services/socket";
import { MessageService } from "../../services/api";
import { X, Send, Sparkles } from "lucide-react";

interface Message {
  senderId: string;
  receiverId: string;
  message: string;
}
interface ChatBoxProps {
    currentUserId: string;
    targetUserId: string;
    onClose: () => void;
}
export const ChatBox = ({ 
    currentUserId, 
    targetUserId, 
    onClose 
}: ChatBoxProps) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 1. Fetch message history using the Service pattern
        MessageService.getConversationHistory(currentUserId, targetUserId)
            .then(data => {
                if (Array.isArray(data)) {
                    setMessages(data);
                }
            })
            .catch(err => console.error("Failed to load history", err));
        // 2. Setup Socket -> for the upcoming new chats
        const socket = getSocket();

        socket.on("receive_message", (newMessage: Message) => {
            // check for the messages if htey belong to this converdsation or not 
            if (
                (newMessage.senderId === targetUserId && newMessage.receiverId === currentUserId) ||
                (newMessage.senderId === currentUserId && newMessage.receiverId === targetUserId)
            ) {
                setMessages((prev) => [...prev, newMessage]);
            }
        });

        return () => {
            socket.off("receive_message");
        };
    }, [currentUserId, targetUserId]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = () => {
        if (!inputValue.trim()) return;

        const socket = getSocket();
        socket.emit("send_message", {
            senderId: currentUserId,
            receiverId: targetUserId,
            message: inputValue
        });

        setInputValue("");
    };

    return (
        // Backdrop Overlay
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            
            {/* Main Modal Container */}
            <div className="bg-white w-full max-w-md h-[600px] max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-300">
                
                {/* Premium Header */}
                <div className="relative bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between shrink-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -translate-y-10 translate-x-10" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/30">
                            C
                        </div>
                        <div>
                            <h3 className="text-white font-black text-lg tracking-tight">Your Coach</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-slate-300 text-xs font-medium tracking-wide">Online Now</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="relative z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Chat History Area */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 scroll-smooth"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                            <Sparkles size={32} className="text-slate-400 mb-3" />
                            <p className="text-sm font-bold text-slate-500">Say hello to your coach!</p>
                            <p className="text-xs text-slate-400 mt-1">Messages are end-to-end secured.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const isMe = msg.senderId === currentUserId;
                            return (
                                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div 
                                        className={`px-5 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed shadow-sm ${
                                            isMe 
                                                ? 'bg-orange-500 text-white rounded-br-sm' 
                                                : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
                                        }`}
                                    >
                                        {msg.message}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-2 rounded-3xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
                        <input 
                            type="text" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            className="flex-1 bg-transparent px-4 py-2 text-slate-700 text-sm outline-none placeholder:text-slate-400"
                            placeholder="Type a message..."
                        />
                        <button 
                            onClick={sendMessage} 
                            disabled={!inputValue.trim()}
                            className="w-10 h-10 bg-slate-900 hover:bg-orange-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                        >
                            <Send size={16} className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
