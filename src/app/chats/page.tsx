
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, LayoutGrid, BellRing, Star, Users, Headset, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore, Chat, UserProfile } from "@/hooks/use-app-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { es } from 'date-fns/locale';

const ChatListItem = ({ chat }: { chat: Chat }) => {
    const { user } = useAppStore();
    const router = useRouter();

    if (!user) return null;

    const otherMemberId = chat.members.find(p => p !== user.uid);
    if (!otherMemberId) return null;

    const memberInfo = chat.memberInfo[otherMemberId!];
    const unreadCount = chat.unreadCount ? chat.unreadCount[user.uid] : 0;


    return (
        <div
            className="flex items-center gap-4 p-3 hover:bg-card/80 rounded-lg cursor-pointer transition-colors"
            onClick={() => router.push(`/chats/${chat.id}`)}
        >
            <Avatar className="h-14 w-14 border-2 border-accent">
                <AvatarImage src={memberInfo?.profilePictureUrl} />
                <AvatarFallback>{memberInfo?.nickname?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-bold truncate">{memberInfo?.nickname}</p>
                    <div className="flex items-center gap-2">
                         {unreadCount > 0 && (
                            <div className="w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center">
                                {unreadCount}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {chat.lastMessageTimestamp ? formatDistanceToNow(chat.lastMessageTimestamp, { locale: es, addSuffix: true }) : ''}
                        </p>
                    </div>
                </div>
                <p className={cn("text-muted-foreground text-sm truncate", unreadCount > 0 && "font-bold text-foreground")}>
                    {chat.lastMessage}
                </p>
            </div>
        </div>
    );
};

const ChatSkeleton = () => (
    <div className="flex items-center gap-4 p-3">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="flex-1 space-y-2">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="h-4 w-2/3" />
        </div>
    </div>
);


export default function ChatsPage() {
  const { chats, fetchChats, isLoadingChats } = useAppStore();
  
  useEffect(() => {
    const unsubscribe = fetchChats();
    return () => unsubscribe();
  }, [fetchChats]);

  const renderContent = () => {
    if (isLoadingChats) {
        return (
            <div className="space-y-4">
                <ChatSkeleton />
                <ChatSkeleton />
                <ChatSkeleton />
            </div>
        )
    }

    if (chats.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-10">
                <div className="bg-card/80 border-2 border-dashed border-primary/40 rounded-2xl p-10 flex flex-col items-center gap-5 max-w-md mx-auto">
                    <Headset className="w-24 h-24 text-primary text-glow-primary bounce-scale" />
                    <h2 className="text-2xl font-bold text-foreground/90">¡Inicia una nueva conexión!</h2>
                    <p className="text-muted-foreground">Usa la sección "Descubre" para encontrar almas libres y enviarles una solicitud de chat.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="space-y-2">
            {chats.map(chat => (
                <ChatListItem key={chat.id} chat={chat} />
            ))}
        </div>
    )
  }

  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b-2 border-primary/30 bg-card p-4 box-shadow-glow-primary">
        <h1 className="text-xl font-bold text-primary text-glow-primary flex items-center gap-2">
          <MessageSquare /> Chats Z
        </h1>
        <Button variant="ghost" size="icon">
            <Search />
        </Button>
      </header>
      
      <main className="flex-1 p-4">
        {renderContent()}
      </main>

    </div>
  );
}
