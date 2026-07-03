
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";
import {
  Smile, Zap, Coffee, Cloud, Star, Skull, Brain, Ghost, Cat, Moon, Battery, Gamepad2, Mic, Film,
  Code, Satellite, Rocket, FlaskConical, Atom, Anchor, Biohazard, BookOpen, Bot, Briefcase, 
  Brush, Bug, Building2, Camera, Car, Cast, Cloudy, Cog, Compass, Component, Cpu, Crown,
  Dna, DraftingCompass, Drama, Droplets, Dumbbell, Ear, Eye, Feather, Fence, FileVideo, Fingerprint
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type Status = {
    vibeKey: string | null;
    text: string;
}

export type Vibe = {
  key: string;
  icon: React.ElementType;
  label: string;
  color: string;
  animation: string;
};


export const vibes: Vibe[] = [
  { key: "chill", icon: Coffee, label: "Chill", color: "text-cyan-400", animation: "animate-float" },
  { key: "onfire", icon: Zap, label: "On Fire", color: "text-orange-400", animation: "animate-pulse" },
  { key: "dreamy", icon: Cloud, label: "Dreamy", color: "text-purple-400", animation: "animate-float-slow" },
  { key: "starry", icon: Star, label: "Starry", color: "text-yellow-400", animation: "animate-twinkle" },
  { key: "lowkey", icon: Ear, label: "Lowkey", color: "text-gray-400", animation: "" },
  { key: "dead", icon: Skull, label: "Dead", color: "text-red-500", animation: "animate-shake" },
  { key: "bigbrain", icon: Brain, label: "Big Brain", color: "text-fuchsia-400", animation: "animate-pulse-slow" },
  { key: "ghosting", icon: Ghost, label: "Fantasma", color: "text-indigo-300", animation: "animate-float" },
  { key: "caos", icon: Cat, label: "Caos Creativo", color: "text-amber-500", animation: "animate-shake" },
  { key: "nocturno", icon: Moon, label: "Nocturno", color: "text-slate-400", animation: "animate-pulse-slow" },
  { key: "bateria", icon: Battery, label: "Batería Baja", color: "text-green-500", animation: "" },
  { key: "gaming", icon: Gamepad2, label: "Gaming", color: "text-red-400", animation: "animate-pulse" },
  { key: "podcast", icon: Mic, label: "Podcast", color: "text-blue-400", animation: "" },
  { key: "cine", icon: Film, label: "Cine", color: "text-teal-400", animation: "" },
  { key: "coding", icon: Code, label: "Coding", color: "text-lime-400", animation: "" },
  { key: "exploring", icon: Compass, label: "Explorando", color: "text-rose-400", animation: "animate-float" },
  { key: "creating", icon: Brush, label: "Creando", color: "text-pink-400", animation: "" },
  { key: "studying", icon: BookOpen, label: "Estudiando", color: "text-sky-400", animation: "" },
  { key: "working", icon: Briefcase, label: "Trabajando", color: "text-gray-500", animation: "" },
  { key: "traveling", icon: Rocket, label: "Viajando", color: "text-orange-500", animation: "animate-shake" },
  { key: "listening", icon: Ear, label: "Escuchando", color: "text-violet-400", animation: "animate-pulse" },
  { key: "watching", icon: Eye, label: "Viendo", color: "text-cyan-500", animation: "" },
  { key: "building", icon: Building2, label: "Construyendo", color: "text-amber-600", animation: "" },
  { key: "debugging", icon: Bug, label: "Debugging", color: "text-red-600", animation: "animate-shake" },
  { key: "syncing", icon: Cpu, label: "Sincronizando", color: "text-teal-500", animation: "animate-pulse-slow" },
  { key: "evolving", icon: Dna, label: "Evolucionando", color: "text-green-400", animation: "" },
  { key: "designing", icon: DraftingCompass, label: "Diseñando", color: "text-indigo-400", animation: "" },
  { key: "king", icon: Crown, label: "Rey/Reina", color: "text-yellow-500", animation: "animate-twinkle" },
  { key: "thinking", icon: Cog, label: "Pensando", color: "text-slate-500", animation: "animate-pulse-slow" },
  { key: "experimenting", icon: FlaskConical, label: "Experimentando", color: "text-lime-500", animation: "" },
  { key: "offline", icon: Satellite, label: "Offline", color: "text-gray-600", animation: "" },
  { key: "online", icon: Bot, label: "Online", color: "text-emerald-500", animation: "animate-pulse" },
  { key: "in-a-call", icon: Cast, label: "En llamada", color: "text-blue-500", animation: "" },
  { key: "in-a-meeting", icon: Briefcase, label: "En reunión", color: "text-zinc-500", animation: "" },
  { key: "on-the-road", icon: Car, label: "En la carretera", color: "text-stone-500", animation: "" },
  { key: "in-the-gym", icon: Dumbbell, label: "En el gym", color: "text-orange-600", animation: "" },
  { key: "feeling-blue", icon: Droplets, label: "Triste", color: "text-blue-600", animation: "" },
  { key: "dramatic", icon: Drama, label: "Dramático", color: "text-purple-600", animation: "" },
  { key: "lightweight", icon: Feather, label: "Ligero", color: "text-sky-300", animation: "animate-float" },
  { key: "protected", icon: Fence, label: "Protegido", color: "text-amber-700", animation: "" },
  { key: "recording", icon: FileVideo, label: "Grabando", color: "text-red-500", animation: "animate-pulse" },
  { key: "unique", icon: Fingerprint, label: "Único", color: "text-teal-400", animation: "" },
  { key: "toxic", icon: Biohazard, label: "Tóxico", color: "text-lime-600", animation: "animate-shake" },
  { key: "anchored", icon: Anchor, label: "Anclado", color: "text-gray-700", animation: "" },
  { key: "atomic", icon: Atom, label: "Atómico", color: "text-cyan-600", animation: "animate-pulse" },
  { key: "taking-pics", icon: Camera, label: "Fotografiando", color: "text-zinc-400", animation: "" },
  { key: "cloudy-mind", icon: Cloudy, label: "Mente Nublada", color: "text-slate-400", animation: "" },
  { key: "deep-work", icon: Component, label: "Deep Work", color: "text-indigo-600", animation: "" },
  { key: "inspired", icon: Smile, label: "Inspirado", color: "text-yellow-400", animation: "animate-twinkle" },
];

interface SetStatusDialogProps {
  children: React.ReactNode;
  onStatusUpdate: (status: Status | null) => void;
}

export function SetStatusDialog({ children, onStatusUpdate }: SetStatusDialogProps) {
  const { updateUserStatus } = useAppStore();
  const { toast } = useToast();
  const [selectedVibeKey, setSelectedVibeKey] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdate = async () => {
    const newStatus: Status = {
      vibeKey: selectedVibeKey,
      text: text,
    };

    try {
        await updateUserStatus(newStatus);
        onStatusUpdate(newStatus);
        toast({
            title: "✨ ¡Vibra actualizada!",
            description: "Tu nuevo estado es visible en tu perfil.",
        });
        setIsOpen(false);
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo actualizar tu estado. Inténtalo de nuevo.",
        });
    }
  };
  
  const handleClearStatus = async () => {
     try {
        await updateUserStatus(null);
        onStatusUpdate(null);
        toast({
            title: "Estado eliminado",
        });
        setIsOpen(false);
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo eliminar tu estado.",
        });
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card border-primary/50">
        <DialogHeader>
          <DialogTitle className="text-primary text-glow-primary text-2xl">¿Cuál es tu vibra de hoy?</DialogTitle>
          <DialogDescription>
            Selecciona un mood y añade un texto si quieres. Se mostrará en tu perfil durante 24 horas.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {vibes.map((vibe) => {
              const Icon = vibe.icon;
              return (
                <div
                  key={vibe.key}
                  onClick={() => setSelectedVibeKey(vibe.key)}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all duration-200 h-24",
                    selectedVibeKey === vibe.key
                      ? "border-primary shadow-lg shadow-primary/30"
                      : "border-border/50 hover:border-accent"
                  )}
                >
                  <Icon className={cn("w-8 h-8 mb-1", vibe.color, vibe.animation)} />
                  <span className="text-xs font-semibold text-center">{vibe.label}</span>
                </div>
              );
            })}
          </div>
          <div className="space-y-2 pt-2">
            <Input
              id="status-description"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Añade un texto a tu vibra..."
              className="col-span-3 mt-2"
              maxLength={80}
            />
            <p className="text-xs text-muted-foreground text-right">{text.length}/80</p>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
           <Button onClick={handleClearStatus} variant="destructive">
            Borrar Estado
          </Button>
          <Button onClick={handleUpdate} type="submit" className="bg-gradient-to-r from-purple-600 to-accent">
            Actualizar Vibra
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
