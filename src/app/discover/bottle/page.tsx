
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Ship, Paperclip, Send, X, Bot, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/shared/bottom-nav";
import Image from "next/image";

type Screen = "main" | "writing" | "preview" | "alien" | "falling";

const Star = () => {
  const style = {
    width: `${Math.random() * 2 + 0.5}px`,
    height: `${Math.random() * 2 + 0.5}px`,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 4}s`,
    animationDuration: `${Math.random() * 3 + 2}s`,
  };
  return <div className="absolute bg-white rounded-full animate-twinkle" style={style}></div>;
};

const BottleIcon = ({ className }: { className?: string }) => (
    <div className={cn("relative w-[1em] h-[1.5em] flex items-center justify-center bg-gradient-to-tr from-cyan-500/20 to-blue-500/50 border-2 border-primary rounded-[50%_50%_10%_10%_/_50%_50%_10%_10%] shadow-lg shadow-cyan-500/50", className)}>
        <Paperclip className="w-[0.4em] h-[0.4em] text-chart-3 animate-pulse" />
    </div>
);


export default function BottlePage() {
  const [screen, setScreen] = useState<Screen>("main");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGetBottle = () => {
    setScreen("falling");
    setTimeout(() => {
        setScreen("alien");
    }, 3000);
  };
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case "falling":
        return (
            <motion.div
                key="falling"
                initial={{ top: "-200px", opacity: 0, rotate: 0 }}
                animate={{ top: "30%", opacity: 1, rotate: 720 }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="fixed left-1/2 -translate-x-1/2 z-50"
            >
                <BottleIcon className="text-8xl" />
            </motion.div>
        );
      case "alien":
         return (
            <motion.div
              key="alien"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-50"
            >
                <Bot className="w-24 h-24 text-magenta-500 mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-primary mb-2">¡Ups... parece que no hay almas cerca!</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    Nuestro sistema de mensajería intergaláctico no encontró ninguna botella para ti. Intenta de nuevo más tarde, ¡o envía una tú!
                </p>
                <Button onClick={() => setScreen("main")} className="bg-gradient-to-r from-green-500 to-teal-500">
                    Entendido
                </Button>
            </motion.div>
         )
      case "writing":
        return (
          <motion.div
            key="writing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50"
          >
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setScreen("main")}>
              <X />
            </Button>
            <h2 className="text-2xl font-bold text-primary mb-4">¡Envía tu mensaje al cosmos!</h2>
            <div className="w-full max-w-lg space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje (máximo 800 caracteres)..."
                maxLength={800}
                className="min-h-[150px] bg-card/50"
              />
              <p className="text-right text-sm text-muted-foreground">{message.length}/800</p>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="mr-2" />
                    {image ? 'Cambiar Imagen' : 'Añadir Imagen'}
                </Button>
                 <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                 {image && (
                     <div className="relative w-20 h-20">
                        <Image src={image} alt="preview" layout="fill" objectFit="cover" className="rounded-md" />
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImage(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                     </div>
                 )}
              </div>

              <Button onClick={() => setScreen("preview")} disabled={!message && !image} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500">
                Ver Vista Previa
              </Button>
            </div>
          </motion.div>
        );
      case "preview":
         return (
             <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50"
             >
                <div className="bg-gradient-to-br from-card to-background border-2 border-primary rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto text-center shadow-2xl shadow-primary/30">
                    <Button variant="ghost" size="icon" className="absolute top-6 right-6" onClick={() => setScreen("writing")}>
                        <X />
                    </Button>
                    <h2 className="text-2xl font-bold text-primary mb-4">Tu Mensaje Cósmico</h2>
                    {image && <Image src={image} alt="preview" width={400} height={300} className="rounded-lg mb-4 mx-auto" />}
                    <p className="text-left whitespace-pre-wrap mb-6">{message}</p>
                    <div className="flex gap-4 justify-center">
                        <Button variant="outline" onClick={() => setScreen("writing")}>Editar</Button>
                        <Button className="bg-gradient-to-r from-green-500 to-teal-500" onClick={() => { alert('¡Botella enviada!'); setScreen("main"); }}>
                            <Send className="mr-2"/> Enviar al Universo
                        </Button>
                    </div>
                </div>
             </motion.div>
         )
      default: // main screen
        return (
          <>
            <header className="absolute top-0 left-0 w-full p-4 z-10">
              <div className="flex items-center">
                 <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                 </Button>
                 <h1 className="text-xl font-bold text-primary text-glow-primary ml-4 flex items-center gap-2">
                    <Ship /> Botella a la Deriva
                </h1>
              </div>
            </header>
            
            <div className="flex flex-col items-center justify-center text-center cursor-pointer group" onClick={handleGetBottle}>
              <BottleIcon className="text-7xl group-hover:scale-105 transition-transform" />
              <p className="text-2xl font-bold mt-4">Conseguir una botella</p>
            </div>

            <div className="fixed bottom-24 left-4 text-center cursor-pointer group" onClick={() => setScreen("writing")}>
              <Send className="w-12 h-12 text-purple-400 group-hover:text-primary transition-colors" />
              <p className="text-muted-foreground text-sm mt-1">Mandar una botella</p>
            </div>
            
            <BottomNav />
          </>
        );
    }
  };

  return (
    <div className="w-full min-h-svh flex flex-col bg-gradient-to-b from-background via-[#1B2735] to-[#090A0F] text-foreground overflow-hidden">
        {/* Star Background */}
        <div className="absolute inset-0 z-0">
            {Array.from({ length: 100 }).map((_, i) => <Star key={i} />)}
        </div>
        
        <main className="flex-1 flex items-center justify-center z-10">
          <AnimatePresence mode="wait">
             {renderScreen()}
          </AnimatePresence>
        </main>
    </div>
  );
}
