'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Users, 
  Plus, 
  ChevronLeft, 
  Camera, 
  ShieldAlert, 
  Globe, 
  Lock,
  Check,
  Search,
  Settings,
  Info,
  LogOut,
  Trash2,
  UserX,
  UserCheck,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const CLUB_TAGS = ['humor', 'LGBT', 'vidaCotidiana', 'ciencia', 'tecnología', 'música', 'arte', 'deportes', 'videojuegos'];

export default function ClubsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'chat' | 'admin' | 'info'>('list');
  const [selectedClub, setSelectedClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Creation State
  const [createStep, setCreateStep] = useState(1);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    cover_url: '',
    profile_url: '',
    tags: [] as string[],
    is_private: false,
    is_plus18: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const { data } = await supabase.from('users').select('*').eq('id', u.uid).single();
        setCurrentUser(data);
        fetchClubs();
      } else {
        router.push('/auth/register');
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchClubs = async () => {
    const { data } = await supabase.from('clubs').select('*').order('created_at', { ascending: false });
    if (data) setClubs(data);
    setLoading(false);
  };

  const handleCreateClub = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('clubs').insert({
        owner_id: currentUser.id,
        name: newClub.name,
        description: newClub.description,
        cover_url: newClub.cover_url || 'https://picsum.photos/800/400',
        profile_url: newClub.profile_url || 'https://picsum.photos/400',
        tags: newClub.tags,
        is_private: newClub.is_plus18 ? true : newClub.is_private,
        is_plus18: newClub.is_plus18
      }).select().single();

      if (error) throw error;

      // Add owner as member
      await supabase.from('club_members').insert({
        club_id: data.id,
        user_id: currentUser.id,
        role: 'owner'
      });

      setClubs([data, ...clubs]);
      setView('list');
    } catch (e) {
      console.error(e);
      alert("Error al crear club");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async (club: any) => {
    if (club.is_private) {
      alert("Solicitud enviada con éxito. Espera a que el administrador acepte tu solicitud.");
      return;
    }

    try {
      await supabase.from('club_members').insert({
        club_id: club.id,
        user_id: currentUser.id,
        role: 'member'
      });
      alert("¡Te has unido al club!");
      setSelectedClub(club);
      setView('chat');
    } catch (e) {
      console.error(e);
    }
  };

  const renderClubList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Users className="text-purple-500" size={32} />
           <h1 className="text-4xl font-black italic tracking-tighter uppercase">Clubs</h1>
        </div>
        <button 
          onClick={() => setView('create')}
          className="bg-white text-black p-3 rounded-full hover:scale-105 transition-all shadow-xl"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative">
        <input 
          type="text" 
          placeholder="Buscar clubs increíbles..." 
          className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 pl-12 text-sm font-bold outline-none focus:border-purple-500 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {clubs.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0a] border border-gray-900 rounded-[3rem] space-y-4">
             <div className="text-6xl">🏚️</div>
             <p className="text-gray-500 font-black uppercase italic">Todavía no hay clubs. Crea tu primer club.</p>
             <button onClick={() => setView('create')} className="bg-purple-600 px-6 py-3 rounded-xl font-black uppercase italic text-xs">¡Crear Ahora!</button>
          </div>
        ) : (
          clubs.map((club) => (
            <motion.div 
              key={club.id}
              whileTap={{ scale: 0.98 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-purple-500/30 transition-all"
            >
              <div className="h-24 bg-gray-900 relative">
                <img src={club.cover_url} className="w-full h-full object-cover opacity-60" />
                <div className="absolute -bottom-6 left-6 w-16 h-16 rounded-2xl border-4 border-[#0a0a0a] bg-gray-800 overflow-hidden">
                  <img src={club.profile_url} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="p-6 pt-8 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black italic">{club.name}</h3>
                    {club.is_plus18 && <span className="bg-red-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">18+</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{club.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border border-black bg-gray-700" />)}
                    <span className="text-[10px] text-gray-500 font-bold ml-4 pt-1">+12 miembros</span>
                  </div>
                  <button 
                    onClick={() => handleJoinClub(club)}
                    className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase italic hover:bg-purple-400 transition-all"
                  >
                    {club.is_private ? 'Enviar Solicitud' : 'Unirse'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderCreateFlow = () => (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={() => setView('list')} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={24} /></button>
        <h2 className="text-3xl font-black italic">CREAR CLUB</h2>
      </header>

      <div className="flex justify-between items-center px-4">
        {[1,2,3].map(i => (
          <div key={i} className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${createStep >= i ? 'bg-purple-600 text-white' : 'bg-gray-900 text-gray-500'}`}>
                {i}
             </div>
             {i < 3 && <div className={`h-1 flex-1 mx-2 rounded-full ${createStep > i ? 'bg-purple-600' : 'bg-gray-900'}`} />}
          </div>
        ))}
      </div>

      {createStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black uppercase italic">Portada del club</h3>
            <p className="text-xs text-gray-500">Selecciona una imagen que defina tu comunidad.</p>
          </div>
          <div className="aspect-video w-full rounded-[2rem] border-2 border-dashed border-gray-800 bg-gray-900 flex flex-col items-center justify-center gap-2 hover:border-purple-500 transition-all cursor-pointer">
             <Camera size={32} className="text-gray-600" />
             <span className="text-[10px] font-black uppercase text-gray-600">Subir Portada</span>
          </div>
          <button onClick={() => setCreateStep(2)} className="w-full bg-purple-600 py-4 rounded-2xl font-black text-lg">SIGUIENTE</button>
        </motion.div>
      )}

      {createStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black uppercase italic">Perfil del club</h3>
            <p className="text-xs text-gray-500">El ícono con el que todos te verán.</p>
          </div>
          <div className="flex justify-center">
            <div className="w-40 h-40 rounded-[2.5rem] border-2 border-dashed border-gray-800 bg-gray-900 flex flex-col items-center justify-center gap-2 hover:border-purple-500 transition-all cursor-pointer">
               <Camera size={32} className="text-gray-600" />
               <span className="text-[10px] font-black uppercase text-gray-600 text-center">Subir Perfil</span>
            </div>
          </div>
          <button onClick={() => setCreateStep(3)} className="w-full bg-purple-600 py-4 rounded-2xl font-black text-lg">SIGUIENTE</button>
        </motion.div>
      )}

      {createStep === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black uppercase italic">Personaliza tu Club</h3>
          </div>
          <div className="space-y-4">
             <input 
               placeholder="Nombre del club"
               className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 font-bold outline-none focus:border-purple-500"
               value={newClub.name}
               onChange={e => setNewClub({...newClub, name: e.target.value})}
             />
             <textarea 
               placeholder="Descripción (máximo 800 caracteres)"
               className="w-full bg-[#111] border border-gray-800 rounded-2xl p-4 h-32 text-sm font-medium outline-none focus:border-purple-500"
               maxLength={800}
               value={newClub.description}
               onChange={e => setNewClub({...newClub, description: e.target.value})}
             />
          </div>
          
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-gray-500 italic">Etiquetas #</p>
            <div className="flex flex-wrap gap-2">
              {CLUB_TAGS.map(t => (
                <button 
                  key={t}
                  onClick={() => {
                    const newTags = newClub.tags.includes(t) ? newClub.tags.filter(x => x !== t) : [...newClub.tags, t];
                    setNewClub({...newClub, tags: newTags});
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${newClub.tags.includes(t) ? 'bg-purple-600 border-purple-400' : 'bg-gray-900 border-gray-800'}`}
                >
                  #{t}
                </button>
              ))}
              <button 
                onClick={() => {
                  if (!currentUser.is_adult) {
                    alert("Eres menor de edad, por lo cual no puedes elegir esta categoría. Selecciona otra.");
                    return;
                  }
                  setNewClub({...newClub, is_plus18: !newClub.is_plus18});
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${newClub.is_plus18 ? 'bg-red-600 border-red-400' : 'bg-gray-900 border-gray-800'}`}
              >
                #+18
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-2xl space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   {newClub.is_private ? <Lock size={16} className="text-purple-400" /> : <Globe size={16} className="text-purple-400" />}
                   <span className="text-xs font-black uppercase italic">{newClub.is_private ? 'Privado' : 'Público'}</span>
                </div>
                <button 
                  disabled={newClub.is_plus18}
                  onClick={() => setNewClub({...newClub, is_private: !newClub.is_private})}
                  className={`w-10 h-5 rounded-full relative transition-all ${newClub.is_private ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newClub.is_private ? 'right-1' : 'left-1'}`} />
                </button>
             </div>
             {newClub.is_plus18 && (
                <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest italic">Categoría +18 activada. El club ahora es privado y solo adultos pueden entrar.</p>
             )}
          </div>

          <button 
            disabled={!newClub.name || loading}
            onClick={handleCreateClub} 
            className="w-full bg-purple-600 py-4 rounded-2xl font-black text-lg shadow-xl shadow-purple-600/30"
          >
            {loading ? 'CREANDO...' : '¡LANZAR CLUB!'}
          </button>
        </motion.div>
      )}
    </div>
  );

  const renderClubChat = () => (
    <div className="flex flex-col h-full bg-[#050505]">
      {/* Club Header */}
      <header className="p-4 border-b border-white/5 flex items-center justify-between bg-black">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')}><ChevronLeft size={24} /></button>
          <div className="w-10 h-10 rounded-xl overflow-hidden">
            <img src={selectedClub.profile_url} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-black italic text-sm">{selectedClub.name}</h3>
            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">12 Miembros Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setView('info')} className="p-2 hover:bg-white/5 rounded-full text-gray-400"><Info size={20} /></button>
           {selectedClub.owner_id === currentUser.id && (
             <button onClick={() => setView('admin')} className="p-2 hover:bg-white/5 rounded-full text-purple-400"><Settings size={20} /></button>
           )}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
         <div className="text-center py-10">
            <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] italic">Has entrado al club de {selectedClub.name}</p>
         </div>
         {/* Placeholder messages */}
         <div className="flex justify-start">
            <div className="bg-white/5 p-4 rounded-2xl rounded-bl-none max-w-[80%] text-sm font-medium">
               ¡Bienvenidos todos! 👋
            </div>
         </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-black">
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400"><Camera size={24} /></button>
          <input 
            type="text" 
            placeholder="Escribe algo cool..."
            className="flex-1 bg-[#111] border border-gray-800 rounded-2xl p-3 text-sm font-medium outline-none focus:border-purple-500"
          />
          <button className="p-3 bg-purple-600 rounded-xl"><Plus size={20} /></button>
        </div>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="space-y-8 p-6">
       <header className="flex items-center gap-4">
          <button onClick={() => setView('chat')} className="p-2 hover:bg-white/5 rounded-full"><ChevronLeft size={24} /></button>
          <h2 className="text-3xl font-black italic">⚙️ ADMIN</h2>
       </header>

       <div className="space-y-6">
          <section className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem] space-y-4">
             <h3 className="text-xs font-black uppercase text-purple-500 italic tracking-widest">Personalización</h3>
             <div className="grid grid-cols-2 gap-2">
                <button className="p-4 bg-gray-900 rounded-2xl text-[10px] font-black uppercase">Cambiar Portada</button>
                <button className="p-4 bg-gray-900 rounded-2xl text-[10px] font-black uppercase">Cambiar Perfil</button>
             </div>
             <input defaultValue={selectedClub.name} className="w-full bg-black border border-gray-800 p-4 rounded-xl text-sm font-bold" />
             <textarea defaultValue={selectedClub.description} className="w-full bg-black border border-gray-800 p-4 rounded-xl text-sm font-medium h-24" />
          </section>

          <section className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem] space-y-4">
             <h3 className="text-xs font-black uppercase text-purple-500 italic tracking-widest">Gestión de Miembros</h3>
             <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700" />
                      <span className="text-xs font-black italic">Usuario_Ejemplo</span>
                   </div>
                   <div className="flex gap-2">
                      <button className="p-1.5 bg-purple-600 rounded-lg"><UserCheck size={14} /></button>
                      <button className="p-1.5 bg-red-600 rounded-lg"><UserX size={14} /></button>
                   </div>
                </div>
             </div>
          </section>

          <section className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[2.5rem] space-y-4">
             <h3 className="text-xs font-black uppercase text-red-500 italic tracking-widest">Zona de Peligro</h3>
             <button className="w-full py-4 border border-red-500/30 text-red-500 rounded-2xl font-black uppercase text-xs hover:bg-red-500/10 transition-all flex items-center justify-center gap-2">
                <Trash2 size={16} /> Eliminar Club
             </button>
          </section>
       </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-black text-white p-4">
      <div className="max-w-xl mx-auto h-[90vh] overflow-y-auto no-scrollbar relative">
        <AnimatePresence mode="wait">
          {view === 'list' && <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{renderClubList()}</motion.div>}
          {view === 'create' && <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{renderCreateFlow()}</motion.div>}
          {view === 'chat' && <motion.div key="chat" className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{renderClubChat()}</motion.div>}
          {view === 'admin' && <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{renderAdminPanel()}</motion.div>}
        </AnimatePresence>
      </div>

      {/* Nav Placeholder for height */}
      <div className="h-20" />
      
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/5 px-2 py-4 flex items-center justify-around">
        <button onClick={() => router.push('/')} className="flex flex-col items-center gap-1 text-gray-500">
          <Home size={24} />
          <span className="text-[8px] font-black uppercase">Inicio</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-purple-500">
          <Users size={24} />
          <span className="text-[8px] font-black uppercase">Clubs</span>
        </button>
      </nav>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  );
}
