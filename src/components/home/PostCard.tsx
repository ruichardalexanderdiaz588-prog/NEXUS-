'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Download, 
  MoreVertical, 
  Flag,
  ShieldAlert,
  UserPlus,
  Bookmark
} from 'lucide-react';

interface PostProps {
  post: {
    id: string;
    description: string;
    content_url: string;
    created_at: string;
    hashtags: string[];
    profiles: {
      username: string;
      avatar_url: string;
      is_minor: boolean;
    };
    stats: {
      likes: number;
      comments: number;
      shares: number;
    };
  };
}

export default function PostCard({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0A0A0A]/60 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden relative"
    >
      {/* Marco Nebuloso sutil en el fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none" />

      {/* Header */}
      <div className="p-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 p-[2px]">
             <div className="w-full h-full rounded-[14px] overflow-hidden border-2 border-black bg-gray-900">
                <img src={post.profiles.avatar_url} alt="User" className="w-full h-full object-cover" />
             </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black italic text-sm tracking-tighter">@{post.profiles.username}</h3>
              {post.profiles.is_minor && (
                <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-full">
                  <ShieldAlert size={8} className="text-yellow-500" />
                  <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Menor</span>
                </div>
              )}
            </div>
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Publicado hace 2h</p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowOptions(!showOptions)}
            className="p-2 hover:bg-white/5 rounded-xl transition-all"
          >
            <MoreVertical size={20} className="text-gray-400" />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-12 w-48 bg-[#111] border border-white/10 rounded-2xl p-2 z-50 shadow-2xl"
              >
                <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-xs font-black italic uppercase text-gray-400 hover:text-white transition-all">
                  <UserPlus size={16} /> Seguir Usuario
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-xs font-black italic uppercase text-red-500 transition-all">
                  <Flag size={16} /> Reportar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Media Content */}
      <div className="relative aspect-[4/5] bg-gray-900 mx-4 rounded-[2rem] overflow-hidden group">
        <img 
          src={post.content_url} 
          alt="Post Content" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Like heart animation on double tap (placeholder) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <Heart size={80} className="text-white opacity-0 scale-0 group-active:animate-ping" fill="currentColor" />
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 pt-4 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-2 transition-all ${isLiked ? 'text-pink-500 scale-110' : 'text-gray-400 hover:text-white'}`}
            >
              <Heart size={28} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-xs font-black">{post.stats?.likes || 0}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-all">
              <MessageCircle size={28} />
              <span className="text-xs font-black">{post.stats?.comments || 0}</span>
            </button>
            <button className="text-gray-400 hover:text-white transition-all">
              <Share2 size={28} />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-all">
              <Bookmark size={26} />
            </button>
            <button className="text-gray-400 hover:text-white transition-all">
              <Download size={26} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-gray-200">
            <span className="font-black italic mr-2 text-white">@{post.profiles.username}</span>
            {post.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {post.hashtags?.map((tag) => (
              <span key={tag} className="text-pink-500/80 text-[10px] font-black uppercase italic tracking-widest hover:text-pink-400 cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
