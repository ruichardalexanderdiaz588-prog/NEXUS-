

"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore, Message, Chat } from '@/hooks/use-app-store';
import { ArrowLeft, Send, MoreVertical, Lock, Eye, EyeOff, CheckCheck, Trash2, Pencil, Forward, MessageSquareWarning, Users, X, ShieldAlert, Check, UserX, CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { NEXUS_OFICIAL_UID } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDescriptionComponent, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { moderateText } from '@/ai/flows/text-moderation';


const LeaveChatDialog = ({ onLeave, onReinvite, chatStatus, otherMemberId }: { onLeave: () => void, onReinvite: () => void, chatStatus: Chat['status'], otherMemberId: string | undefined }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (chatStatus === 'inactive' && otherMemberId) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline"><CircleDashed className="mr-2"/> Reinvitar al chat</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Reenviar invitación?</DialogTitle>
            <DialogDescription>
              Esto enviará una nueva solicitud para que el usuario pueda volver a unirse a la conversación.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={onReinvite}>Sí, enviar invitación</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2" /> Salir del chat
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás segurx de que quieres salir del chat?</DialogTitle>
          <DialogDescription>
            No podrás enviar ni recibir más mensajes en esta conversación. Para volver a chatear, la otra persona deberá enviarte una nueva solicitud.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button variant="destructive" onClick={onLeave}>Sí, estoy segurx</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function ChatRoomPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const { 
        user, 
        userProfile: loggedInUserProfile,
        messages, 
        fetchMessages, 
        sendMessage,
        forwardMessage,
        editMessage,
        deleteMessage,
        leaveChat,
        reinviteToChat,
        markChatAsRead,
        isLoadingMessages,
        chats,
        appStatus,
        fetchUserProfile, // To get other user's profile
        addModerationLog,
    } = useAppStore();
    
    const [newMessage, setNewMessage] = useState("");
    const [otherMemberInfo, setOtherMemberInfo] = useState<any | null>(null);
    const chatId = Array.isArray(params.chatId) ? params.chatId[0] : params.chatId;
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isSending, setIsSending] = useState(false);
    
    // State for editing
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);

    // State for forwarding
    const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);

    // State for deleting
    const [deletingMessage, setDeletingMessage] = useState<Message | null>(null);

    // State for moderation warning
    const [showModerationWarning, setShowModerationWarning] = useState(false);
    const [moderationReason, setModerationReason] = useState("");
    const [messageToSend, setMessageToSend] = useState("");

    const chat = chats.find(c => c.id === chatId);

    useEffect(() => {
        const loadParticipantInfo = async () => {
            if (chat && user) {
                const otherMemberId = chat.members.find(p => p !== user.uid);
                if (otherMemberId) {
                    const profile = await fetchUserProfile(otherMemberId);
                    setOtherMemberInfo(profile);
                }
            }
        };
        loadParticipantInfo();
    }, [chat, user, fetchUserProfile]);


    const isChatWithNexusOficial = otherMemberInfo?.uid === NEXUS_OFICIAL_UID;
    const isMaintenanceMode = appStatus.isMaintenanceModeEnabled && user?.email !== 'alexander@gmail.com';
    const isChatInactive = chat?.status === 'inactive';
    const otherMemberId = chat?.members.find(p => p !== user?.uid);

    useEffect(() => {
        if (!chatId) {
            router.push('/chats');
            return;
        }
        const unsubscribe = fetchMessages(chatId);
        markChatAsRead(chatId); // Mark as read on entering
        return () => unsubscribe();
    }, [chatId, fetchMessages, markChatAsRead, router]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    
    useEffect(() => {
        if (editingMessage) {
            setNewMessage(editingMessage.text);
        } else {
            setNewMessage("");
        }
    }, [editingMessage]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (isMaintenanceMode) {
             toast({ variant: "destructive", title: "Modo Mantenimiento", description: "El chat está deshabilitado temporalmente." });
            return;
        }
        if (!text || !chatId || isChatWithNexusOficial || isChatInactive) return;
        
        setIsSending(true);
        try {
            const moderationResult = await moderateText({ text });

            if (!moderationResult.isSafe) {
                setMessageToSend(text);
                setModerationReason(moderationResult.reason || "El contenido puede ser sensible.");
                setShowModerationWarning(true);
                setIsSending(false); // Stop here until user confirms
                return;
            }
            
            if (editingMessage) {
                await editMessage(chatId, editingMessage.id, text);
                setEditingMessage(null);
            } else {
                await sendMessage(chatId, text);
            }
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    }
    
    const handleConfirmSend = async () => {
        setShowModerationWarning(false);
        setIsSending(true);
        try {
            await sendMessage(chatId, messageToSend);
            if(user && loggedInUserProfile) {
                await addModerationLog({
                    action: 'chat_message_warned',
                    userId: user.uid,
                    userNickname: loggedInUserProfile.nickname,
                    content: messageToSend,
                    reason: moderationReason
                });
            }
            setNewMessage(""); // Clear the input field
            setMessageToSend("");
        } catch (error) {
             console.error("Error sending message after warning:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleForwardMessage = async (targetChatId: string) => {
        if (!forwardingMessage) return;
        try {
            await forwardMessage(targetChatId, forwardingMessage);
            toast({ title: 'Mensaje reenviado', description: `Tu mensaje fue enviado.` });
            setForwardingMessage(null);
            router.push(`/chats/${targetChatId}`);
        } catch (error) {
            console.error("Error forwarding message:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo reenviar el mensaje.' });
        }
    };

    const handleDeleteMessage = async (deleteForEveryone: boolean) => {
        if (!deletingMessage) return;
        try {
            await deleteMessage(chatId, deletingMessage.id, deleteForEveryone);
            toast({ title: 'Mensaje eliminado' });
            setDeletingMessage(null);
        } catch (error) {
            console.error("Error deleting message:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar el mensaje.' });
        }
    };

    const handleLeaveChat = async () => {
        if (!chatId) return;
        try {
            await leaveChat(chatId);
            toast({ title: "Has salido del chat" });
            router.push('/chats');
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "No se pudo salir del chat." });
        }
    };

    const handleReinvite = async () => {
        if (!chatId || !otherMemberId) return;
        try {
            await reinviteToChat(chatId, otherMemberId);
            toast({ title: "Invitación Enviada", description: "El usuario será notificado para unirse de nuevo."});
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo enviar la invitación.' });
        }
    };

    if (isLoadingMessages || !chat || !otherMemberInfo) {
        return (
             <div className="flex flex-col h-svh bg-background">
                <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b-2 border-primary/30 bg-card p-4 box-shadow-glow-primary">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                     <Skeleton className="h-10 w-10 rounded-full" />
                </header>
                <div className="flex-1 p-4 space-y-4">
                    <Skeleton className="h-12 w-3/4 rounded-lg self-start" />
                    <Skeleton className="h-12 w-3/4 rounded-lg self-end" />
                </div>
            </div>
        )
    }
    
    const MessageStatusIcon = ({ status }: { status: Message['status'] }) => {
        switch (status) {
            case 'read':
                return <CheckCheck className="w-4 h-4 text-blue-400" />;
            case 'delivered':
                return <EyeOff className="w-4 h-4 text-muted-foreground" />;
            case 'sent':
            default:
                return <Eye className="w-4 h-4 text-muted-foreground" />;
        }
    };


    return (
        <div className="flex flex-col h-svh bg-gradient-to-br from-background via-card to-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center gap-4 border-b-2 border-primary/30 bg-card/80 backdrop-blur-md p-3 box-shadow-glow-primary">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <Avatar className="h-10 w-10 border-2 border-accent">
                    <AvatarImage src={otherMemberInfo?.profilePictureUrl} />
                    <AvatarFallback>{otherMemberInfo?.nickname[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <p className="font-bold">{otherMemberInfo?.nickname}</p>
                    {loggedInUserProfile?.showActivityStatus && otherMemberInfo?.showActivityStatus && (
                        <div className="flex items-center gap-1.5">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                            <p className="text-xs text-muted-foreground">En línea</p>
                        </div>
                    )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem><Users className="mr-2"/>Crear grupo</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <LeaveChatDialog onLeave={handleLeaveChat} onReinvite={() => {}} chatStatus={chat.status} otherMemberId={otherMemberId} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                 {isChatWithNexusOficial && (
                    <Alert variant="default" className="border-accent bg-card/50">
                        <Lock className="h-4 w-4 text-accent" />
                        <AlertTitle className="text-accent">Chat Oficial</AlertTitle>
                        <AlertDescription>
                            Bienvenidx al chat privado de NEXUS OFICIAL. Este es un canal de comunicación unidireccional.
                        </AlertDescription>
                    </Alert>
                )}
                {isChatInactive && (
                     <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-900/30 text-yellow-300">
                        <UserX className="h-4 w-4 text-yellow-400" />
                        <AlertTitle className="text-yellow-400">Chat Inactivo</AlertTitle>
                        <AlertDescription>
                           Un usuario ha salido del chat.
                           {chat.leftBy !== user?.uid && otherMemberId && (
                                <LeaveChatDialog onLeave={() => {}} onReinvite={handleReinvite} chatStatus={chat.status} otherMemberId={otherMemberId} />
                           )}
                        </AlertDescription>
                    </Alert>
                )}
                {messages.map((msg, index) => {
                    const isSender = msg.senderId === user?.uid;
                    const showDate = msg.createdAt && (index === 0 || !isSameDay(messages[index-1]?.createdAt, msg.createdAt));
                    const participant = isSender ? null : (chat.memberInfo ? chat.memberInfo[msg.senderId] : null);
                    
                    if (msg.deletedFor?.includes(user!.uid)) {
                        return null; // Don't render message if deleted for current user
                    }
                    const isDeletedForAll = msg.deletedFor?.includes('all');


                    return (
                        <div key={msg.id}>
                            {showDate && msg.createdAt && (
                                <div className="text-center text-xs text-muted-foreground my-4">
                                    {format(msg.createdAt, "PPP", { locale: es })}
                                </div>
                            )}
                            <div className={cn("flex items-end gap-2 group", isSender ? "justify-end" : "justify-start")}>
                                {!isSender && participant && (
                                    <Avatar className="h-8 w-8 self-end mb-1">
                                        <AvatarImage src={participant.profilePictureUrl} />
                                        <AvatarFallback>{participant.nickname ? participant.nickname[0] : '?'}</AvatarFallback>
                                    </Avatar>
                                )}
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <div className={cn(
                                            "max-w-xs md:max-w-md p-3 rounded-2xl cursor-pointer transition-transform group-hover:scale-105",
                                            isSender 
                                                ? "bg-primary text-primary-foreground rounded-br-none" 
                                                : "bg-card border border-border rounded-bl-none",
                                            isDeletedForAll && "bg-muted text-muted-foreground italic border-dashed"
                                        )}>
                                            {msg.isForwarded && <p className="text-xs opacity-70 mb-1 flex items-center gap-1"><Forward className="w-3 h-3"/> Reenviado</p>}
                                            <p className="whitespace-pre-wrap">{isDeletedForAll ? "Este mensaje fue eliminado." : msg.text}</p>
                                            <div className="flex justify-end items-center gap-1.5 text-xs mt-1.5 opacity-70">
                                                {msg.isEdited && <span>Editado</span>}
                                                {msg.createdAt && <span>{format(msg.createdAt, "p", { locale: es })}</span>}
                                                {isSender && <MessageStatusIcon status={msg.status} />}
                                            </div>
                                        </div>
                                    </PopoverTrigger>
                                     {!isDeletedForAll && (
                                        <PopoverContent className="w-auto p-1 bg-card/80 backdrop-blur-md">
                                            <div className="flex flex-col gap-1">
                                                <Button variant="ghost" size="sm" className="justify-start" onClick={() => setForwardingMessage(msg)}><Forward className="mr-2" /> Reenviar</Button>
                                                {isSender && <Button variant="ghost" size="sm" className="justify-start" onClick={() => setEditingMessage(msg)}><Pencil className="mr-2" /> Editar</Button>}
                                                {isSender && <Button variant="ghost" size="sm" className="justify-start text-destructive" onClick={() => setDeletingMessage(msg)}><Trash2 className="mr-2" /> Eliminar</Button>}
                                                <Button variant="ghost" size="sm" className="justify-start text-destructive"><MessageSquareWarning className="mr-2" /> Reportar</Button>
                                            </div>
                                        </PopoverContent>
                                     )}
                                </Popover>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Input Form */}
             <div className="sticky bottom-0 bg-card/80 backdrop-blur-sm border-t border-border/30 p-3 flex items-center gap-3">
                {isChatWithNexusOficial || isMaintenanceMode || isChatInactive ? (
                    <div className="w-full text-center text-sm text-muted-foreground bg-muted p-3 rounded-lg flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        {isMaintenanceMode ? "El chat está en modo mantenimiento." : isChatInactive ? "Este chat está inactivo." : "No puedes enviarle mensajes a Nexus oficial, pero él sí a ti."}
                    </div>
                ) : (
                     <form onSubmit={handleSendMessage} className="w-full flex items-center gap-3">
                        {editingMessage && (
                            <Button variant="ghost" size="icon" onClick={() => setEditingMessage(null)}>
                                <X className="text-destructive"/>
                            </Button>
                        )}
                        <Input 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={editingMessage ? 'Editando mensaje...' : 'Escribe un mensaje...'}
                            className="flex-1 text-base bg-muted/50 border-border/50 rounded-full px-4"
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending}>
                            {isSending ? "..." : (editingMessage ? <Check className="w-5 h-5"/> : <Send className="w-5 h-5" />)}
                        </Button>
                    </form>
                )}
            </div>
            
            {/* Dialogs */}
            <AlertDialog open={showModerationWarning} onOpenChange={setShowModerationWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex justify-center">
                            <ShieldAlert className="w-12 h-12 text-destructive"/>
                        </div>
                        <DialogTitle className="text-center">¿Estás segurx de enviar este mensaje?</DialogTitle>
                        <AlertDialogDescriptionComponent className="text-center">
                            Este mensaje podría ser sensible. Razón: <strong>{moderationReason}</strong>
                        </AlertDialogDescriptionComponent>
                    </AlertDialogHeader>
                    <AlertDialogAction onClick={handleConfirmSend}>Sí, enviar de todas formas</AlertDialogAction>
                    <AlertDialogCancel onClick={() => setShowModerationWarning(false)}>Cancelar</AlertDialogCancel>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!forwardingMessage} onOpenChange={(open) => !open && setForwardingMessage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reenviar mensaje a...</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-80 overflow-y-auto space-y-2">
                        {chats.map(c => {
                            const otherMember = c.members.find(p => p !== user?.uid);
                            const info = otherMember ? c.memberInfo[otherMember] : null;
                            if (!info) return null;

                            return (
                                <div key={c.id} onClick={() => handleForwardMessage(c.id)} className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer">
                                    <Avatar>
                                        <AvatarImage src={info.profilePictureUrl} />
                                        <AvatarFallback>{info.nickname[0]}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-bold">{info.nickname}</p>
                                </div>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={!!deletingMessage} onOpenChange={(open) => !open && setDeletingMessage(null)}>
                <DialogContent>
                     <DialogHeader>
                        <DialogTitle>¿Cómo quieres eliminar el mensaje?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Button variant="outline" className="w-full justify-between h-20" onClick={() => handleDeleteMessage(false)}>
                            <div className="text-left">
                                <p className="font-bold">Eliminar para mí</p>
                                <p className="text-xs text-muted-foreground">El mensaje desaparecerá solo para ti.</p>
                            </div>
                            <UserX />
                        </Button>
                        <Button variant="destructive" className="w-full justify-between h-20" onClick={() => handleDeleteMessage(true)}>
                            <div className="text-left">
                                <p className="font-bold">Eliminar para todos</p>
                                <p className="text-xs">El mensaje desaparecerá para todos en el chat.</p>
                            </div>
                            <Trash2 />
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}


function isSameDay(d1: Date | undefined, d2: Date | undefined) {
  if (!d1 || !d2) return false;
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}
