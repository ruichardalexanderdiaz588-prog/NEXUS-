
"use client";

import type { Story } from '@/hooks/use-app-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface StoryViewListProps {
    story: Story;
}

// Mock data - in a real app, you'd fetch this based on UIDs in story.viewers
const MOCK_USERS = [
    { uid: '1', nickname: 'CosmicTraveler', username: 'cosmic_traveler', profilePictureUrl: 'https://placehold.co/100x100.png' },
    { uid: '2', nickname: 'StarlightDreamer', username: 'starlight', profilePictureUrl: 'https://placehold.co/100x100.png' },
    { uid: '3', nickname: 'GalacticSoul', username: 'g_soul', profilePictureUrl: 'https://placehold.co/100x100.png' },
];

export function StoryViewList({ story }: StoryViewListProps) {
    // In a real implementation, you would fetch user profiles based on story.viewers UIDs
    // For this prototype, we'll use mock data.
    const viewerProfiles = MOCK_USERS.slice(0, story.viewCount);

    return (
        <>
            <SheetHeader className="text-center p-4 border-b">
                <SheetTitle>Visto por</SheetTitle>
                <SheetDescription>{story.viewCount || 0} almas han visto tu story.</SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {viewerProfiles.length > 0 ? (
                        viewerProfiles.map((viewer) => (
                            <div key={viewer.uid} className="flex items-center justify-between gap-4 p-2 hover:bg-muted/50 rounded-lg">
                                 <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-accent">
                                        <AvatarImage src={viewer.profilePictureUrl} data-ai-hint="avatar profile" />
                                        <AvatarFallback>{viewer.nickname[0]}</AvatarFallback>
                                    </Avatar>
                                     <div>
                                        <p className="font-bold text-primary">{viewer.nickname}</p>
                                        <p className="text-muted-foreground text-sm">@{viewer.username}</p>
                                    </div>
                                 </div>
                                 <p className="text-xs text-muted-foreground">
                                     {/* This is a mock timestamp */}
                                     Visto {formatDistanceToNow(new Date(Date.now() - Math.random() * 1000 * 60 * 60), { locale: es, addSuffix: true })}
                                 </p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-4">
                            <EyeOff className="w-16 h-16" />
                            <p className="font-semibold">Todavía nadie ha visto tu story</p>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </>
    );
}
