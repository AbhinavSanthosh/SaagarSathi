import React, { useState } from 'react';
import { Send, Mic, Languages, ExternalLink, RefreshCw } from 'lucide-react';
import clsx from 'clsx';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'te', name: 'Telugu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'kn', name: 'Kannada' }
];

export default function AskSaagarsathi() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Namaskaram! I am SaagarSathi. How can I help you with your fishing trip today?',
      citations: [],
      chips: ["Is it safe to fish today?", "Show me the nearest PFZ"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [langIndex, setLangIndex] = useState(0); 

  const currentLang = LANGUAGES[langIndex];

  const handleLangToggle = () => {
    setLangIndex((prev) => (prev + 1) % LANGUAGES.length);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userMessage, citations: [], chips: [] }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          lang: currentLang.code,
          context: {
            location: 'Kochi Coast',
            weather: 'Wind 45km/h, Waves 4.2m',
            alertLevel: 'danger'
          }
        })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.text,
        citations: data.citations,
        chips: data.chips
      }]);
    } catch (error) {
       console.error("Chat error", error);
       setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        isError: true,
        text: "Sorry, I couldn't connect to the server right now.",
        citations: [],
        chips: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicClick = () => {
    setIsListening(true);
    // Mock noisy environment error
    setTimeout(() => {
      setIsListening(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'bot',
        isError: true,
        text: "I couldn't hear that clearly over the wind. Could you tap the microphone and try again, or type your question?",
        citations: [],
        chips: []
      }]);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-ocean-100 rounded-full flex items-center justify-center">
            <span className="text-ocean-700 font-bold text-lg">S</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">SaagarSathi AI</h2>
            <span className="text-xs font-medium text-safe flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-safe mr-1"></span> Online
            </span>
          </div>
        </div>
        <button 
          onClick={handleLangToggle}
          className="flex items-center space-x-1 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-100 border border-gray-200"
        >
          <Languages size={16} />
          <span>{currentLang.name}</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {messages.map(msg => (
          <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
            <div className={clsx(
              "px-4 py-3 rounded-2xl whitespace-pre-wrap",
              msg.sender === 'user' ? "bg-ocean-600 text-white rounded-tr-sm" : 
              msg.isError ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-sm" : "bg-gray-100 text-gray-900 rounded-tl-sm"
            )}>
              <p className="text-[15px] leading-relaxed">{msg.text}</p>
            </div>
            
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {msg.citations.map((cite, i) => (
                  <a key={i} href={cite.url} className="inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-ocean-600 bg-ocean-50 px-2 py-1 rounded border border-ocean-100">
                    Source: {cite.text} <ExternalLink size={10} className="ml-1" />
                  </a>
                ))}
              </div>
            )}

            {msg.chips && msg.chips.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {msg.chips.map((chip, i) => (
                  <button 
                    key={i}
                    onClick={() => { setInput(chip); }}
                    className="px-3 py-1.5 bg-white border border-ocean-200 text-ocean-700 rounded-full text-sm font-medium hover:bg-ocean-50 transition-colors shadow-sm"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isListening && (
           <div className="flex items-center space-x-2 text-ocean-600 bg-ocean-50 w-max px-4 py-2 rounded-full font-medium text-sm animate-pulse">
             <RefreshCw size={16} className="animate-spin" />
             <span>Listening...</span>
           </div>
        )}
        {isLoading && !isListening && (
           <div className="flex items-center space-x-2 text-gray-500 bg-gray-100 w-max px-4 py-2 rounded-full font-medium text-sm animate-pulse">
             <span>Thinking...</span>
           </div>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-safe z-10">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleMicClick}
            className={clsx(
              "p-3 rounded-full flex-shrink-0 transition-colors",
              isListening ? "bg-danger text-white animate-pulse" : "bg-ocean-100 text-ocean-600 hover:bg-ocean-200"
            )}
          >
            <Mic size={24} />
          </button>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-ocean-500 text-[15px]"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-ocean-600 text-white rounded-full flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ocean-700 transition-colors"
          >
            <Send size={20} className="ml-0.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
