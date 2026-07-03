'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X, Check, ArrowRight, ShieldCheck, Heart, Info } from 'lucide-react';

interface RequestProps {
  request: {
    sender_name: string;
    sender_age: number;
    sender_pic: string;
    is_adult: boolean;
  };
  isUserMinor: boolean;
  onAccept: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}

export default function ChatRequestModal({ request, isUserMinor, onAccept, onReject, onClose }: RequestProps) {
  const [step, setStep] = useState(1); 
  const [reason, setReason] = useState('');

  const REJECT_REASONS = [
    'no me gusta su contenido',
    'me incómoda',
    'spam',
    'es un acosador',
    'no me interesa este usuario',
    'es el mismo usuario anterior Pero con otra cuenta',
    'es un usuario que me molesta y me burla',
    'amenaza con publicar mis fotos'
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
      {/* Fondo nebuloso interno */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0a0a0a]/80 border border-white/10 rounded-[3.5rem] p-8 space-y-6 relative overflow-hidden shadow-2xl"
      >
        {step === 1 && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center relative">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-blue-500 animate-spin-slow">
                 <div className="w-full h-full rounded-full border-4 border-black overflow-hidden bg-gray-900">
                    <img src={request.sender_pic} className="w-full h-full object-cover" />
                 </div>
              </div>
              {request.is_adult && (
                <div className="absolute top-0 right-1/4 bg-blue-500 p-2 rounded-full border-2 border-black shadow-lg">
                  <ShieldAlert size={18} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Nueva Conexión</h2>
              <p className="text-sm text-gray-400 font-medium italic">
                <span className="text-white font-black not-italic text-lg">@{request.sender_name}</span> quiere hablar contigo.
                {request.is_adult && (
                   <span className="text-blue-400 block font-black uppercase mt-1 tracking-widest text-[10px]">
                      Aviso: Es mayor de edad ({request.sender_age} años)
                   </span>
                )}
              </p>
            </div>

            <div className="p-5 bg-white/5 border border-white/10 rounded-3xl text-[11px] text-gray-300 font-medium italic leading-relaxed">
              <Info size={14} className="inline mr-2 text-purple-400" />
              Puedes checar su perfil para estar seguro. No te preocupes, no se le avisará al otro usuario. Tu seguridad es primero en <span className="text-white font-black">NEXUS</span>.
            </div>

            <button 
              onClick={() => setStep(2)} 
              className="w-full bg-white text-black py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-2 hover:scale-105 transition-all"
            >
              EXPLORAR PERFIL <ArrowRight size={20} />
            </button>
            <button onClick={onClose} className="text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors">Ahora no</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="h-72 bg-gray-900 rounded-[2.5rem] relative overflow-hidden group">
               <img src="https://picsum.photos/seed/profile/400/600" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
               <div className="absolute bottom-8 left-8 space-y-2">
                  <h3 className="text-3xl font-black italic tracking-tighter">@{request.sender_name}</h3>
                  <p className="text-xs text-gray-300 font-medium italic max-w-[200px]">"Viviendo cada día como si fuera el último. Amante del arte y la música."</p>
               </div>
               <button onClick={() => setStep(1)} className="absolute top-6 right-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white">
                  <X size={20} />
               </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setStep(4)} 
                className="bg-red-500/10 border border-red-500/20 py-5 rounded-3xl font-black text-red-500 uppercase text-xs tracking-widest hover:bg-red-500/20 transition-all"
              >
                Rechazar
              </button>
              <button 
                onClick={() => setStep(3)} 
                className="bg-green-500/10 border border-green-500/20 py-5 rounded-3xl font-black text-green-500 uppercase text-xs tracking-widest hover:bg-green-500/20 transition-all"
              >
                Me Interesa
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 text-center py-4">
            <div className="relative inline-block">
               <Heart size={80} className="text-pink-500 animate-pulse fill-pink-500/20" />
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0, 0.5, 0] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 bg-pink-500 rounded-full blur-2xl"
               />
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">¿Confirmas la <br/>conexión?</h2>
            <div className="space-y-3">
              <button 
                onClick={onAccept}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 py-5 rounded-[2rem] font-black text-xl shadow-lg shadow-green-500/20"
              >
                SÍ, ACEPTAR CHAT
              </button>
              <button onClick={() => setStep(2)} className="w-full py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest">Tal vez después</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Ayúdanos a mejorar</h3>
              <p className="text-xs text-gray-400 font-medium italic">¿Por qué quieres rechazar a @{request.sender_name}?</p>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {REJECT_REASONS.map(r => (
                 <button 
                   key={r}
                   onClick={() => {
                     setReason(r);
                     if (r === 'es un acosador' || r === 'amenaza con publicar mis fotos') {
                       alert("AIMEA: Estamos aquí para ti. Bloquearemos a este usuario permanentemente. Te recomendamos hablar con alguien de confianza.");
                     }
                     onReject(r);
                   }}
                   className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left text-[9px] font-black uppercase italic hover:bg-red-500/10 hover:border-red-500/20 transition-all group"
                 >
                   <span className="group-hover:text-red-400 transition-colors">{r}</span>
                 </button>
               ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full py-2 text-gray-500 font-black uppercase text-[10px] tracking-widest text-center">Cancelar</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
