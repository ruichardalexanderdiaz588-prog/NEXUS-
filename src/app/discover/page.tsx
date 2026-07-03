'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MessageSquare, 
  Mic, 
  Video, 
  Wind, 
  ChevronLeft, 
  ShieldAlert, 
  Heart,
  Timer,
  X,
  Check
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function DiscoverPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [view, setView] = useState<'main' | 'match' | 'chat'>('main');
  const [matchType, setMatchType] = useState<'text' | 'audio' | 'video' | 'bottle' | null>(null);
  const [countdown, setCountdown] = useState(180);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const { data } = await supabase.from('users').select('*').eq('id', u.uid).single();
        setCurrentUser(data);
      } else {
        router.push('/auth/register');
      }
    });
    return () => unsubscribe();
  }, []);

  const startMatch = (type: 'text' | 'audio' | 'video' | 'bottle') => {
    setMatchType(type);
    setIsMatching(true);
    // Simulate finding someone
    setTimeout(() => {
      setIsMatching(false);
      setView('match');
      setCountdown(180);
    }, 2000);
  };

  useEffect(() => {
    let timer: any;
    if (view === 'match' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setView('main');
    }
    return () => clearInterval(timer);
  }, [view, countdown]);

  const renderMain = () => (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => router.push('/')} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={24} /></button>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Descubre</h1>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => startMatch('text')}
          className="bg-green-600/10 border border-green-500/30 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-green-600/20 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/40">
                <MessageSquare className="text-white" size={28} />
             </div>
             <div className="text-left">
                <h3 className="text-lg font-black italic text-green-400">Conoce por texto</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Encuentra tu match ideal</p>
             </div>
          </div>
          <ChevronLeft className="rotate-180 text-green-600 opacity-0 group-hover:opacity-100 transition-all" />
        </button>

        <button 
          onClick={() => startMatch('audio')}
          className="bg-blue-600/10 border border-blue-500/30 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-blue-600/20 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                <Mic className="text-white" size={28} />
             </div>
             <div className="text-left">
                <h3 className="text-lg font-black italic text-blue-400">Conoce por audio</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Escucha nuevas voces</p>
             </div>
          </div>
          <ChevronLeft className="rotate-180 text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
        </button>

        <button 
          onClick={() => startMatch('video')}
          className="bg-pink-600/10 border border-pink-500/30 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-pink-600/20 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-600/40">
                <Video className="text-white" size={28} />
             </div>
             <div className="text-left">
                <h3 className="text-lg font-black italic text-pink-400">Conoce por video</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Conexión cara a cara</p>
             </div>
          </div>
          <ChevronLeft className="rotate-180 text-pink-600 opacity-0 group-hover:opacity-100 transition-all" />
        </button>

        <button 
          onClick={() => startMatch('bottle')}
          className="bg-yellow-600/10 border border-yellow-500/30 p-6 rounded-[2.5rem] flex items-center justify-between group hover:bg-yellow-600/20 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-600/40">
                <Wind className="text-white" size={28} />
             </div>
             <div className="text-left">
                <h3 className="text-lg font-black italic text-yellow-400">Botella a la deriva</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Mensajes al azar</p>
             </div>
          </div>
          <ChevronLeft className="rotate-180 text-yellow-600 opacity-0 group-hover:opacity-100 transition-all" />
        </button>
      </div>

      <div className="p-8 text-center bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-4">
         <h4 className="text-xs font-black italic uppercase tracking-widest">Sugerencias para ti</h4>
         <div className="flex justify-center gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                <img src={`https://picsum.photos/seed/${i}/100`} className="w-full h-full object-cover" />
              </div>
            ))}
         </div>
      </div>
    </div>
  );

  const renderMatch = () => (
    <div className="h-full flex flex-col justify-between py-10">
       <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-purple-400 font-black italic">
             <Timer size={24} className="animate-pulse" />
             <span className="text-4xl">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
          </div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">Tiempo restante de match</p>
       </div>

       <div className="flex flex-col items-center gap-8">
          <div className="relative">
             <div className="w-48 h-48 rounded-full border-4 border-purple-500 overflow-hidden shadow-2xl shadow-purple-500/30">
                <img src="https://picsum.photos/400" className="w-full h-full object-cover" />
             </div>
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-purple-600 px-6 py-2 rounded-full font-black italic uppercase text-xs">
                @User_Cool_23
             </div>
          </div>
          <div className="text-center space-y-2">
             <h3 className="text-2xl font-black italic">¿Quieres seguir hablando?</h3>
             <p className="text-xs text-gray-500 font-medium px-10 italic">Si ambos aceptan antes de que el tiempo termine, se abrirá un chat permanente.</p>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-4 px-4">
          <button onClick={() => setView('main')} className="bg-red-600/10 border border-red-500/30 py-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-red-600/20 transition-all">
             <X size={32} className="text-red-500" />
             <span className="text-[10px] font-black uppercase">Rechazar</span>
          </button>
          <button onClick={() => setView('main')} className="bg-green-600/10 border border-green-500/30 py-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-green-600/20 transition-all">
             <Check size={32} className="text-green-500" />
             <span className="text-[10px] font-black uppercase">Aceptar Chat</span>
          </button>
       </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <AnimatePresence mode="wait">
        {isMatching ? (
          <motion.div 
            key="matching" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-10 space-y-8"
          >
             <div className="relative w-40 h-40">
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full animate-ping opacity-20" />
                <div className="absolute inset-2 border-4 border-purple-500 rounded-full animate-ping opacity-40 delay-300" />
                <div className="absolute inset-4 border-4 border-purple-500 rounded-full animate-ping opacity-60 delay-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Search size={48} className="text-purple-500 animate-pulse" />
                </div>
             </div>
             <div className="text-center space-y-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Buscando Alma Libre...</h2>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest italic">AIMEA está filtrando para tu seguridad</p>
             </div>
          </motion.div>
        ) : view === 'main' ? (
          <motion.div key="main" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {renderMain()}
          </motion.div>
        ) : (
          <motion.div key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[90vh]">
            {renderMatch()}
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/5 px-2 py-4 flex items-center justify-around">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-500">
          <ChevronLeft size={24} />
          <span className="text-[8px] font-black uppercase">Volver</span>
        </button>
      </nav>
    </main>
  );
}
