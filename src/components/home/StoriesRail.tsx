'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Story {
  id: string;
  user_id: string;
  content_url: string;
  content_type: string;
  users: {
    username: string;
    profile_pic: string;
  };
}

export default function StoriesRail({ userId }: { userId?: string }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          users:user_id (username, profile_pic)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStory = async () => {
    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (file.type.startsWith('video/')) {
        // Mock check for 30s as real check requires loading video
      }

      alert("Subiendo historia... (Simulado para esta demo, en producción usaría bucket 'stories')");
      // In real app, upload to storage, then insert to DB
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-4 p-4 overflow-x-auto no-scrollbar bg-black">
      {/* Add Story */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button 
          onClick={handleAddStory}
          className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center bg-gray-900 hover:border-purple-500 transition-all"
        >
          <Plus className="text-gray-400" />
        </button>
        <span className="text-[10px] font-black uppercase text-gray-500">History</span>
      </div>

      {stories.map((story) => (
        <motion.div 
          key={story.id}
          whileTap={{ scale: 0.9 }}
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer"
        >
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600">
            <div className="w-[60px] h-[60px] rounded-full border-2 border-black overflow-hidden bg-gray-900">
              <img 
                src={story.users.profile_pic || 'https://picsum.photos/100'} 
                alt={story.users.username} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-white truncate w-16 text-center">
            {story.users.username}
          </span>
        </motion.div>
      ))}

      {stories.length === 0 && !loading && (
        <div className="flex items-center gap-4 opacity-50">
          {[1,2,3].map(i => (
            <div key={i} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-16 h-16 rounded-full border border-gray-800 bg-gray-900/50" />
              <div className="h-2 w-10 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
