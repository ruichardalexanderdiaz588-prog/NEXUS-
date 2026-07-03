'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  ArrowRight, 
  Check, 
  Camera, 
  User, 
  Heart, 
  Sparkles, 
  ShieldAlert,
  ArrowLeft,
  X
} from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0: Welcome, 1: Terms, 2: Nickname, 3: Username, 4: Hobbies, 5: Birthdate, 6: Age Check, 7: Camera, 8: Orientation, 9: ProfilePic, 10: Auth
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    nickname: '',
    birthDate: '',
    hobbies: [] as string[],
    orientation: '',
    profilePic: 'https://picsum.photos/seed/user/200',
    age: 0,
    isAdult: false
  });

  const hobbiesList = ['Música', 'Arte', 'Gaming', 'Deporte', 'Cine', 'Lectura', 'Viajes', 'Tecnología', 'Moda', 'Cocina'];
  const orientations = [
    { id: 'hetero', label: 'Heterosexual', msg: '¡Genial! Respetamos tu esencia.' },
    { id: 'gay', label: 'Gay', msg: '¡Nexus es un espacio seguro para brillar!' },
    { id: 'lesbian', label: 'Lesbiana', msg: 'Tu amor es libre aquí.' },
    { id: 'bi', label: 'Bisexual', msg: 'Amamos la diversidad.' },
    { id: 'pan', label: 'Pansexual', msg: 'El amor no tiene límites.' },
    { id: 'ace', label: 'Asexual', msg: 'Respetamos tu forma de sentir.' },
    { id: 'other', label: 'Otro', msg: 'Eres único, y eso nos encanta.' }
  ];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.username,
        photoURL: formData.profilePic
      });

      const { error } = await supabase.from('users').insert({
        id: user.uid,
        username: formData.username,
        nickname: formData.nickname,
        email: formData.email,
        birth_date: formData.birthDate,
        age: formData.age,
        is_adult: formData.isAdult,
        profile_pic: formData.profilePic,
        hobbies: formData.hobbies,
        orientation: formData.orientation,
        points: 100
      });

      if (error) throw error;
      router.push('/');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex flex-col items-center text-center space-y-8 z-10"
          >
            <div className="w-32 h-32 rounded-3xl bg-white text-black flex items-center justify-center shadow-2xl">
              <Home size={64} />
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl font-black italic tracking-tighter uppercase">NEXUS</h1>
              <p className="text-gray-400 font-medium italic">
                Bienvenido a la nueva red social.
              </p>
            </div>

            <button 
              onClick={handleNext}
              className="bg-white text-black px-12 py-4 rounded-full font-black text-xl hover:scale-105 transition-all"
            >
              COMENZAR
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 text-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter">Términos y Condiciones</h2>
            <div className="h-48 overflow-y-auto bg-black/40 rounded-xl p-4 text-xs text-gray-400 text-left">
              <p>Al unirte a NEXUS, aceptas respetar a todos los usuarios.</p>
              <ul className="list-disc pl-4 mt-2 space-y-1">
                <li>Sin odio ni discriminación.</li>
                <li>Nexus es una red social, no de citas.</li>
                <li>Respeta la privacidad ajena.</li>
              </ul>
            </div>
            <button 
              onClick={() => setAcceptedTerms(!acceptedTerms)}
              className="flex items-center gap-3 mx-auto"
            >
              <div className={`w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center ${acceptedTerms ? 'bg-white border-white' : 'border-white/20'}`}>
                {acceptedTerms && <Check size={16} className="text-black" />}
              </div>
              <span className="font-bold text-xs">Acepto los términos</span>
            </button>
            <button 
              disabled={!acceptedTerms}
              onClick={handleNext}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${acceptedTerms ? 'bg-white text-black hover:scale-[1.02]' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
            >
              CONTINUAR
            </button>
          </motion.div>
          {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full space-y-6 text-center">
            <h2 className="text-3xl font-black uppercase">¿Cómo te llamas?</h2>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
              <input 
                type="text" 
                placeholder="NICKNAME"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 font-bold text-xl focus:border-white transition-all outline-none"
                value={formData.nickname}
                onChange={(e) => setFormData({...formData, nickname: e.target.value})}
              />
            </div>
            <button 
              disabled={!formData.nickname}
              onClick={handleNext}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              SIGUIENTE
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full space-y-6 text-center">
            <h2 className="text-3xl font-black uppercase">Usuario</h2>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">@</span>
              <input 
                type="text" 
                placeholder="USUARIO"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-6 font-bold text-xl focus:border-white transition-all outline-none lowercase"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase()})}
              />
            </div>
            <button 
              disabled={!formData.username}
              onClick={handleNext}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              SIGUIENTE
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full space-y-6 text-center">
            <h2 className="text-2xl font-black uppercase">Intereses</h2>
            <div className="grid grid-cols-2 gap-2">
               {hobbiesList.map(h => (
                 <button 
                   key={h}
                   onClick={() => {
                     const newHobbies = formData.hobbies.includes(h) 
                       ? formData.hobbies.filter(x => x !== h) 
                       : [...formData.hobbies, h];
                     setFormData({...formData, hobbies: newHobbies});
                   }}
                   className={`p-3 rounded-xl font-bold uppercase text-[10px] transition-all border ${formData.hobbies.includes(h) ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-500'}`}
                 >
                   {h}
                 </button>
               ))}
            </div>
            <button 
              disabled={formData.hobbies.length < 2}
              onClick={handleNext}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg disabled:opacity-50"
            >
              CONTINUAR
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full space-y-6 text-center">
            <h2 className="text-2xl font-black uppercase">Tu Cumpleaños</h2>
            <input 
              type="date" 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 font-bold text-xl focus:border-white outline-none"
              value={formData.birthDate}
              onChange={(e) => {
                const age = calculateAge(e.target.value);
                setFormData({...formData, birthDate: e.target.value, age, isAdult: age >= 18});
              }}
            />
            <button 
              disabled={!formData.birthDate}
              onClick={handleNext}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg disabled:opacity-50"
            >
              SIGUIENTE
            </button>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 text-center">
            {formData.age < 13 ? (
              <div className="space-y-4">
                <ShieldAlert size={48} className="text-red-500 mx-auto" />
                <h2 className="text-xl font-black uppercase text-red-500">Acceso Denegado</h2>
                <p className="text-gray-400 text-sm">Debes ser mayor de 13 años.</p>
                <button onClick={() => setStep(0)} className="w-full bg-white text-black py-3 rounded-xl font-bold uppercase">Volver</button>
              </div>
            ) : (
              <div className="space-y-4">
                <Check size={48} className="text-green-500 mx-auto" />
                <h2 className="text-xl font-black uppercase">Verificado</h2>
                <p className="text-gray-400 text-sm">{formData.isAdult ? "Acceso Adulto" : "Modo Protegido (Menor)"}</p>
                <button onClick={handleNext} className="w-full bg-white text-black py-3 rounded-xl font-bold uppercase">CONTINUAR</button>
              </div>
            )}
          </motion.div>
        )}

        {step === 7 && (
          <motion.div key="step7" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full space-y-6 text-center">
            <h2 className="text-2xl font-black uppercase">Verificación</h2>
            <div className="aspect-square bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/10 transition-colors">
               <Camera size={48} className="text-gray-600" />
               <p className="text-xs font-bold uppercase text-gray-500">Abrir Cámara</p>
            </div>
            <button 
              onClick={handleNext}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg"
            >
              CONFIRMAR
            </button>
          </motion.div>
        )}

        {step === 8 && (
          <motion.div key="step8" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full space-y-4 text-center">
             <h2 className="text-2xl font-black uppercase">Orientación</h2>
             <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2">
                {orientations.map(o => (
                  <button 
                    key={o.id}
                    onClick={() => setFormData({...formData, orientation: o.id})}
                    className={`p-4 rounded-xl text-left flex items-center justify-between transition-all border ${formData.orientation === o.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                  >
                    <span className="font-bold uppercase text-[10px]">{o.label}</span>
                    {formData.orientation === o.id && <Check size={14} />}
                  </button>
                ))}
             </div>
             <button 
              disabled={!formData.orientation}
              onClick={handleNext}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg disabled:opacity-50"
            >
              SIGUIENTE
            </button>
          </motion.div>
        )}

        {step === 9 && (
          <motion.div key="step9" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full space-y-8 text-center">
             <h2 className="text-2xl font-black uppercase">Foto de Perfil</h2>
             <div className="flex flex-col items-center gap-4">
                <div className="w-40 h-40 rounded-3xl bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer">
                   <img src={formData.profilePic} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera size={32} />
                   </div>
                </div>
                <button className="text-gray-500 font-bold uppercase text-[10px] underline">Cambiar</button>
             </div>
             <button 
              onClick={handleNext}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg"
            >
              LISTO
            </button>
          </motion.div>
        )}

        {step === 10 && (
          <motion.div key="step10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black uppercase">Cuenta</h2>
              <p className="text-gray-400 text-xs">Protege tu acceso.</p>
            </div>

            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Email"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 font-bold focus:border-white outline-none"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Contraseña"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-6 font-bold focus:border-white outline-none"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>

            <button 
              onClick={handleFinish}
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-xl font-black text-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? 'CREANDO...' : 'ENTRAR'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navegación Inferior */}
      {step > 0 && step < 10 && (
        <div className="fixed bottom-10 left-0 right-0 flex justify-center gap-4 z-10">
           <button onClick={handleBack} className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-500 hover:text-white">
              <ArrowLeft size={20} />
           </button>
           <div className="flex items-center gap-1">
              {[...Array(11)].map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${step === i ? 'bg-white scale-125' : 'bg-white/20'}`} />
              ))}
           </div>
        </div>
      )}
}
           </div>
        </div>
      )}

      {/* Corazones flotantes decorativos eliminados para diseño más limpio */}
    </main>
  );
}

