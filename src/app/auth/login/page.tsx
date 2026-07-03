'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Home, Mail, Lock, Heart, ArrowRight } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">NEXUS</h1>
          <p className="text-gray-400 text-sm">Ingresa a tu cuenta</p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white" size={20} />
            <input 
              type="email" 
              placeholder="Email"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-white transition-all outline-none text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white" size={20} />
            <input 
              type="password" 
              placeholder="Contraseña"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 font-bold focus:border-white transition-all outline-none text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'ACCEDIENDO...' : 'ENTRAR'}
        </button>

        <div className="text-center">
          <button 
            onClick={() => router.push('/auth/register')} 
            className="text-gray-400 text-xs hover:text-white transition-colors"
          >
            ¿No tienes cuenta? <span className="text-white font-bold underline">Regístrate</span>
          </button>
        </div>
      </motion.div>
    </main>
  );
}

