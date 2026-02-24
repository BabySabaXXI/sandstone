"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLayoutStore } from "@/stores/layout-store";
import { 
  X, Bot, Sparkles, MessageSquare, Send, Loader2, 
  ChevronDown, Wand2, FileText, BookOpen, GraduationCap,
  Copy, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AIPopup() {
  const { aiPopupOpen, toggleAIPopup, aiPopupPosition, setAIPopupPosition } = useLayoutStore();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history when popup opens
  useEffect(() => {
    if (aiPopupOpen && user) {
      loadChatHistory();
    }
  }, [aiPopupOpen, user]);

  const loadChatHistory = async () => {
    // In a real implementation, load from Supabase
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Hi! I'm your AI writing assistant. I can help you with:\n\n• Essay feedback and suggestions\n• Vocabulary explanations\n• Grammar corrections\n• Writing tips and strategies\n\nWhat would you like help with?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const responses = [
      "That's a great question! For IELTS Writing Task 2, it's important to maintain a clear position throughout your essay. Make sure each paragraph supports your main argument with specific examples.",
      "I'd recommend focusing on cohesive devices to improve the flow between your paragraphs. Words like 'furthermore', 'however', and 'consequently' can help create smoother transitions.",
      "Your vocabulary usage is good, but you could benefit from using more academic collocations. For example, instead of 'big problem', try 'significant issue' or 'pressing concern'.",
      "For grammar improvement, pay attention to your use of complex sentences. Try incorporating more relative clauses and conditional structures to demonstrate grammatical range.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleCopyMessage = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - aiPopupPosition.x,
      y: e.clientY - aiPopupPosition.y,
    };
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 400, e.clientX - dragStartRef.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 600, e.clientY - dragStartRef.current.y));
    
    setAIPopupPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const quickActions = [
    { icon: Wand2, label: "Improve writing", prompt: "How can I improve my essay?" },
    { icon: BookOpen, label: "Vocabulary", prompt: "Help me with vocabulary" },
    { icon: FileText, label: "Grammar check", prompt: "Check my grammar" },
    { icon: GraduationCap, label: "IELTS tips", prompt: "Give me IELTS tips" },
  ];

  if (!aiPopupOpen) return null;

  return (
    <motion.div
      ref={popupRef}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "fixed",
        left: aiPopupPosition.x,
        top: aiPopupPosition.y,
        zIndex: 100,
      }}
      className="w-[380px] bg-white rounded-2xl shadow-2xl border border-[#E5E5E0] overflow-hidden flex flex-col"
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Header - Draggable */}
      <div
        className={cn(
          "flex items-center justify-between p-4 border-b border-[#E5E5E0] bg-gradient-to-r from-[#2D2D2D] to-[#3D3D3D]",
          isDragging && "cursor-grabbing"
        )}
        onMouseDown={handleDragStart}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#2D2D2D]" />
          </div>
          <div>
            <h3 className="text-white font-medium text-sm">AI Assistant</h3>
            <p className="text-white/50 text-xs">Always here to help</p>
          </div>
        </div>
        <button
          onClick={toggleAIPopup}
          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 max-h-[350px] overflow-y-auto p-4 space-y-4 bg-[#FAFAF8]">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center",
              message.role === "assistant" 
                ? "bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3]" 
                : "bg-[#2D2D2D]"
            )}>
              {message.role === "assistant" ? (
                <Bot className="w-4 h-4 text-[#2D2D2D]" />
              ) : (
                <span className="text-white text-xs font-medium">
                  {user?.email?.[0].toUpperCase() || "U"}
                </span>
              )}
            </div>

            {/* Message Content */}
            <div className={cn(
              "flex-1 max-w-[75%]",
              message.role === "user" && "items-end"
            )}>
              <div className={cn(
                "rounded-2xl px-4 py-2.5 text-sm",
                message.role === "assistant"
                  ? "bg-white border border-[#E5E5E0] text-[#2D2D2D] shadow-sm"
                  : "bg-[#2D2D2D] text-white"
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
              
              {/* Copy button for AI messages */}
              {message.role === "assistant" && (
                <button
                  onClick={() => handleCopyMessage(message.content, message.id)}
                  className="mt-1 flex items-center gap-1 text-[#8A8A8A] hover:text-[#5A5A5A] transition-colors text-xs"
                >
                  {copiedId === message.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8D5C4] to-[#F5E6D3] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#2D2D2D]" />
            </div>
            <div className="bg-white border border-[#E5E5E0] rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
              <Loader2 className="w-4 h-4 text-[#8A8A8A] animate-spin" />
              <span className="text-sm text-[#8A8A8A]">Thinking...</span>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length < 3 && (
        <div className="px-4 py-3 border-t border-[#E5E5E0] bg-white">
          <p className="text-xs text-[#8A8A8A] mb-2">Quick actions:</p>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setInputValue(action.prompt);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F5F0] hover:bg-[#E8D5C4]/30 rounded-lg text-xs text-[#5A5A5A] hover:text-[#2D2D2D] transition-colors"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-[#E5E5E0] bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask anything about your writing..."
            className="flex-1 px-4 py-2.5 bg-[#F5F5F0] border border-transparent focus:border-[#E8D5C4] rounded-xl text-sm outline-none transition-all placeholder:text-[#8A8A8A]"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="w-10 h-10 bg-[#2D2D2D] hover:bg-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-center text-[10px] text-[#8A8A8A] mt-2">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </motion.div>
  );
}

// AI Toggle Button
export function AIToggleButton() {
  const { aiPopupOpen, toggleAIPopup } = useLayoutStore();
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleAIPopup}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300",
        aiPopupOpen 
          ? "bg-[#2D2D2D] text-white" 
          : "bg-white text-[#2D2D2D] border border-[#E5E5E0] hover:shadow-xl"
      )}
    >
      <div className={cn(
        "w-2 h-2 rounded-full",
        aiPopupOpen ? "bg-[#A8C5A8]" : "bg-[#E8D5C4]"
      )} />
      <Sparkles className="w-4 h-4" />
      <span className="font-medium text-sm">AI Assistant</span>
    </motion.button>
  );
}
