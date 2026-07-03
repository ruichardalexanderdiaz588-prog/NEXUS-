
"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { useAppStore } from "@/hooks/use-app-store";

export default function CreatePostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const { postContent } = useAppStore();

  const handleBackClick = () => {
    // Si hay contenido, muestra el diálogo de confirmación.
    // Esta es la base para la futura función de borradores.
    if (postContent && postContent.trim().length > 0) {
      setShowExitConfirm(true);
    } else {
      router.back();
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    // En el futuro, aquí se guardaría el borrador.
    // Por ahora, solo cerramos y volvemos.
    router.back();
  };

  return (
    <>
      <div className="flex flex-col min-h-svh bg-background text-foreground">
        <header className="sticky top-0 z-20 flex items-center gap-4 border-b-2 border-primary/30 bg-card p-4 box-shadow-glow-primary">
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-primary text-glow-primary">
            Crear
          </h1>
        </header>
        <main className="flex-1 p-4 flex flex-col">{children}</main>
      </div>

      <AlertDialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Descartar esta publicación?</AlertDialogTitle>
            <AlertDialogDescription>
              Si vuelves ahora, perderás lo que has escrito. En el futuro, podrás guardarlo como borrador desde aquí.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
