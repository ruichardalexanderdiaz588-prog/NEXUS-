'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Brain, Smile, Frown, Meh, Heart } from 'lucide-react';

interface ImeaProps {
  isOpen: boolean;
  onClose: () => void;
  userEmotion?: 'sad' | 'happy' | 'neutral' | 'none';
  userAvatar?: string;
  onEmotionSelected?: (emotion: string) => void;
}

export default function ImeaAssistant({ isOpen, onClose, userEmotion = 'none', userAvatar, onEmotionSelected }: ImeaProps) {
  const [messages, setMessages] = useState<{ role: 'imea' | 'user', text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMsg = userEmotion === 'sad' 
        ? "Hola... detecto que hoy tu corazón pesa un poco. Aquí estoy para escucharte sin juicios. ¿Quieres contarme qué está pasando?"
        : "¡Hola! Soy IMEA, tu asistente en NEXUS. ¿Cómo te sientes hoy?";
      
      setMessages([{ role: 'imea', text: initialMsg }]);
    }
  }, [isOpen, userEmotion]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, text: input }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = "Entiendo... recordarte que en NEXUS nunca estás solo. Tomate tu tiempo, respira profundo. ¿Quieres que hablemos más sobre eso?";
      setMessages([...newMessages, { role: 'imea', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <AnimatePresence>
        {userEmotion === 'sad' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-indigo-950/90 backdrop-blur-3xl overflow-hidden"
          >
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-lg bg-[#0a0a0a]/80 border border-purple-500/30 backdrop-blur-xl rounded-[2.5rem] shadow-2xl flex flex-col h-[80vh] overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
              <Brain className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-black italic text-lg leading-tight">AIMEA</h3>
              <p className="text-[10px] uppercase font-black tracking-widest text-purple-400">Tu Guardián Digital</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: m.role === 'imea' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${m.role === 'imea' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[80%] p-4 rounded-2xl font-medium text-sm ${m.role === 'imea' ? 'bg-white/5 border border-white/10 text-gray-200' : 'bg-purple-600 text-white'}`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-300"></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {userEmotion === 'none' && messages.length === 1 && (
          <div className="p-6 grid grid-cols-3 gap-3">
            <button onClick={() => onEmotionSelected?.('happy')} className="p-4 bg-green-900/20 border border-green-500/50 rounded-2xl flex flex-col items-center gap-2 hover:bg-green-900/40 transition-all">
              <Smile className="text-green-400" />
              <span className="text-[10px] font-black uppercase">Bien</span>
            </button>
            <button onClick={() => onEmotionSelected?.('neutral')} className="p-4 bg-gray-900/20 border border-gray-500/50 rounded-2xl flex flex-col items-center gap-2 hover:bg-gray-900/40 transition-all">
              <Meh className="text-gray-400" />
              <span className="text-[10px] font-black uppercase">Normal</span>
            </button>
            <button onClick={() => onEmotionSelected?.('sad')} className="p-4 bg-red-900/20 border border-red-500/50 rounded-2xl flex flex-col items-center gap-2 hover:bg-red-900/40 transition-all">
              <Frown className="text-red-400" />
              <span className="text-[10px] font-black uppercase">Triste</span>
            </button>
          </div>
        )}

        <div className="p-6 pt-0">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Habla con AIMEA..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-sm font-medium outline-none focus:border-purple-500 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-xl"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
