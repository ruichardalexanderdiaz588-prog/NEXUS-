
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Type, Ghost } from "lucide-react";
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

type SearchPhase = "letter" | "age" | "orientation" | "no-results";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
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

export default function AlphabetSearchPage() {
  const [phase, setPhase] = useState<SearchPhase>("letter");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const router = useRouter();

  const handleSelect = (setter: (val: string) => void, nextPhase: SearchPhase, value: string) => {
    setter(value);
    setPhase(nextPhase);
  };
  
  const handleAgeSelect = (ageKey: string) => {
    setSelectedAge(ageKey);
     if (ageKey === 'menor') { // Simulating current user is 'joven'
      setShowWarning(true);
    } else {
      setPhase("orientation");
    }
  }

  const handleConfirmWarning = () => {
    setShowWarning(false);
    setPhase("orientation");
  }

  const handleOrientationSelect = (orientationKey: string) => {
     // For this prototype, we immediately go to no-results
    setPhase("no-results");
  }

  const resetFlow = () => {
    setSelectedLetter(null);
    setSelectedAge(null);
    setPhase("letter");
  };

  const getTitle = () => {
    switch (phase) {
      case "letter": return "Selecciona la letra inicial";
      case "age": return "Elige un rango de edad";
      case "orientation": return "¿Qué orientación buscas?";
      default: return "";
    }
  }

  return (
    <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
      <header className="p-4 border-b border-border flex items-center sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <Button variant="ghost" size="icon" onClick={() => phase === 'letter' ? router.back() : resetFlow()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-xl font-bold text-primary ml-4">Conoce por Letras Z</h1>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <AnimatePresence mode="wait">
          {phase !== "no-results" ? (
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl"
            >
              <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
              {phase === 'letter' && (
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">
                  {alphabet.map(letter => (
                    <Button key={letter} variant="outline" size="icon" onClick={() => handleSelect(setSelectedLetter, "age", letter)}>{letter}</Button>
                  ))}
                </div>
              )}
              {phase === 'age' && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
                    {ageRanges.map(age => (
                      <Button key={age.key} variant="outline" size="lg" onClick={() => handleAgeSelect(age.key)}>{age.label}</Button>
                    ))}
                  </div>
              )}
               {phase === 'orientation' && (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
                    {orientations.map(ori => (
                      <Button key={ori.key} variant="outline" size="lg" onClick={() => handleOrientationSelect(ori.key)}>{ori.label}</Button>
                    ))}
                  </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Ghost className="w-24 h-24 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold">¡Ups... aún no hay almas que resuenen!</h2>
              <p className="text-muted-foreground mt-2 mb-6">Intenta con otros filtros o espera a que nuevas almas se unan.</p>
              <Button onClick={resetFlow}>Buscar de Nuevo</Button>
            </motion.div>
          )}
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
