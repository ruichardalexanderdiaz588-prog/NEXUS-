
"use client";

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, HelpCircle, UserX } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function PlayersPage() {
    const router = useRouter();
    const params = useParams();
    const type = params.type as 'registered' | 'eliminated';
    
    const title = type === 'registered' ? 'Jugadores Registrados' : 'Jugadores Eliminados';
    const PlayerIcon = type === 'registered' ? HelpCircle : UserX;
    const iconColor = type === 'registered' ? 'text-primary/50' : 'text-destructive/50';

    const PlayerAvatarPlaceholder = () => (
        <div className="flex-shrink-0 flex flex-col items-center">
            <Avatar className="w-20 h-20 border-2 border-border/30 bg-muted/20">
                <div className="flex items-center justify-center h-full w-full">
                    <PlayerIcon className={cn("w-10 h-10", iconColor)} />
                </div>
            </Avatar>
            <p className="text-center text-xs mt-1 text-muted-foreground">???</p>
        </div>
    );
    

    return (
        <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
            <header className="sticky top-0 z-20 bg-card p-4 border-b-2 border-primary/30 box-shadow-glow-primary flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold text-primary text-glow-primary flex items-center gap-2">
                    <User /> {title}
                </h1>
            </header>

            <main className="flex-1 p-4">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 102 }).map((_, i) => (
                        <PlayerAvatarPlaceholder key={i} />
                    ))}
                </div>
            </main>
        </div>
    );
}
