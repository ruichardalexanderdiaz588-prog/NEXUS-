
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Hourglass, Plus, Box, X, Image as ImageIcon, Calendar, Save, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Input } from "@/components/ui/input";

type Screen = "main" | "create" | "loading" | "sending";

export default function TimeCapsulePage() {
  const [screen, setScreen] = useState<Screen>("main");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

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

  const handleSendCapsule = () => {
    if ((!message && !image) || !document.querySelector<HTMLInputElement>('#discoveryDateInput')?.value) {
      alert("La cápsula no puede estar vacía y debe tener una fecha de descubrimiento.");
      return;
    }
    setScreen("sending");
    setTimeout(() => {
        alert("¡Tu Cronocápsula Z ha sido enviada al futuro!");
        setScreen("main");
        setMessage("");
        setImage(null);
    }, 3000);
  };

  const renderScreen = () => {
    switch (screen) {
      case "create":
        return (
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-50">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setScreen("main")}>
              <X />
            </Button>
            <h2 className="text-2xl font-bold text-chart-3 mb-4 text-glow-chart-3">¡Crea tu Mensaje Temporal!</h2>
            <div className="w-full max-w-lg space-y-4">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="¿Qué quieres dejar para el futuro? (máx 500 caracteres)"
                maxLength={500}
                className="min-h-[150px] bg-card/50"
              />
              <p className="text-right text-sm text-muted-foreground">{message.length}/500</p>
              
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => document.getElementById('capsuleImageUploadInput')?.click()}>
                  <ImageIcon className="mr-2" /> {image ? 'Cambiar Imagen' : 'Añadir Imagen'}
                </Button>
                <input type="file" id="capsuleImageUploadInput" onChange={handleImageUpload} accept="image/*" className="hidden" />
                 {image && (
                     <div className="relative w-20 h-20">
                        <Image src={image} alt="preview" layout="fill" objectFit="cover" className="rounded-md" />
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImage(null)}>
                            <X className="h-4 w-4" />
                        </Button>
                     </div>
                 )}
              </div>

              <div className="space-y-2">
                <label htmlFor="discoveryDateInput" className="flex items-center gap-2"><Calendar className="w-4 h-4"/> ¿Cuándo quieres que sea descubierta?</label>
                <Input id="discoveryDateInput" type="date" className="bg-card/50"/>
              </div>

              <Button onClick={handleSendCapsule} className="w-full bg-gradient-to-r from-green-500 to-teal-500">
                <Save className="mr-2"/> Guardar Cápsula para el Futuro
              </Button>
            </div>
          </motion.div>
        );

      case "loading":
         return (
             <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center p-4 z-50 text-center">
                <Hourglass className="w-24 h-24 text-primary mb-6 animate-spin" style={{ animationDuration: '3s' }}/>
                <h2 className="text-3xl font-bold text-primary mb-2">Buscando Cronocápsulas...</h2>
                <p className="text-muted-foreground max-w-md mb-6">
                    El éter cósmico está explorando mensajes temporales. Por favor, espera...
                </p>
                <Button variant="destructive" onClick={() => setScreen("main")}><Reply className="mr-2"/> Volver</Button>
            </motion.div>
         )
    
      case "sending":
         return (
             <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-gradient-to-b from-background via-[#1B2735] to-[#090A0F] flex flex-col items-center justify-center p-4 z-50 text-center">
                 <motion.div 
                    className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full shadow-2xl shadow-accent"
                    initial={{ y: 100, scale: 1, opacity: 1 }}
                    animate={{ y: -500, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 3, ease: "easeIn" }}
                 />
                 <motion.p 
                    className="text-2xl font-bold text-chart-3 mt-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                 >¡Cronocápsula enviada al futuro!</motion.p>
             </motion.div>
         )

      default: // main screen
        return (
            <div className="text-center">
                <Hourglass className="w-32 h-32 text-primary mb-6 text-glow-primary" />
                <h2 className="text-4xl font-bold mb-4">Cronocápsula Z</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    Envía tu mensaje al futuro y déjalo para que lo descubran otras Almas Z... ¡Sé parte de la historia cósmica!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" onClick={() => setScreen("create")} className="bg-gradient-to-r from-purple-600 to-accent">
                        <Plus className="mr-2" /> Crear Cronocápsula
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => setScreen("loading")}>
                        <Box className="mr-2" /> Abrir Cronocápsula
                    </Button>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="w-full min-h-svh flex flex-col bg-gradient-to-b from-background via-[#1B2735] to-[#090A0F] text-foreground">
      <AnimatePresence mode="wait">
        {screen !== "main" ? (
          renderScreen()
        ) : (
          <>
            <header className="p-4 border-b border-border/20 sticky top-0 bg-transparent z-10">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft />
              </Button>
            </header>
            <main className="flex-1 flex items-center justify-center p-4">
              {renderScreen()}
            </main>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
