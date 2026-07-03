
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Ghost, User, UserCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TextPhase = "age" | "orientation" | "searching" | "no-results";

const ageRanges = [
  { key: "menor", label: "Menor (13-17)" },
  { key: "joven", label: "Adulto Joven (18-25)" },
  { key: "adulto", label: "Adulto (26-45)" },
  { key: "mayor", label: "Mayor (46+)" },
  { key: "cualquiera", label: "Cualquiera" },
];

const orientations = [
  { key: "hetero", label: "Heterosexual" },
  { key: "gay", label: "Gay" },
  { key: "bi", label: "Bisexual" },
  { key: "pan", label: "Pansexual" },
  { key: "asexual", label: "Asexual" },
  { key: "cualquiera", label: "Cualquiera" },
];

const SearchingAnimation = () => {
  const { userProfile } = useAppStore();

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {/* Star Background */}
        <div className="absolute inset-0 z-0">
            {Array.from({ length: 100 }).map((_, i) => (
                 <div key={i} className="absolute bg-white rounded-full animate-twinkle" style={{
                    width: `${Math.random() * 2 + 0.5}px`,
                    height: `${Math.random() * 2 + 0.5}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${Math.random() * 3 + 2}s`,
                }}></div>
            ))}
        </div>
      <div className="relative w-64 h-64 flex items-center justify-center z-10">
        {/* Concentric Rings */}
        <div className="absolute w-full h-full border-2 border-primary/20 rounded-full animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute w-2/3 h-2/3 border-2 border-primary/30 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
        <div className="absolute w-1/2 h-1/2 border-2 border-primary/50 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
        
        {/* User Avatar */}
        <Avatar className="w-24 h-24 border-4 border-white shadow-2xl shadow-primary">
          <AvatarImage src={userProfile?.profilePictureUrl} />
          <AvatarFallback>{userProfile?.nickname[0]}</AvatarFallback>
        </Avatar>
      </div>
      <div className="absolute bottom-16 text-center text-white z-10">
        <h2 className="text-2xl font-bold">Buscando almas que resuenen...</h2>
        <p className="text-white/80">Sintonizando frecuencias cósmicas.</p>
      </div>
    </div>
  );
};


export default function TextChatPage() {
  const [phase, setPhase] = useState<TextPhase>("age");
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  const handleAgeSelect = (ageKey: string) => {
    setSelectedAge(ageKey);
    // Simulating current user is 'joven'
    if (ageKey === 'menor') {
      setShowWarning(true);
    } else {
      setPhase("orientation");
    }
  };
  
  const handleConfirmWarning = () => {
    setShowWarning(false);
    setPhase("orientation");
  };

  const handleOrientationSelect = (orientationKey: string) => {
    setSelectedOrientation(orientationKey);
    setPhase("searching");
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === "searching") {
      timer = setTimeout(() => {
        // Always go to no-results for now
        setPhase("no-results");
      }, 5000); // Increased timeout for animation
    }
    return () => clearTimeout(timer);
  }, [phase]);

  const resetFlow = () => {
    setSelectedAge(null);
    setSelectedOrientation(null);
    setPhase("age");
  };

  const renderContent = () => {
    switch (phase) {
      case "searching":
        return (
          <motion.div key="searching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gradient-to-b from-background via-[#1B2735] to-[#090A0F]">
            <SearchingAnimation />
          </motion.div>
        );

      case "age":
      case "orientation":
        return (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex flex-col items-center p-4"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2 text-center">¡Envía tu mensaje al universo!</h2>
            <p className="text-muted-foreground mb-6 text-center">Conecta con almas a través del poder de las palabras.</p>
            
            <AnimatePresence mode="wait">
              {phase === "age" && (
                <motion.div key="age" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} className="w-full max-w-md">
                  <h3 className="step-title">¿Qué rango de edad buscas?</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {ageRanges.map(age => (
                      <Button key={age.key} variant="outline" size="lg" onClick={() => handleAgeSelect(age.key)}>
                        {age.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
              {phase === "orientation" && (
                 <motion.div key="orientation" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} className="w-full max-w-md">
                  <h3 className="step-title">¿Qué orientación quieres conocer?</h3>
                   <div className="grid grid-cols-2 gap-3">
                    {orientations.map(ori => (
                      <Button key={ori.key} variant="outline" size="lg" onClick={() => handleOrientationSelect(ori.key)}>
                        {ori.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );

      case "no-results":
        return (
           <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center p-4">
              <Ghost className="w-24 h-24 text-accent mb-6" />
              <h2 className="text-3xl font-bold text-primary mb-2">¡Ups... aún no hay almas que resuenen!</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                  Parece que el cosmos está en silencio por ahora. Intenta con otros filtros, o espera a que nuevas almas se unan a la frecuencia Z.
              </p>
              <Button onClick={resetFlow}>Intentar de Nuevo</Button>
          </motion.div>
        )

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
       <header className={cn("p-4 border-b border-border flex items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10", phase === 'searching' && 'bg-transparent border-transparent')}>
        <Button variant="ghost" size="icon" onClick={() => phase === 'age' ? router.back() : resetFlow()} className={cn(phase === 'searching' && 'text-white hover:bg-white/20 hover:text-white')}>
          <ArrowLeft />
        </Button>
        <h1 className={cn("text-xl font-bold text-primary ml-4", phase === 'searching' && 'text-white/80')}>Conoce por Texto</h1>
      </header>
      <main className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </main>
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Advertencia de Edad</AlertDialogTitle>
            <AlertDialogDescription>
              Estás intentando conectar con una franja de edad diferente a la tuya (menor de edad). ¿Estás segurx de que quieres continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAge(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWarning}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
