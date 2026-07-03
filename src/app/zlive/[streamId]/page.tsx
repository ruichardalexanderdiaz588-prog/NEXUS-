
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppStore, ZLiveStream, Author, Message } from "@/hooks/use-app-store";
import { X, Eye, Heart, Gift, Share2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const FloatingHeart = ({ id, onEnd }: { id: number, onEnd: (id: number) => void }) => {
    const animationDuration = Math.random() * 2 + 3; // 3-5 seconds
    const horizontalMovement = (Math.random() - 0.5) * 100;
  
    useEffect(() => {
      const timer = setTimeout(() => onEnd(id), animationDuration * 1000);
      return () => clearTimeout(timer);
    }, [id, onEnd, animationDuration]);
  
    return (
      <motion.div
        className="absolute bottom-20 right-10"
        initial={{ y: 0, x: 0, opacity: 1 }}
        animate={{
          y: -400,
          x: horizontalMovement,
          opacity: 0,
          scale: [1, 1.5, 1],
        }}
        transition={{ duration: animationDuration, ease: "easeOut" }}
      >
        <Heart className="w-8 h-8 text-red-500 fill-current" />
      </motion.div>
    );
};

export default function LiveStreamPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { 
        user,
        zLiveStreams,
        fetchZLiveStreamById,
        endZLive,
    } = useAppStore();

    const streamId = params.streamId as string;
    const [stream, setStream] = useState<ZLiveStream | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hearts, setHearts] = useState<number[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isStreamer = stream?.author.uid === user?.uid;
    const [comment, setComment] = useState("");

    useEffect(() => {
        if (!streamId) {
            router.push('/home');
            return;
        }
        
        const loadStream = async () => {
            setIsLoading(true);
            const streamData = await fetchZLiveStreamById(streamId);
            if (!streamData) {
                toast({ variant: 'destructive', title: 'Stream no encontrado', description: 'Esta transmisión ya no está disponible.'});
                router.push('/home');
            } else {
                setStream(streamData);
            }
            setIsLoading(false);
        };
        
        loadStream();
    }, [streamId, fetchZLiveStreamById, router, toast]);

    // Handle camera for both streamer and viewer (to show self-view if needed)
     useEffect(() => {
        const getCameraPermission = async () => {
        if (videoRef.current) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                videoRef.current.srcObject = stream;
            } catch (error) {
                console.error("Error accessing camera:", error);
                toast({
                    variant: "destructive",
                    title: "Acceso a la Cámara Denegado",
                });
            }
        }
        };
        getCameraPermission();
    }, [toast]);

    const handleLeave = async () => {
        if (isStreamer) {
            await endZLive(streamId);
        }
        router.push('/home');
    }
    
    const handleTapLike = () => {
        setHearts(prev => [...prev, Date.now()]);
    }

    const removeHeart = (id: number) => {
        setHearts(prev => prev.filter(heartId => heartId !== id));
    };

    if (isLoading || !stream) {
        return <div className="w-full h-svh bg-black flex items-center justify-center"><Skeleton className="w-full h-full"/></div>
    }
    
    return (
        <div className="w-full h-svh bg-black text-white flex flex-col" onClick={handleTapLike}>
            {/* Video Background */}
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" autoPlay muted playsInline />

            {/* UI Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-b from-black/50 via-transparent to-black/70">
                 {/* Header */}
                <header className="flex items-start justify-between">
                    <div className="flex items-center gap-3 p-2 bg-black/30 rounded-full">
                        <Avatar className="w-10 h-10 border-2 border-primary">
                            <AvatarImage src={stream.author.profilePictureUrl} />
                            <AvatarFallback>{stream.author.nickname[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-bold">{stream.author.nickname}</p>
                            <p className="text-xs">{stream.author.followers?.toLocaleString() || 0} seguidores</p>
                        </div>
                        {!isStreamer && (
                             <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-full ml-3">Seguir</Button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                         <div className="flex items-center gap-2 p-2 bg-black/30 rounded-full text-sm">
                            <Eye className="w-4 h-4" />
                            <span>{stream.viewerCount.toLocaleString()}</span>
                         </div>
                        <Button variant="ghost" size="icon" className="bg-black/30 rounded-full" onClick={handleLeave}>
                            <X className="w-6 h-6"/>
                        </Button>
                    </div>
                </header>

                 {/* Floating Hearts */}
                <AnimatePresence>
                    {hearts.map(id => <FloatingHeart key={id} id={id} onEnd={removeHeart} />)}
                </AnimatePresence>

                 {/* Footer */}
                <footer className="w-full">
                     {/* Comments - Placeholder */}
                    <div className="w-full h-48 overflow-y-auto mb-3 space-y-2 no-scrollbar text-shadow">
                        <div className="flex items-center gap-2">
                             <p className="font-bold text-accent">@someuser</p>
                             <p>¡Qué genial tu live!</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <p className="font-bold text-primary">@anotherfan</p>
                             <p>Saludos desde el universo Z! ✨</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="flex-1 flex items-center bg-black/40 rounded-full">
                            <Input placeholder="Escribe algo..." className="bg-transparent border-0 text-white placeholder:text-white/70" />
                            <Button variant="ghost" size="icon" className="rounded-full"><Send /></Button>
                         </div>
                        <Button variant="ghost" size="icon" className="bg-black/40 rounded-full"><Gift /></Button>
                        <Button variant="ghost" size="icon" className="bg-black/40 rounded-full"><Share2 /></Button>
                        <div className="flex items-center gap-1 bg-black/40 rounded-full px-3 py-2">
                             <Heart className="w-5 h-5 text-red-500 fill-current"/>
                             <span className="font-bold">{stream.likes.toLocaleString()}</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

const LiveStreamSkeleton = () => (
    <div className="w-full h-svh bg-black flex flex-col justify-between p-4 animate-pulse">
        <header className="flex justify-between items-start">
            <div className="flex items-center gap-3 p-2 bg-white/10 rounded-full">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="w-20 h-10 rounded-full" />
        </header>
        <footer>
            <div className="w-full h-12 bg-white/10 rounded-full"/>
        </footer>
    </div>
);
