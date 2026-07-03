'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Heart, 
  UserPlus, 
  MessageSquare, 
  Sparkles, 
  ShieldAlert, 
  ChevronLeft,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function ActivityPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'social'>('all');

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

  const notifications = [
    { id: 1, type: 'system', title: 'EVENTO NEXUS', message: '¡El concurso de talentos empieza mañana! Prepárate.', time: '10m', icon: Sparkles, color: 'text-purple-400' },
    { id: 2, type: 'social', title: 'NUEVA SOLICITUD', message: 'Alexis, Juan te ha enviado una solicitud de amistad. Es mayor de edad (18), revisa su perfil.', time: '1h', icon: UserPlus, color: 'text-blue-400' },
    { id: 3, type: 'social', title: 'LIKE', message: 'A @Maria le ha gustado tu publicación.', time: '2h', icon: Heart, color: 'text-red-400' },
    { id: 4, type: 'system', title: 'SEGURIDAD AIMEA', message: 'Se ha detectado una actividad sospechosa en un club que sigues. Estamos revisando.', time: '5h', icon: ShieldAlert, color: 'text-yellow-400' },
  ];

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <header className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/')} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={24} /></button>
        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Actividad</h1>
      </header>

      <div className="flex gap-4 mb-8">
        {['all', 'social', 'system'].map(t => (
          <button 
            key={t}
            onClick={() => setActiveTab(t as any)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-widest border transition-all ${activeTab === t ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-gray-800'}`}
          >
            {t === 'all' ? 'Todo' : t === 'social' ? 'Social' : 'Sistema'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {notifications.filter(n => activeTab === 'all' || n.type === activeTab).map((n) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }} 
            animate={{ opacity: 1, x: 0 }}
            key={n.id} 
            className="bg-[#0a0a0a] border border-white/5 p-5 rounded-[2rem] flex items-start gap-4 hover:border-white/10 transition-all cursor-pointer"
          >
            <div className={`p-3 rounded-2xl bg-white/5 ${n.color}`}>
               <n.icon size={20} />
            </div>
            <div className="flex-1 space-y-1">
               <div className="flex justify-between items-center">
                  <h4 className={`text-[10px] font-black uppercase tracking-widest ${n.color}`}>{n.title}</h4>
                  <span className="text-[10px] text-gray-600 font-bold">{n.time}</span>
               </div>
               <p className="text-xs font-medium text-gray-300 leading-relaxed">{n.message}</p>
            </div>
          </motion.div>
        ))}

        {notifications.length === 0 && (
          <div className="text-center py-20 opacity-20">
             <Bell size={48} className="mx-auto mb-4" />
             <p className="font-black italic uppercase">Sin notificaciones</p>
          </div>
        )}
      </div>

      {/* Admin Message UI */}
      <div className="mt-10 p-6 bg-purple-600/10 border border-purple-500/30 rounded-[2.5rem] relative overflow-hidden">
         <div className="absolute top-0 right-0 p-4 opacity-20"><Info size={40} /></div>
         <h3 className="text-purple-400 font-black italic uppercase text-lg">Nota del Creador</h3>
         <p className="text-xs text-gray-300 font-medium italic mt-2">"NEXUS es tu espacio. Mantente seguro y reporta cualquier cosa que te incomode. AIMEA y yo estamos aquí para ti."</p>
      </div>

      <div className="h-24" />
    </main>
  );
}
