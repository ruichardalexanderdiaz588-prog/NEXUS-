
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wifi, Gamepad2, Video, AlertCircle, RotateCcw, FlipHorizontal, Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/hooks/use-app-store";

export default function ZLivePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { startZLive } = useAppStore();
  const [liveTitle, setLiveTitle] = useState("");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Acceso a la Cámara Denegado",
          description: "Por favor, habilita los permisos de cámara en tu navegador para usar esta función.",
        });
      }
    };

    getCameraPermission();

    return () => {
      // Detener la cámara al desmontar el componente
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  const handleStartLive = async () => {
    if (!liveTitle.trim()) {
      toast({
        variant: "destructive",
        title: "¡Falta el título!",
        description: "Dale un nombre épico a tu transmisión.",
      });
      return;
    }
    
    setIsStarting(true);
    
    try {
      const streamId = await startZLive(liveTitle);
      toast({
        title: "🚀 ¡En Vivo!",
        description: `Tu transmisión "${liveTitle}" ha comenzado.`,
      });
      router.push(`/zlive/${streamId}`);
    } catch (error) {
      console.error("Error starting live stream:", error);
      toast({
        variant: "destructive",
        title: "Error al iniciar",
        description: "No se pudo iniciar la transmisión. Inténtalo de nuevo.",
      });
       setIsStarting(false);
    }
  };

  return (
    <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
      {/* Camera View */}
      <div className="absolute inset-0 w-full h-full bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted={isMuted}
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col h-full text-white">
        <header className="p-4 flex justify-between items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-shadow">Preparar ZLive</h1>
          <div className="w-9"></div> {/* Spacer */}
        </header>

        <main className="flex-1 flex flex-col justify-end p-4 md:p-8 space-y-4">
          <AnimatePresence>
            {hasCameraPermission === false && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Se requiere acceso a la cámara</AlertTitle>
                  <AlertDescription>
                    No podemos iniciar tu ZLive sin acceso a la cámara. Por favor, revisa los permisos de tu navegador.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-card/70 backdrop-blur-md p-6 rounded-2xl space-y-6 shadow-2xl">
            <Tabs defaultValue="zlive" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="zlive"><Wifi className="mr-2"/>ZLive</TabsTrigger>
                <TabsTrigger value="zgame" disabled><Gamepad2 className="mr-2"/>ZLive Game</TabsTrigger>
              </TabsList>
              <TabsContent value="zlive">
                <div className="text-center p-4">
                    <Video className="w-12 h-12 mx-auto text-primary mb-2"/>
                    <p className="font-bold">Modo ZLive</p>
                    <p className="text-sm text-muted-foreground">Transmite usando la cámara de tu dispositivo.</p>
                </div>
              </TabsContent>
               <TabsContent value="zgame">
                <div className="text-center p-4">
                    <Gamepad2 className="w-12 h-12 mx-auto text-primary mb-2"/>
                    <p className="font-bold">Modo ZLive Game</p>
                    <p className="text-sm text-muted-foreground">Comparte la pantalla de tu juego (próximamente en escritorio).</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="live-title" className="text-primary font-bold">Título de la transmisión</Label>
              <Input
                id="live-title"
                placeholder="Ej: ¡Jugando y charlando un rato!"
                value={liveTitle}
                onChange={(e) => setLiveTitle(e.target.value)}
                className="text-base text-foreground"
              />
            </div>
             <div className="flex justify-center space-x-4 pt-2">
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40">
                    <RotateCcw />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40">
                    <FlipHorizontal />
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full bg-black/20 border-white/20 text-white hover:bg-black/40"
                    onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff /> : <Mic />}
                </Button>
            </div>
          </div>
          
          <Button
            onClick={handleStartLive}
            disabled={!hasCameraPermission || isStarting}
            size="lg"
            className="w-full text-lg font-bold bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg hover:from-red-600 hover:to-red-800"
          >
            {isStarting ? "Iniciando..." : <><Send className="mr-2"/>Iniciar ZLive</>}
          </Button>
        </main>
      </div>
    </div>
  );
}
