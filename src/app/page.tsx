'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  MessageSquare, 
  Bell, 
  Users, 
  Plus, 
  Heart, 
  Share2, 
  MessageCircle, 
  Download,
  MoreVertical,
  Flag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ImeaAssistant from '@/components/imea/ImeaAssistant';
import PostCard from '@/components/home/PostCard';
import { useRouter } from 'next/navigation';

export default function NexusHome() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchPosts();
      } else {
        router.push('/auth/register');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts') // El usuario pidió cambiar publications a posts en SQL anterior
      .select('*, profiles:users(username, profile_pic, is_adult)')
      .order('created_at', { ascending: false });

    if (!error) {
      const formattedPosts = (data || []).map(p => ({
        ...p,
        description: p.caption,
        content_url: p.media_url,
        profiles: {
          username: p.profiles?.username || 'user',
          avatar_url: p.profiles?.profile_pic || 'https://picsum.photos/200',
          is_minor: !p.profiles?.is_adult
        },
        hashtags: p.tags || [],
        stats: p.stats || { likes: 0, comments: 0, shares: 0 }
      }));
      setPosts(formattedPosts);
    }
    setLoading(false);
  };

  const renderNav = () => (
    <nav className="fixed bottom-6 left-6 right-6 h-20 bg-gradient-to-r from-pink-600/80 to-purple-600/80 backdrop-blur-xl rounded-[2rem] border border-white/20 flex justify-around items-center z-50 shadow-[0_0_40px_rgba(219,39,119,0.3)] px-4">
      <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'home' ? 'text-white scale-110' : 'text-white/50'}`}>
        <Home size={28} />
        <span className="text-[9px] font-black uppercase tracking-widest">Nexus</span>
      </button>
      <button onClick={() => setActiveTab('explore')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'explore' ? 'text-white scale-110' : 'text-white/50'}`}>
        <Search size={28} />
        <span className="text-[9px] font-black uppercase tracking-widest">Explorar</span>
      </button>
      <button onClick={() => setActiveTab('chats')} className={`flex flex-col items-center gap-1 relative transition-all ${activeTab === 'chats' ? 'text-white scale-110' : 'text-white/50'}`}>
        <MessageSquare size={28} />
        <span className="text-[9px] font-black uppercase tracking-widest">Chats</span>
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-white rounded-full animate-pulse border-2 border-pink-600"></div>
      </button>
      <button onClick={() => setActiveTab('activity')} className={`flex flex-col items-center gap-1 relative transition-all ${activeTab === 'activity' ? 'text-white scale-110' : 'text-white/50'}`}>
        <Bell size={28} />
        <span className="text-[9px] font-black uppercase tracking-widest">Notis</span>
      </button>
      <button onClick={() => setActiveTab('clubs')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'clubs' ? 'text-white scale-110' : 'text-white/50'}`}>
        <Users size={28} />
        <span className="text-[9px] font-black uppercase tracking-widest">Clubs</span>
      </button>
    </nav>
  );

  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 z-40 border-b border-white/10">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">NEXUS</h1>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.push('/profile')}
          className="w-10 h-10 rounded-full border border-white/20 overflow-hidden"
        >
          <img src={user?.photoURL || 'https://picsum.photos/200'} alt="Profile" className="w-full h-full object-cover" />
        </button>
      </div>
    </header>
  );

  return (
    <main className="min-h-screen bg-[#050505] text-white pb-24 pt-20">
      {renderHeader()}
      
      <section className="max-w-xl mx-auto px-4 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Iniciando...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-gray-500 font-medium italic">No hay nada nuevo por aquí.</p>
            <button 
              onClick={() => router.push('/create-post')}
              className="bg-white text-black px-6 py-2 rounded-full font-bold uppercase text-xs"
            >
              Crear Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </section>

      {/* Botón flotante (+) */}
      <button 
        onClick={() => router.push('/create-post')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-xl z-40 hover:scale-105 transition-all"
      >
        <Plus size={32} />
      </button>

      {renderNav()}
      <ImeaAssistant />
    </main>
  );
}

