"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const initialMessages = [
  { sender: "Gemini AI", text: "Welcome to GeoScience Chat! I'm here to help with questions about weather, earth science, geomatics, and environmental data. How can I assist you today?" },
];

// Load initial state from localStorage
const loadInitialState = () => {
  try {
    const savedConversations = localStorage.getItem("conversations");
    const savedActiveConversation = localStorage.getItem("activeConversation");
    
    if (savedConversations) {
      const parsedConversations = JSON.parse(savedConversations);
      return {
        conversations: parsedConversations,
        activeConversation: savedActiveConversation || parsedConversations[0]?.id || 'current',
        messages: parsedConversations.find(c => c.id === savedActiveConversation)?.messages || initialMessages
      };
    }
  } catch (error) {
    console.error("Failed to load initial state:", error);
  }
  
  // Default state if no saved data
  return {
    conversations: [{ id: 'current', name: 'Current Chat', messages: initialMessages }],
    activeConversation: 'current',
    messages: initialMessages
  };
};

const EarthIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#EBF8FF"/>
    <path d="M16 6C10.477 6 6 10.477 6 16C6 21.523 10.477 26 16 26C21.523 26 26 21.523 26 16C26 10.477 21.523 6 16 6ZM16 24C11.582 24 8 20.418 8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16C24 20.418 20.418 24 16 24Z" fill="#2C5282"/>
    <path d="M16 10C13.239 10 11 12.239 11 15C11 17.761 13.239 20 16 20C18.761 20 21 17.761 21 15C21 12.239 18.761 10 16 10ZM16 18C14.343 18 13 16.657 13 15C13 13.343 14.343 12 16 12C17.657 12 19 13.343 19 15C19 16.657 17.657 18 16 18Z" fill="#38B2AC"/>
  </svg>
);

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
  </svg>
);

export default function Home() {
  const initialState = loadInitialState();
  const [messages, setMessages] = useState(initialState.messages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState(initialState.conversations);
  const [activeConversation, setActiveConversation] = useState(initialState.activeConversation);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatName, setEditingChatName] = useState("");
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const editInputRef = useRef(null);
  
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem("conversations");
      const savedActiveConversation = localStorage.getItem("activeConversation");
      
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
        
        if (savedActiveConversation) {
          setActiveConversation(savedActiveConversation);
          const activeChat = parsedConversations.find(c => c.id === savedActiveConversation);
          if (activeChat) {
            setMessages(activeChat.messages);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("conversations", JSON.stringify(conversations));
      localStorage.setItem("activeConversation", activeConversation);
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConversation]);

  useEffect(() => {
    const activeChat = conversations.find(c => c.id === activeConversation);
    if (activeChat) {
      setMessages(activeChat.messages);
    }
  }, [activeConversation, conversations]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const newChat = () => {
    const newId = Date.now().toString();
    setConversations(prev => [{
      id: newId,
      name: 'New Chat',
      messages: initialMessages
    }, ...prev]);
    setActiveConversation(newId);
    setMessages(initialMessages);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const userMsg = { sender: "You", text: input };
    
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, messages: [...conv.messages, userMsg] }
        : conv
    ));
    
    setInput("");
    setIsTyping(true);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const res = await fetch("/api/gemini-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: input, 
          history: messages.slice(-10)
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        const aiMessage = { sender: "Gemini AI", text: data.response };
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages: [...conv.messages, aiMessage] }
            : conv
        ));
      } else {
        const errorMessage = { sender: "Gemini AI", text: `Error: ${data.error || "Failed to get AI response"}` };
        setConversations(prev => prev.map(conv => 
          conv.id === activeConversation 
            ? { ...conv, messages: [...conv.messages, errorMessage] }
            : conv
        ));
        console.error("API error:", data);
      }
    } catch (err) {
      console.error("Request error:", err);
      const errorMessage = { sender: "Gemini AI", text: "Sorry, there was an error connecting to the AI service." };
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation 
          ? { ...conv, messages: [...conv.messages, errorMessage] }
          : conv
      ));
    } finally {
      setIsTyping(false);
      setIsSubmitting(false);
    }
  };

  const clearChat = () => {
    setConversations(prev => prev.map(conv => 
      conv.id === activeConversation 
        ? { ...conv, messages: initialMessages }
        : conv
    ));
  };

  const startEditing = (conv) => {
    setEditingChatId(conv.id);
    setEditingChatName(conv.name);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 0);
  };

  const saveEditedName = () => {
    if (editingChatName.trim()) {
      setConversations(prev => prev.map(conv => 
        conv.id === editingChatId 
          ? { ...conv, name: editingChatName.trim() }
          : conv
      ));
    }
    setEditingChatId(null);
    setEditingChatName("");
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEditedName();
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingChatName("");
    }
  };

  const activeMessages = conversations.find(conv => conv.id === activeConversation)?.messages || [];

  return (
    <div className="h-screen flex">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-[var(--background)] border-r border-blue-100 flex flex-col"
          >
            <div className="p-4 border-b border-blue-100">
              <button
                onClick={newChat}
                className="w-full earth-gradient text-white rounded-lg py-2 px-4 flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {conversations.map((conv, index) => (
                <motion.div
                  key={conv.id}
                  className="relative group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.05,
                    ease: "easeOut"
                  }}
                >
                  <motion.button
                    onClick={() => setActiveConversation(conv.id)}
                    className={`chat-history-button w-full text-left p-3 rounded-lg mb-1 transition-all ${activeConversation === conv.id ? 'active' : 'hover:bg-blue-50/50'}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="font-medium text-sm truncate flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2C4.687 2 2 4.687 2 8C2 11.313 4.687 14 8 14C11.313 14 14 11.313 14 8C14 4.687 11.313 2 8 2Z" 
                          fill={activeConversation === conv.id ? "var(--accent)" : "#CBD5E0"}
                          opacity="0.5"
                        />
                      </svg>
                      {editingChatId === conv.id ? (
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingChatName}
                          onChange={(e) => setEditingChatName(e.target.value)}
                          onBlur={saveEditedName}
                          onKeyDown={handleEditKeyDown}
                          className="flex-1 bg-transparent border-b border-blue-300 focus:outline-none focus:border-blue-500 px-1"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          {conv.name}
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(conv);
                            }}
                            className="opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-opacity ml-auto"
                          >
                            <PencilIcon />
                          </motion.button>
                        </>
                      )}
                    </div>
                    <div className="chat-preview text-xs text-blue-600/60 truncate mt-1 pl-6">
                      {conv.messages[conv.messages.length - 1]?.text.substring(0, 50)}...
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col bg-[var(--background)]">
        <header className="h-14 border-b border-blue-100 flex items-center px-4 gap-4 bg-white/80 backdrop-blur-sm">
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5H16M4 10H16M4 15H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <EarthIcon />
            <h1 className="font-semibold text-[var(--foreground)]">GeoScience Chat</h1>
          </div>
          <button
            onClick={clearChat}
            className="ml-auto text-xs text-blue-600/60 hover:text-blue-600 transition-colors"
          >
            Clear Chat
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto py-4 px-6">
            <AnimatePresence initial={false}>
              {activeMessages.map((msg, idx) => {
                const isAI = msg.sender === "Gemini AI";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`group mb-6 last:mb-0`}
                  >
                    <div className="flex items-start gap-3">
                      {isAI && <EarthIcon />}
                      <div className={`flex-1 ${isAI ? 'message-bubble-ai' : 'message-bubble-user'} p-4 rounded-xl`}>
                        <div className="prose prose-blue w-fit ">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-11 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs text-blue-600/60 hover:text-blue-600">Copy</button>
                      {isAI && (
                        <>
                          <span className="text-blue-600/60">•</span>
                          <button className="text-xs text-blue-600/60 hover:text-blue-600">Regenerate</button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              {isTyping && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-3"
                >
                  <EarthIcon />
                  <div className="typing-indicator px-4 py-2 rounded-xl flex items-center gap-1">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-75">●</span>
                    <span className="animate-pulse delay-150">●</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="border-t border-blue-100 bg-white/80 backdrop-blur-sm">
          <form onSubmit={sendMessage} className="max-w-3xl mx-auto p-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                className="w-full px-4 py-3 pr-24 rounded-xl border border-blue-100 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm resize-none"
                rows="1"
                placeholder="about weather, earth science, or geomatics..."
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-2 bottom-2 earth-gradient text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
            <div className="mt-2 text-xs text-center text-blue-600/60">
              <kbd className="px-2 py-1 bg-blue-50 rounded-md">⏎ Enter</kbd> to send,
              <kbd className="ml-1 px-2 py-1 bg-blue-50 rounded-md">Shift + ⏎</kbd> for new line
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
