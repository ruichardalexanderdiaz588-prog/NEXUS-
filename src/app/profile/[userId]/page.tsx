

'use client';

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Settings, User, BadgeCheck, Grid3x3, Tag, Heart, Edit, MoreHorizontal, ArrowLeft, Smile, MapPin, Quote, Pencil, Wifi, Mic, Plus, CloudUpload, Coffee, Star, Copy, Eye, UserPlus, MessageCircle, Send, Bell, Cake, Globe, Trophy, X, Lock, Unlock, AlertTriangle, Smartphone, ShoppingCart, Calendar as CalendarIcon, Coins, Check, Power, Share2, Link as LinkIcon, ChevronDown, UserCog, ShieldAlert, Ban, UserX, Repeat, Lock as LockIcon, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore, Story, UserProfile, Post, WallMessage, ModerationLog } from "@/hooks/use-app-store";
import PostCard from "@/components/shared/post-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { NexusLogo, VerifiedNexusCheck, NexusCoinIcon } from "@/components/icons";
import { SetStatusDialog, Status, Vibe, vibes } from "@/components/profile/set-status-dialog";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StoryViewer } from "@/components/story/story-viewer";
import { Textarea } from "@/components/ui/textarea";
import { format, formatDistanceToNow, differenceInYears, startOfMonth, getDaysInMonth, isToday, isPast, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { auth } from "@/lib/firebase";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { NEXUS_OFICIAL_UID } from "@/lib/constants";

function MaintenanceModeDialog() {
    const { toast } = useToast();
    const { appStatus, toggleMaintenanceMode } = useAppStore();
    const [isUpdating, setIsUpdating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const isEnabled = appStatus.isMaintenanceModeEnabled;

    const handleToggle = async () => {
        setIsUpdating(true);
        try {
            await toggleMaintenanceMode();
            toast({
                title: `Modo Mantenimiento ${isEnabled ? 'Desactivado' : 'Activado'}`,
                description: `El estado de la aplicación ha sido actualizado.`,
            });
            setIsOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo cambiar el modo de mantenimiento." });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(isEnabled && 'text-destructive')}>
                    <Power className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Modo de Mantenimiento</DialogTitle>
                    <AlertDialogDescription>
                        {isEnabled
                            ? "Actualmente la aplicación está deshabilitada para todos los usuarios. ¿Quieres volver a habilitarla?"
                            : "¿Estás seguro de que quieres deshabilitar la aplicación para todos los usuarios? Tu cuenta seguirá funcionando."
                        }
                    </AlertDialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleToggle} disabled={isUpdating} variant={isEnabled ? 'default' : 'destructive'}>
                        {isUpdating ? 'Actualizando...' : (isEnabled ? 'Sí, habilitar la app' : 'Sí, deshabilitar la app')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function GlobalAnnouncementDialog() {
  const { toast } = useToast();
  const { sendGlobalSystemNotification } = useAppStore();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Mensaje vacío",
        description: "No puedes enviar un anuncio sin contenido.",
      });
      return;
    }

    setIsSending(true);
    try {
      await sendGlobalSystemNotification(message);
      toast({
        title: "🚀 Anuncio Enviado",
        description: "El anuncio global ha sido guardado y es visible para todos.",
      });
      setMessage("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error sending global notification:", error);
      toast({
        variant: "destructive",
        title: "Error de Envío",
        description: "No se pudo enviar el anuncio.",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Anuncio Global</DialogTitle>
          <DialogDescription>
            Este mensaje aparecerá en la pestaña "Sistema" de todos los usuarios.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escribe tu anuncio aquí..."
          className="min-h-[150px]"
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSend} disabled={isSending} className="bg-gradient-to-r from-primary to-accent">
            {isSending ? "Enviando..." : <>Enviar a todo el universo</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GlobalEventDialog() {
    const { toast } = useToast();
    const { sendGlobalEvent } = useAppStore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [countdownDate, setCountdownDate] = useState<Date | undefined>();
    const [prize, setPrize] = useState(0);
    const [isSending, setIsSending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSend = async () => {
        if (!title.trim() || !description.trim() || !countdownDate) {
            toast({ variant: "destructive", title: "Campos Incompletos", description: "Por favor, completa todos los campos del evento." });
            return;
        }
        setIsSending(true);
        try {
            await sendGlobalEvent({ title, description, countdownDate, prize });
            toast({ title: "🎉 ¡Evento Enviado!", description: "El nuevo evento global es visible para todos." });
            setTitle("");
            setDescription("");
            setCountdownDate(undefined);
            setPrize(0);
            setIsOpen(false);
        } catch (error) {
            console.error("Error sending global event:", error);
            toast({ variant: "destructive", title: "Error de Envío", description: "No se pudo crear el evento." });
        } finally {
            setIsSending(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon">
                    <Trophy className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Evento Global</DialogTitle>
                    <DialogDescription>Este evento aparecerá en la pestaña "Eventos" de todos los usuarios.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                     <Input
                        placeholder="Título del Evento"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-muted/50 p-2 rounded-md"
                    />
                    <Textarea
                        placeholder="Descripción del evento..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px]"
                    />
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !countdownDate && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {countdownDate ? format(countdownDate, "PPP", { locale: es }) : <span>+ Agrega cuenta regresiva</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={countdownDate} onSelect={setCountdownDate} disabled={(date) => date < new Date()} initialFocus />
                        </PopoverContent>
                    </Popover>
                    <div className="space-y-2">
                        <Label htmlFor="prize" className="text-sm font-medium text-muted-foreground">Jefe, agrega el premio Nexuscoins total que se le dará al único ganador</Label>
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                             <NexusCoinIcon className="w-8 h-8"/>
                            <Input
                                id="prize"
                                type="number"
                                value={prize || ''}
                                onChange={(e) => setPrize(parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="flex-1 bg-transparent border-0 text-amber-400 font-bold text-lg"
                            />
                            <div className="flex items-center gap-1 font-bold text-amber-400">
                                <span>{prize.toLocaleString()}</span>
                                <span>Coins</span>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSend} disabled={isSending}>
                        {isSending ? "Enviando..." : "Enviar Evento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const calculateAge = (dob: Date | undefined): number | null => {
    if (!dob) return null;
    return differenceInYears(new Date(), dob);
};

function ChatRequestDialog({ recipientProfile, onSend }: { recipientProfile: UserProfile, onSend: (message: string) => void }) {
    const { userProfile: loggedInUserProfile } = useAppStore();
    const { toast } = useToast();
    
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showAgeWarning, setShowAgeWarning] = useState(false);

    const requesterAge = calculateAge(loggedInUserProfile?.dob);
    const recipientAge = calculateAge(recipientProfile.dob);

    const isRequesterMinor = requesterAge !== null && requesterAge < 18;
    const isRecipientMinor = recipientAge !== null && recipientAge < 18;
    const isAgeGap = (isRequesterMinor && !isRecipientMinor) || (!isRequesterMinor && isRecipientMinor);

    const handleSendAttempt = () => {
        if (!message.trim()) return;

        if (isAgeGap) {
            setShowAgeWarning(true);
        } else {
            handleConfirmSend();
        }
    };
    
    const handleConfirmSend = async () => {
        setIsSending(true);
        setShowAgeWarning(false);
        try {
            await onSend(message);
            setIsOpen(false);
            toast({ title: "Solicitud enviada", description: "Se notificará al usuario de tu solicitud." });
        } catch (error: any) {
             toast({ variant: "destructive", title: "Error", description: error.message || "No se pudo enviar la solicitud." });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Send className="w-4 h-4 mr-2"/> Enviar Solicitud de Chat
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar solicitud a {recipientProfile.nickname}</DialogTitle>
                        <DialogDescription>
                            Escribe un primer mensaje para iniciar la conversación. Si acepta, se creará un chat privado.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={`Saluda a ${recipientProfile.nickname}...`}
                        maxLength={8000}
                        className="min-h-[120px]"
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSendAttempt} disabled={isSending || !message.trim()}>
                            {isSending ? "Enviando..." : "Enviar Solicitud"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showAgeWarning} onOpenChange={setShowAgeWarning}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Advertencia de Edad</AlertDialogTitle>
                        <AlertDialogDescription>
                            {isRequesterMinor
                                ? `Estás a punto de contactar a un adulto (${recipientProfile.nickname}). ¿Estás segurx de que quieres continuar?`
                                : `Estás a punto de contactar a un menor de edad (${recipientProfile.nickname}). ¿Estás segurx de que quieres continuar?`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSend} disabled={isSending}>
                            {isSending ? 'Enviando...' : 'Sí, continuar'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

const DailyRewardDialog = ({ userProfile, onRewardClaimed }: { userProfile: UserProfile, onRewardClaimed: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();
    const { claimDailyReward, updateUserProfile } = useAppStore();

    const [isClaiming, setIsClaiming] = useState(false);
    const [showRules, setShowRules] = useState(!userProfile.hasSeenRewardRules);

    const handleClaim = async () => {
        setIsClaiming(true);
        try {
            await claimDailyReward();
            toast({
                title: "¡Recompensa Obtenida!",
                description: "Has conseguido 8 Nexuscoins. ¡Regresa mañana para conseguir más!",
            });
            onRewardClaimed();
            setIsOpen(false);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'No se pudo reclamar',
                description: error.message || "Ya has reclamado tu recompensa de hoy.",
            });
        } finally {
            setIsClaiming(false);
        }
    };

    const handleAcceptRules = async () => {
        await updateUserProfile({ hasSeenRewardRules: true });
        setShowRules(false);
    };

    const today = new Date();
    const monthStart = startOfMonth(today);
    const daysInMonth = getDaysInMonth(today);
    const firstDayOfMonth = monthStart.getDay(); // 0 for Sunday, 1 for Monday etc.

    const canClaimToday = !userProfile.lastRewardClaim || !isSameDay(userProfile.lastRewardClaim, today);

    if (showRules) {
        return (
            <AlertDialog open={showRules} onOpenChange={setShowRules}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl text-amber-400">¡Bienvenidx a las Recompensas Diarias!</AlertDialogTitle>
                        <AlertDialogDescription>
                            <p className="py-2">Aquí tienes algunas reglas importantes sobre los Nexuscoins:</p>
                            <ul className="list-disc list-inside space-y-2 text-left">
                                <li>Los Nexuscoins son una moneda virtual exclusiva de la app Nexus.</li>
                                <li>**No tienen valor monetario real** y no pueden ser canjeados por dinero.</li>
                                <li>Puedes usarlos en la tienda para comprar artículos virtuales como marcos de perfil.</li>
                                <li>En el futuro, podrás regalarlos a otros usuarios dentro de la app.</li>
                                <li>¡Diviértete coleccionándolos y personalizando tu experiencia!</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={handleAcceptRules} className="w-full bg-green-600 hover:bg-green-700">He leído y acepto</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="text-amber-400 hover:text-amber-500 hover:bg-amber-400/10">
                    <NexusCoinIcon className="w-6 h-6"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gradient-to-br from-yellow-900/50 via-background to-background border-amber-500/50">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center font-bold text-amber-400" style={{textShadow: '0 0 10px #fbbd23'}}>{format(today, "MMMM yyyy", { locale: es })}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                    {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayDate = new Date(today.getFullYear(), today.getMonth(), i + 1);
                        const isTodayDate = isToday(dayDate);
                        const isClaimed = userProfile.lastRewardClaim && isSameDay(userProfile.lastRewardClaim, dayDate);
                        const isPastDate = isPast(dayDate) && !isTodayDate;
                        const isMissed = isPastDate && !isClaimed;

                        let dayContent;
                        if (isTodayDate) {
                            dayContent = (
                                <button
                                    onClick={handleClaim}
                                    disabled={!canClaimToday || isClaiming}
                                    className={cn(
                                        "w-12 h-12 flex flex-col items-center justify-center rounded-lg transition-all",
                                        canClaimToday
                                            ? "bg-amber-400 text-black animate-pulse cursor-pointer hover:bg-amber-300"
                                            : "bg-green-500 text-white cursor-not-allowed"
                                    )}
                                >
                                    <span className="font-bold">{i + 1}</span>
                                    <NexusCoinIcon className="w-4 h-4" />
                                </button>
                            );
                        } else if (isClaimed) {
                            dayContent = <div className="w-12 h-12 flex items-center justify-center bg-green-500/50 rounded-lg"><Check className="w-6 h-6 text-white"/></div>;
                        } else if (isMissed) {
                            dayContent = <div className="w-12 h-12 flex items-center justify-center bg-destructive/50 rounded-lg"><X className="w-6 h-6 text-white"/></div>;
                        } else {
                            dayContent = <div className="w-12 h-12 flex items-center justify-center bg-muted/50 rounded-lg">{i + 1}</div>;
                        }

                        return <div key={i} className="flex justify-center">{dayContent}</div>;
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
};

const ReminderDialog = ({ user, isOpen, onOpenChange, onSend }: { user: UserProfile, isOpen: boolean, onOpenChange: (open: boolean) => void, onSend: (message: string) => void }) => {
    const [message, setMessage] = useState(`¡Hola ${user.nickname}! No olvides reclamar tu recompensa diaria de Nexuscoins.`);
    const [isSending, setIsSending] = useState(false);

    const handleSend = () => {
        setIsSending(true);
        onSend(message);
        // The parent component will handle closing the dialog and showing toast
        setIsSending(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Recordar a {user.nickname}</DialogTitle>
                    <DialogDescription>Este mensaje se enviará como una notificación del sistema.</DialogDescription>
                </DialogHeader>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px]" />
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSend} disabled={isSending}>{isSending ? "Enviando..." : `Enviar a ${user.nickname}`}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const AdminRewardView = () => {
    const { allUsers, isLoadingAllUsers, fetchAllUsersForAdmin, sendRewardReminder } = useAppStore();
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    
    useEffect(() => {
        if (isModalOpen) {
            fetchAllUsersForAdmin();
        }
    }, [isModalOpen, fetchAllUsersForAdmin]);

    const handleSendReminder = (message: string) => {
        if (!selectedUser) return;
        sendRewardReminder(selectedUser.uid, message);
        toast({ title: "Recordatorio Enviado", description: `Se ha enviado un recordatorio a ${selectedUser.nickname}.`});
        setSelectedUser(null);
    }
    
    const today = new Date();

    return (
        <>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                 <DialogTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-amber-400 hover:text-amber-500 hover:bg-amber-400/10">
                        <NexusCoinIcon className="w-6 h-6"/>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Actividad de Recompensas de Hoy</DialogTitle>
                        <DialogDescription>Usuarios que han reclamado su recompensa diaria.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        {isLoadingAllUsers ? <p>Cargando usuarios...</p> : allUsers.map((user) => {
                             const hasClaimed = user.lastRewardClaim && isSameDay(user.lastRewardClaim, today);
                             return (
                                <div key={user.uid} className="flex justify-between items-center p-2 border-b">
                                    <span>{user.nickname} (@{user.username})</span>
                                    {hasClaimed ? (
                                        <Badge variant="default" className="bg-green-500">Reclamado</Badge>
                                    ) : (
                                        <button onClick={() => setSelectedUser(user)}>
                                            <Badge variant="destructive">No Reclamado</Badge>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </DialogContent>
            </Dialog>
             {selectedUser && (
                <ReminderDialog 
                    user={selectedUser} 
                    isOpen={!!selectedUser} 
                    onOpenChange={() => setSelectedUser(null)}
                    onSend={handleSendReminder}
                />
            )}
        </>
    )
}

function AdminUserListView() {
    const { toast } = useToast();
    const { allUsers, fetchAllUsersForAdmin, isLoadingAllUsers, blockUser, disableUser } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);
    const [actionUser, setActionUser] = useState<UserProfile | null>(null);
    const [blockReason, setBlockReason] = useState("");
    const [disableUntil, setDisableUntil] = useState<Date | undefined>();
    const [actionType, setActionType] = useState<'block' | 'disable' | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchAllUsersForAdmin();
        }
    }, [isOpen, fetchAllUsersForAdmin]);

    const handleBlock = async () => {
        if (!actionUser || !blockReason) return;
        await blockUser(actionUser.uid, blockReason);
        toast({ title: "Usuario Bloqueado", description: `${actionUser.nickname} ha sido bloqueado.` });
        resetActionState();
    };

    const handleDisable = async () => {
        if (!actionUser || !disableUntil) return;
        await disableUser(actionUser.uid, disableUntil);
        toast({ title: "Usuario Inhabilitado", description: `${actionUser.nickname} ha sido inhabilitado hasta ${format(disableUntil, 'PP')}.` });
        resetActionState();
    };
    
    const resetActionState = () => {
        setActionUser(null);
        setActionType(null);
        setBlockReason("");
        setDisableUntil(undefined);
    }

    const ActionDialog = () => (
        <Dialog open={!!actionType} onOpenChange={(open) => !open && resetActionState()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {actionType === 'block' ? 'Bloquear a' : 'Inhabilitar a'} {actionUser?.nickname}
                    </DialogTitle>
                </DialogHeader>
                {actionType === 'block' && (
                    <div className="space-y-4">
                        <Label htmlFor="blockReason">Motivo del bloqueo</Label>
                        <Textarea id="blockReason" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
                    </div>
                )}
                {actionType === 'disable' && (
                     <div className="space-y-4">
                        <Label>Inhabilitar hasta</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn(!disableUntil && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {disableUntil ? format(disableUntil, "PPP") : <span>Elige una fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={disableUntil} onSelect={setDisableUntil} disabled={(d) => d < new Date()} /></PopoverContent>
                        </Popover>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="ghost" onClick={resetActionState}>Cancelar</Button>
                    <Button variant="destructive" onClick={actionType === 'block' ? handleBlock : handleDisable}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <UserCog className="h-6 w-6" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Panel de Administración de Usuarios</DialogTitle>
                        <DialogDescription>
                            Gestiona todos los usuarios registrados en Nexus.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 -mx-6 px-6">
                        {isLoadingAllUsers ? (
                            <p>Cargando usuarios...</p>
                        ) : (
                            <div className="space-y-2">
                                {allUsers.map((user) => (
                                    <div key={user.uid} className="p-3 border rounded-lg bg-card/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-primary">
                                                <AvatarImage src={user.profilePictureUrl} />
                                                <AvatarFallback>{user.nickname?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold">{user.nickname}</p>
                                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                                            </div>
                                            {user.isBlocked && <Badge variant="destructive">Bloqueado</Badge>}
                                            {user.isDisabled && <Badge variant="secondary" className="bg-orange-500">Inhabilitado</Badge>}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500"><ShieldAlert /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-orange-500" onClick={() => { setActionUser(user); setActionType('disable'); }}><Ban /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setActionUser(user); setActionType('block'); }}><UserX /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
            <ActionDialog />
        </>
    );
}

const ActivityStatusDisplay = ({ profileData }: { profileData: UserProfile }) => {
    const { userProfile: loggedInUserProfile } = useAppStore();

    // Do not show status if the logged-in user has their own status disabled.
    if (!loggedInUserProfile?.showActivityStatus) {
        return null;
    }

    return (
        <div className="flex items-center gap-1.5">
            {profileData.showActivityStatus ? (
                <>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-xs text-muted-foreground">En línea</p>
                </>
            ) : (
                <>
                    <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                    <p className="text-xs text-muted-foreground">Desactivado</p>
                </>
            )}
        </div>
    );
};

const ActivityStatusChanger = () => {
    const { userProfile, updateUserProfile } = useAppStore();
    const { toast } = useToast();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    if (!userProfile) return null;

    const handleToggle = async (active: boolean) => {
        try {
            await updateUserProfile({ showActivityStatus: active });
            toast({
                title: "Estado de actividad actualizado",
                description: `Tu estado ahora es ${active ? 'visible' : 'oculto'}.`,
            });
            setShowConfirm(false);
            setIsOpen(false);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cambiar tu estado.' });
        }
    };
    
    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                         {userProfile.showActivityStatus ? (
                            <>
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                <p className="text-xs text-muted-foreground">En línea</p>
                            </>
                         ) : (
                             <>
                                <div className="h-2 w-2 rounded-full bg-gray-500"></div>
                                <p className="text-xs text-muted-foreground">Desactivado</p>
                            </>
                         )}
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cambiar estado de actividad</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Button className="w-full justify-start gap-4" variant={userProfile.showActivityStatus ? "secondary" : "outline"} onClick={() => handleToggle(true)}>
                            <div className="h-3 w-3 rounded-full bg-green-500"/> Activo
                        </Button>
                        <Button className="w-full justify-start gap-4" variant={!userProfile.showActivityStatus ? "secondary" : "outline"} onClick={() => setShowConfirm(true)}>
                            <div className="h-3 w-3 rounded-full bg-gray-500"/> Desactivado
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Desactivar estado de actividad?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Si desactivas tu estado, no podrás ver el estado de actividad de otras personas. ¿Estás seguro?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleToggle(false)}>Sí, desactivar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

type ProfileTab = 'posts' | 'saved' | 'shared';
type PostSortOrder = 'recent' | 'popular';


// Renamed from ProfilePage to UserProfilePage to reflect its new purpose
export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const {
    user: loggedInUser,
    userProfile: loggedInUserProfile,
    fetchUserProfile,
    fetchPostsForUser,
    fetchSharedPosts,
    fetchStories,
    isGlobalLoading,
    wallMessages,
    fetchWallMessages,
    addWallMessage,
    stories,
    notifications,
    sendChatRequest,
    toggleFollow,
    globalAnnouncements,
    fetchGlobalAnnouncements,
  } = useAppStore();
  
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [sharedPosts, setSharedPosts] = useState<Post[]>([]);
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [wallMessage, setWallMessage] = useState("");
  const [isPostingToWall, setIsPostingToWall] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [sortOrder, setSortOrder] = useState<PostSortOrder>('recent');
  const [isLoadingTabContent, setIsLoadingTabContent] = useState(false);
  const [sharedPostsTrigger, setSharedPostsTrigger] = useState(0);

  const userIdFromParams = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const isOwnProfile = !userIdFromParams || (loggedInUser?.uid === userIdFromParams);
  const targetUserId = isOwnProfile ? loggedInUser?.uid : userIdFromParams;
  
  const hasUnreadActivity = notifications.some(n => !n.read);
  
  useEffect(() => {
    if (isGlobalLoading) return; // Wait for auth state to be determined

    if (!targetUserId) {
        if (!isOwnProfile) {
            router.push('/home'); // Redirect if visiting other profile without ID
        }
        // If it's own profile, we wait for loggedInUser to be available
        return;
    }

    let wallMessagesUnsubscribe: (() => void) | undefined;
    let storiesUnsubscribe: (() => void) | undefined;
    let postsUnsubscribe: (() => void) | undefined;
    let announcementsUnsubscribe: (() => void) | undefined;
    
    const loadProfileData = async () => {
        try {
            const profile = await fetchUserProfile(targetUserId);
            setProfileData(profile);
            
            postsUnsubscribe = fetchPostsForUser(targetUserId, (posts) => {
              setUserPosts(posts);
            });
            
            storiesUnsubscribe = fetchStories(targetUserId);
            wallMessagesUnsubscribe = fetchWallMessages(targetUserId);
            announcementsUnsubscribe = fetchGlobalAnnouncements();

            if (loggedInUserProfile && profile) {
                setIsFollowing(loggedInUserProfile.following?.includes(profile.uid));
            }
            
        } catch (error) {
            console.error("Error loading profile data:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudo cargar el perfil." });
        }
    };

    loadProfileData();
    
    return () => {
      if (wallMessagesUnsubscribe) wallMessagesUnsubscribe();
      if (storiesUnsubscribe) storiesUnsubscribe();
      if (postsUnsubscribe) postsUnsubscribe();
      if (announcementsUnsubscribe) announcementsUnsubscribe();
    };
  }, [targetUserId, isGlobalLoading, isOwnProfile, loggedInUser, router, fetchUserProfile, fetchPostsForUser, fetchStories, fetchWallMessages, fetchGlobalAnnouncements, loggedInUserProfile, toast]);


  useEffect(() => {
    if (loggedInUserProfile && profileData) {
      setIsFollowing(loggedInUserProfile.following?.includes(profileData.uid));
    }
  }, [loggedInUserProfile, profileData]);

   useEffect(() => {
      if(targetUserId){
          setUserStories(stories.filter(s => s.authorId === targetUserId));
      }
  }, [stories, targetUserId]);

  useEffect(() => {
    if (profileData?.currentStatus) {
        const expiresAt = profileData.statusExpiresAt;
        if (expiresAt && expiresAt.getTime() > Date.now()) {
            setCurrentStatus(profileData.currentStatus);
        } else {
            setCurrentStatus(null);
        }
    } else {
        setCurrentStatus(null);
    }
  }, [profileData]);

  useEffect(() => {
    const loadTabContent = async () => {
      if (!targetUserId) return;
      if (activeTab === 'shared') {
        setIsLoadingTabContent(true);
        const posts = await fetchSharedPosts(targetUserId);
        setSharedPosts(posts);
        setIsLoadingTabContent(false);
      }
    };
    loadTabContent();
  }, [activeTab, targetUserId, fetchSharedPosts, sharedPostsTrigger]);

  const hasActiveStory = userStories.length > 0;

  const handleLogout = () => {
    auth.signOut().then(() => {
        toast({
            title: "Sesión cerrada",
            description: "¡Vuelve pronto al universo Nexus!",
        });
        router.push('/');
    }).catch((error) => {
        console.error("Logout error:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cerrar la sesión. Inténtalo de nuevo.",
        });
    });
  }

  const handleAddAccount = () => {
    auth.signOut().then(() => {
      router.push('/');
    });
  }
  
  const handleAvatarClick = () => {
    if (hasActiveStory) {
      setIsStoryViewerOpen(true);
    }
  }
  
  const handleFollowToggle = async () => {
    if (!targetUserId || isFollowLoading) return;
    setIsFollowLoading(true);
    try {
        await toggleFollow(targetUserId);
        const updatedProfile = await fetchUserProfile(targetUserId);
        setProfileData(updatedProfile);
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "No se pudo realizar la acción." });
    } finally {
        setIsFollowLoading(false);
    }
  }

  const handlePostToWall = async () => {
    if (!wallMessage.trim() || !targetUserId) return;
    setIsPostingToWall(true);
    try {
      await addWallMessage(targetUserId, wallMessage);
      setWallMessage("");
      toast({ title: "¡Mensaje publicado en el muro!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo publicar tu mensaje." });
    } finally {
      setIsPostingToWall(false);
    }
  };
  
  const handleSendRequest = async (message: string) => {
    if (!targetUserId) return;
    await sendChatRequest(targetUserId, message);
  };
  
  const handleRewardClaimed = () => {
      if (loggedInUser) {
        fetchUserProfile(loggedInUser.uid);
      }
  }
  
  const handleShare = async () => {
    const profileUrl = window.location.href;
    const shareData = {
      title: `Perfil de ${profileData?.nickname} en Nexus`,
      text: `Echa un vistazo al perfil de ${profileData?.nickname} en Nexus.`,
      url: profileUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
         if ((error as Error).name !== 'AbortError') {
          console.error("Error al compartir:", error);
           toast({
            variant: "destructive",
            title: "Error al compartir",
          });
        }
      }
    } else {
        handleCopyLink();
    }
  };
  
  const handleCopyLink = () => {
    const profileUrl = window.location.href;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Enlace copiado",
      description: "Se ha copiado el enlace del perfil al portapapeles.",
    });
  }
  
  const sortedPosts = useMemo(() => {
    const postsCopy = [...userPosts];
    if (sortOrder === 'popular') {
      return postsCopy.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
    }
    // Default is 'recent'
    return postsCopy.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [userPosts, sortOrder]);


  const CurrentStatusDisplay = () => {
    if (!currentStatus || (!currentStatus.vibeKey && !currentStatus.text)) {
      return null;
    }
    
    const vibe = currentStatus.vibeKey ? vibes.find(v => v.key === currentStatus.vibeKey) : null;

    if (!vibe && !currentStatus.text) {
        return null;
    }
    
    const Icon = vibe?.icon || Smile;

    return (
      <div className={cn("text-sm mt-4 flex items-center gap-2 font-semibold p-2 bg-card/80 rounded-full border border-primary/30", vibe?.color)}>
        <Icon className={cn("w-5 h-5", vibe?.animation)} />
        <div>
            {vibe && <span>{vibe.label}</span>}
            {currentStatus.text && <span className="text-xs text-muted-foreground ml-1">| {currentStatus.text}</span>}
        </div>
      </div>
    );
  }

  if (isGlobalLoading || !profileData) {
    return <ProfileSkeleton />;
  }

  const totalReactions = userPosts.reduce((acc, post) => acc + (post.reactions || []).length, 0);
  const isNexusOficial = profileData.email === 'alexander@gmail.com';
  const showAdminTools = isOwnProfile && isNexusOficial;
  
  const StatItem = ({ count, label, href }: { count: number, label: string, href?: string }) => (
    <Link href={href || '#'} className="text-center hover:bg-muted/50 p-2 rounded-md transition-colors">
        <p className="text-2xl font-bold text-primary">{count}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
    </Link>
  );

  const StatDialogItem = ({ count, label, title, children }: { count: number, label: string, title: string, children: React.ReactNode }) => (
    <Dialog>
      <DialogTrigger asChild>
        <div className="text-center hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer">
            <p className="text-2xl font-bold text-primary">{count}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );

  const renderContentForTab = () => {
    if (isLoadingTabContent) {
      return (
        <div className="grid grid-cols-3 gap-1">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="aspect-square w-full" />
        </div>
      );
    }
    
    switch (activeTab) {
      case 'posts':
        return (
          sortedPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {sortedPosts.map(post => (
                <div key={post.id} className="relative aspect-square bg-muted">
                   {post.mediaUrls && post.mediaUrls[0] ? (
                     <Image src={post.mediaUrls[0]} alt="Post media" layout="fill" objectFit="cover" />
                   ) : (
                     <div className="flex items-center justify-center h-full p-2 text-xs text-center text-muted-foreground">{post.content?.substring(0, 50) || ''}...</div>
                   )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-card/70 border-2 border-dashed border-primary/40 rounded-xl shadow-lg max-w-md mx-auto mt-4 flex flex-col items-center">
              <CloudUpload className="w-16 h-16 text-chart-4 text-glow-chart-4 mb-4" />
              <h3 className="text-xl font-bold mb-2">¡Aún no hay vibras!</h3>
              <p className="text-muted-foreground mb-4">Anímate a compartir tus pensamientos o momentos.</p>
              {isOwnProfile && 
                <Button onClick={() => router.push('/create-post')}>
                    <Plus className="w-4 h-4 mr-2" />Publica algo
                </Button>
              }
            </div>
          )
        );
      case 'saved':
        return (
            <div className="text-center p-10 bg-card/70 border-2 border-dashed border-primary/40 rounded-xl shadow-lg max-w-md mx-auto mt-4 flex flex-col items-center">
                <LockIcon className="w-16 h-16 text-chart-3 text-glow-chart-3 mb-4" />
                <h3 className="text-xl font-bold mb-2">Publicaciones Guardadas</h3>
                <p className="text-muted-foreground">Las publicaciones que guardes aparecerán aquí. (Función en desarrollo)</p>
            </div>
        );
      case 'shared':
         return sharedPosts.length > 0 ? (
            <div className="space-y-4">
              {sharedPosts.map(post => (
                <PostCard key={post.id} post={post} onShare={() => setSharedPostsTrigger(t => t + 1)} />
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-card/70 border-2 border-dashed border-primary/40 rounded-xl shadow-lg max-w-md mx-auto mt-4 flex flex-col items-center">
                <Repeat className="w-16 h-16 text-chart-2 mb-4" />
                <h3 className="text-xl font-bold mb-2">Sin publicaciones compartidas</h3>
                <p className="text-muted-foreground">Las publicaciones que compartas aparecerán aquí.</p>
            </div>
        );
      default:
        return null;
    }
  };


  return (
    <>
      <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm p-4 border-b-2 border-primary/30 box-shadow-glow-primary flex justify-between items-center">
          <div className="w-10">
            {!isOwnProfile && (
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
            )}
          </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild disabled={!isOwnProfile}>
                <div className={cn("flex items-center gap-2 cursor-pointer", isOwnProfile && "hover:opacity-80 transition-opacity")}>
                  <h1 className="text-xl font-bold text-primary text-glow-primary truncate">
                    {profileData?.username || 'Perfil'}
                  </h1>
                   {isOwnProfile && <ChevronDown className="h-5 w-5 text-primary" />}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64">
                <DropdownMenuItem>
                  <div className="flex items-center gap-3">
                     <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={profileData?.profilePictureUrl} />
                       <AvatarFallback>{profileData?.nickname?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold">{profileData?.username}</div>
                    <Check className="w-5 h-5 text-primary ml-auto"/>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAddAccount}>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                      <Plus className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="font-semibold">Agregar otra cuenta</div>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          {isOwnProfile ? (
              <div className="flex items-center gap-2">
                  {showAdminTools && (
                      <>
                          <ImeaAdminPanel />
                          <AdminUserListView />
                          <MaintenanceModeDialog />
                          <GlobalAnnouncementDialog />
                          <GlobalEventDialog />
                      </>
                  )}
                  <SetStatusDialog onStatusUpdate={setCurrentStatus}>
                    <Button variant="outline" size="sm" className="border-chart-3 text-chart-3 hover:bg-chart-3/20 rounded-full">
                        <Smile className="w-4 h-4 mr-2"/>
                        Añadir Estado
                    </Button>
                  </SetStatusDialog>
                  <Button variant="ghost" size="icon" onClick={() => router.push('/activity')} className="relative">
                    <Bell className="h-6 w-6" />
                    {hasUnreadActivity && (
                      <span className="absolute top-2 right-2 w-3 h-3 bg-destructive rounded-full animate-pulse border-2 border-card" />
                    )}
                  </Button>
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-6 w-6" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => router.push('/settings')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Ajustes y Privacidad
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyLink}>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Copiar Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartir
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={handleLogout}>
                            <Power className="mr-2 h-4 w-4" />
                            Cerrar Sesión
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
              </div>
          ) : (
             <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-6 w-6" />
            </Button>
          )}
        </header>

        <main className="flex-1 flex flex-col items-center pb-28">
          <section className="flex flex-col items-center p-6 text-center w-full">
            
             <div className="relative w-36 h-36 my-4 cursor-pointer" onClick={handleAvatarClick}>
              <div className={cn(
                "absolute inset-[-4px] rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500",
                hasActiveStory ? "animate-story-ring" : "hidden"
              )}></div>
              <Avatar className="relative w-full h-full border-4 border-background p-1">
                <AvatarImage src={profileData?.profilePictureUrl} />
                <AvatarFallback className="bg-background">
                  <NexusLogo className="w-20 h-20 text-primary" />
                </AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-3xl font-bold text-glow-primary">{profileData?.nickname || 'Nombre no encontrado'}</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">@{profileData?.username || 'usuario_no_encontrado'}</p>
              {profileData?.isVerified && <VerifiedNexusCheck className="w-5 h-5" />}
            </div>

            {isOwnProfile ? (
                 <div className="mt-2">
                    <ActivityStatusChanger />
                </div>
            ) : (
                <div className="mt-2">
                    <ActivityStatusDisplay profileData={profileData} />
                </div>
            )}
            
            <CurrentStatusDisplay />
            {isOwnProfile && profileData?.isVerified && !currentStatus && <Badge variant="secondary" className="mt-2 text-green-400 border-green-400/50">Nuevo: ¡Ahora tu perfil está verificado!</Badge>}
            <div className="flex items-center gap-4 text-muted-foreground text-sm mt-1">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {profileData?.location || 'Ubicación no especificada'}</div>
                {!isNexusOficial && profileData.showOrientation && <div className="flex items-center gap-1"><Heart className="w-3 h-3"/> {profileData.orientation}</div>}
            </div>
            
            <div className="bg-card/50 border border-border/30 rounded-lg p-4 mt-6 max-w-sm w-full">
               <Quote className="w-5 h-5 text-accent transform -scale-x-100" />
               <p className="text-foreground/80 italic my-2">{profileData?.slogan || 'Sin eslogan.'}</p>
               <Quote className="w-5 h-5 text-accent ml-auto" />
            </div>
          </section>

          <section className="grid grid-cols-4 gap-4 w-full max-w-lg text-center px-4 my-4">
              <StatItem count={profileData.followerCount || 0} label="Seguidores" href={`/profile/${targetUserId}/connections/followers`} />
              <StatItem count={profileData.followingCount || 0} label="Siguiendo" href={`/profile/${targetUserId}/connections/following`} />
              <StatItem count={0} label="Visitas" href={`/profile/${targetUserId}/connections/views`} />
              <StatDialogItem count={totalReactions} label="Reacciones" title="Reacciones Totales">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                      <Heart className="w-24 h-24 text-red-500 animate-pulse fill-current" />
                      <p className="text-lg mt-4">
                          <span className="font-bold text-primary">{profileData.nickname}</span> ha recibido un total de <span className="font-bold text-accent">{totalReactions}</span> reacciones en sus publicaciones.
                      </p>
                  </div>
              </StatDialogItem>
          </section>


          <section className="flex gap-4 my-4">
            {isOwnProfile ? (
                <>
                    <Button asChild className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
                        <Link href="/profile/edit"><Pencil className="w-4 h-4 mr-2"/> Editar Perfil</Link>
                    </Button>
                    <Link href="/zlive" passHref>
                        <Button variant="outline" className="text-chart-3 border-chart-3 hover:bg-chart-3/20">
                            <Wifi className="w-4 h-4 mr-2"/> ZLIVE
                        </Button>
                    </Link>
                     {isNexusOficial ? <AdminRewardView /> : <DailyRewardDialog userProfile={profileData} onRewardClaimed={handleRewardClaimed}/>}
                </>
            ) : (
                 <>
                    <Button onClick={handleFollowToggle} disabled={isFollowLoading} className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
                        <UserPlus className="w-4 h-4 mr-2"/> {isFollowing ? 'Siguiendo' : 'Seguir'}
                    </Button>
                    <ChatRequestDialog recipientProfile={profileData} onSend={handleSendRequest} />
                 </>
            )}
          </section>
          
          <section className="w-full px-4 mt-6">
            <h2 className="section-title !text-left !text-xl !mb-4">Muro Z</h2>
            <div className="bg-card/50 border border-border/30 rounded-lg p-4 space-y-4">
              {!isOwnProfile && loggedInUserProfile && (
                <div className="flex items-start gap-3">
                  <Avatar>
                      <AvatarImage src={loggedInUserProfile.profilePictureUrl} />
                      <AvatarFallback>{loggedInUserProfile.nickname?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea 
                      value={wallMessage}
                      onChange={(e) => setWallMessage(e.target.value)}
                      placeholder={`Deja un mensaje público para ${profileData.nickname}...`}
                      maxLength={500}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handlePostToWall} disabled={!wallMessage.trim() || isPostingToWall}>
                        {isPostingToWall ? "Publicando..." : <><Send className="mr-2 h-4 w-4"/> Publicar</>}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {wallMessages.length > 0 ? (
                  wallMessages.map(msg => (
                    <div key={msg.id} className="flex items-start gap-3">
                      <Avatar>
                          <AvatarImage src={msg.author.profilePictureUrl} />
                          <AvatarFallback>{msg.author.nickname?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 bg-muted/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                              <p className="font-bold text-sm text-primary">{msg.author.nickname}</p>
                              <p className="text-xs text-muted-foreground">{msg.createdAt ? formatDistanceToNow(msg.createdAt, { addSuffix: true, locale: es }) : 'ahora'}</p>
                          </div>
                          <p className="text-sm mt-1 whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {isOwnProfile ? "Tu muro está vacío. ¡Invita a otras almas a que te dejen un mensaje!" : `Sé la primera alma en dejar un mensaje en el muro de ${profileData.nickname}.`}
                </p>
              )}
            </div>
          </section>


          <section className="w-full px-4 mt-6">
              <h2 className="section-title !text-left !text-xl !mb-4">Sobre Mí</h2>
              <div className="bg-card/50 border border-border/30 rounded-lg p-4 space-y-4">
                  <div>
                      <h3 className="font-bold">Intereses</h3>
                       <div className="flex flex-wrap gap-2 pt-4">
                        {profileData?.interests && profileData.interests.length > 0 ? (
                            profileData.interests.map(interest => (
                              <Badge key={interest} variant="secondary" className="text-base py-1 px-3">
                                #{interest}
                              </Badge>
                            ))
                        ) : (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">#SinIntereses</span>
                        )}
                      </div>
                  </div>
              </div>
          </section>

           <section className="w-full max-w-4xl px-4 mt-8">
                <div className="border-b border-border mb-4 flex justify-around items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className={cn("flex-1 rounded-none", activeTab === 'posts' && "border-b-2 border-primary text-primary")}>
                                <Grid3x3 className="w-5 h-5 mr-2" />
                                <ChevronDown className="w-4 h-4 ml-1"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSortOrder('recent')}>Recientes</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder('popular')}>Populares</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" onClick={() => setActiveTab('saved')} className={cn("flex-1 rounded-none", activeTab === 'saved' && "border-b-2 border-primary text-primary")}>
                        <LockIcon className="w-5 h-5"/>
                    </Button>
                     <Button variant="ghost" onClick={() => setActiveTab('shared')} className={cn("flex-1 rounded-none", activeTab === 'shared' && "border-b-2 border-primary text-primary")}>
                        <Repeat className="w-5 h-5"/>
                    </Button>
                </div>
                {renderContentForTab()}
            </section>
        </main>
        {isOwnProfile && (
            <div className="fixed bottom-24 right-4 z-20">
               <Link href="/create-story" passHref>
                  <Button size="icon" className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-lg shadow-yellow-500/50 transform hover:scale-110 transition-transform">
                      <Star className="w-8 h-8"/>
                  </Button>
               </Link>
            </div>
        )}
      </div>
      {hasActiveStory && (
        <StoryViewer 
            isOpen={isStoryViewerOpen} 
            onClose={() => setIsStoryViewerOpen(false)} 
            stories={userStories}
            userProfile={profileData}
        />
      )}
    </>
  );
}


const ProfileSkeleton = () => (
  <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
    <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-sm p-4 border-b-2 border-primary/30 box-shadow-glow-primary flex justify-between items-center">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </header>
    <main className="flex-1 flex flex-col items-center pb-28">
      <section className="flex flex-col items-center p-6 text-center w-full">
        <Skeleton className="h-36 w-36 rounded-full my-4" />
        <Skeleton className="h-8 w-48 mt-4" />
        <Skeleton className="h-5 w-32 mt-2" />
        <Skeleton className="h-5 w-40 mt-1" />
        <Skeleton className="h-24 w-full max-w-sm mt-6" />
      </section>
      <section className="grid grid-cols-4 gap-4 w-full max-w-lg text-center px-4 my-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </section>
      <section className="flex gap-4 my-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </section>
    </main>
  </div>
);

const ImeaAdminPanel = () => {
    const { moderationLogs, fetchModerationLogs } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const unsub = fetchModerationLogs();
            return () => unsub();
        }
    }, [isOpen, fetchModerationLogs]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Bot className="h-6 w-6" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Panel de Moderación IMEA</DialogTitle>
                    <DialogDescription>Registros de acciones de moderación de contenido.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mx-6 px-6">
                    <div className="space-y-4">
                        {moderationLogs.map(log => (
                            <div key={log.id} className="p-3 bg-card/80 border-l-4 border-destructive rounded-r-lg">
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span className="font-bold text-destructive uppercase">{log.action.replace(/_/g, ' ')}</span>
                                    <span>{format(log.createdAt, 'Pp', { locale: es })}</span>
                                </div>
                                <p className="font-semibold mt-2">Usuario: {log.userNickname} ({log.userId})</p>
                                <p className="text-sm mt-1">Motivo: <span className="font-semibold">{log.reason}</span></p>
                                <blockquote className="mt-2 p-2 bg-muted/50 border-l-2 border-muted-foreground text-sm italic">
                                    "{log.content}"
                                </blockquote>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
