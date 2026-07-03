
"use client";

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, Eye, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import type { Story, UserProfile } from '@/hooks/use-app-store';
import { useAppStore } from '@/hooks/use-app-store';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { StoryViewList } from './story-view-list';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface StoryViewerProps {
    isOpen: boolean;
    onClose: () => void;
    stories: Story[];
    userProfile: UserProfile | null;
}

export function StoryViewer({ isOpen, onClose, stories, userProfile }: StoryViewerProps) {
    const { user, toggleStoryLike } = useAppStore();
    const { toast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentStory = useMemo(() => stories[currentIndex], [stories, currentIndex]);
    
    useEffect(() => {
        if (!isOpen) return;
        
        let intervalId: NodeJS.Timeout;

        const startTimer = () => {
            intervalId = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(intervalId);
                        if (currentIndex < stories.length - 1) {
                            setCurrentIndex(i => i + 1);
                        } else {
                            onClose();
                        }
                        return 0;
                    }
                    return prev + (100 / 5); // 5 second duration per story
                });
            }, 1000);
        }
        
        startTimer();

        return () => clearInterval(intervalId);
    }, [isOpen, currentIndex, stories.length, onClose]);
    
    useEffect(() => {
        setProgress(0); // Reset progress when story changes
    }, [currentIndex]);

    if (!isOpen || !userProfile || !currentStory) return null;

    const handleNavigation = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, currentTarget } = e;
        const { left, width } = currentTarget.getBoundingClientRect();
        const clickPosition = clientX - left;

        if (clickPosition < width * 0.3) { // Go previous
             if (currentIndex > 0) {
                setCurrentIndex(i => i - 1);
            }
        } else { // Go next
            if (currentIndex < stories.length - 1) {
                setCurrentIndex(i => i + 1);
            } else {
                onClose();
            }
        }
    }
    
    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (user?.uid === currentStory.authorId) {
             toast({
                variant: 'destructive',
                title: "Acción no permitida",
                description: "No puedes dar like a tu propia story.",
            });
            return;
        }
        toggleStoryLike(currentStory);
    }
    
    const likedByMe = currentStory.likedBy?.includes(user?.uid || '');

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
                    onClick={onClose}
                >
                    <div className="relative w-full max-w-[400px] aspect-[9/16] bg-card rounded-xl overflow-hidden shadow-2xl shadow-primary/30" onClick={(e) => e.stopPropagation()}>
                        {/* Story Content Area */}
                        <div className="absolute inset-0" onClick={handleNavigation}>
                            {currentStory.type === 'text' && (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-accent flex items-center justify-center p-8">
                                    <p className="text-white text-3xl font-bold text-center drop-shadow-lg">{currentStory.content}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* UI Overlay */}
                        <div className="absolute inset-0 flex flex-col p-4 pointer-events-none">
                            {/* Progress Bars */}
                             <div className="flex gap-1 w-full">
                                {stories.map((_, index) => (
                                    <div key={index} className="flex-1 bg-white/30 rounded-full h-1 overflow-hidden">
                                        <div 
                                            className="bg-white h-full rounded-full transition-all duration-200" 
                                            style={{ width: `${index < currentIndex ? 100 : (index === currentIndex ? progress : 0)}%` }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Header */}
                            <div className="flex items-center gap-3 mt-3">
                                <Avatar className="w-10 h-10 border-2 border-white">
                                    <AvatarImage src={userProfile.profilePictureUrl} />
                                    <AvatarFallback>{userProfile.nickname.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-white text-shadow">{userProfile.nickname}</p>
                                    <p className="text-xs text-white/80 text-shadow">{formatDistanceToNow(currentStory.createdAt, { locale: es, addSuffix: true })}</p>
                                </div>
                                 <Button variant="ghost" size="icon" className="ml-auto pointer-events-auto" onClick={onClose}>
                                    <X className="w-6 h-6 text-white"/>
                                </Button>
                            </div>
                            
                             <div className="mt-auto flex justify-between items-center w-full pointer-events-auto">
                                <div className="w-16"></div> {/* Spacer */}

                                {/* Viewer Info */}
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <div className="flex flex-col items-center gap-1 cursor-pointer group">
                                            <Eye className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                            <span className="text-white font-semibold text-sm">{currentStory.viewCount || 0}</span>
                                        </div>
                                    </SheetTrigger>
                                    <SheetContent side="bottom" className="h-[60%] flex flex-col p-0 bg-card rounded-t-2xl">
                                        <StoryViewList story={currentStory} />
                                    </SheetContent>
                                </Sheet>
                                
                                {/* Like button */}
                                <div className="flex flex-col items-center w-16">
                                     <Button variant="ghost" size="icon" onClick={handleLike} className="h-auto p-0 hover:bg-transparent">
                                         <Heart className={cn("w-7 h-7 text-white transition-all", likedByMe ? 'fill-red-500 text-red-500' : 'hover:text-red-400')} />
                                     </Button>
                                     <span className="text-white font-semibold text-sm">{currentStory.likes || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
