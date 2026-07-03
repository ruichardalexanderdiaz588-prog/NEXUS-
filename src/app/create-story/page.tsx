
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Image as ImageIcon, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/hooks/use-app-store";

export default function CreateStoryPage() {
    const [textContent, setTextContent] = useState("");
    const { toast } = useToast();
    const router = useRouter();
    const { addStory, appStatus } = useAppStore();
    const [isPublishing, setIsPublishing] = useState(false);

    const handlePublish = async () => {
        if (appStatus.isMaintenanceModeEnabled) {
            toast({ variant: "destructive", title: "Modo Mantenimiento", description: "Las historias están deshabilitadas temporalmente." });
            return;
        }
        setIsPublishing(true);

        if (textContent.trim().length < 5) {
            toast({
                variant: 'destructive',
                title: 'Texto muy corto',
                description: 'Las stories de texto deben tener al menos 5 caracteres.',
            });
            setIsPublishing(false);
            return;
        }

        try {
            await addStory({
                type: 'text',
                content: textContent,
            });

            toast({
                title: '🌟 ¡Story Publicada!',
                description: 'Tu story ya está visible para tus seguidores.',
            });
            router.push("/profile");
        } catch(error) {
            console.error("Error publishing story:", error);
            toast({
                variant: 'destructive',
                title: 'Error al publicar',
                description: 'No se pudo publicar tu story. Inténtalo de nuevo.',
            });
        } finally {
            setIsPublishing(false);
        }
    }

    return (
        <div className="flex flex-col items-center justify-between h-full p-4 gap-4">
            <div className="w-full max-w-md flex-1 flex flex-col">
                <div className="relative w-full aspect-[9/16] bg-gradient-to-br from-purple-500 to-accent rounded-lg p-4 flex items-center justify-center flex-1">
                    <Textarea 
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Escribe tu historia aquí..."
                        className="bg-transparent border-0 text-white text-2xl font-bold text-center resize-none focus-visible:ring-0 placeholder:text-white/70 h-full"
                        maxLength={150}
                        disabled={isPublishing}
                        autoFocus
                    />
                     <p className="absolute bottom-4 right-4 text-white/80 text-sm">{textContent.length} / 150</p>
                </div>
            </div>
            
            <div className="w-full max-w-md space-y-4">
                 <Button onClick={handlePublish} disabled={isPublishing || !textContent.trim()} size="lg" className="w-full bg-gradient-to-r from-primary to-accent">
                    {isPublishing ? "Publicando..." : <>Publicar Story <Send className="ml-2"/></>}
                </Button>
            </div>
        </div>
    )
}
