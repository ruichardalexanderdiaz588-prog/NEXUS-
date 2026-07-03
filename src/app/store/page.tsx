
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/hooks/use-app-store";
import { NexusCoinIcon } from "@/components/icons";
import { Gem, Palette, Shield, Sparkles, CheckCircle2, ShoppingBag, Plus, Info } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";


export default function StorePage() {
    const { user, userProfile, isLoadingProfile, fetchUserProfile, appStatus } = useAppStore();

    useEffect(() => {
        if(user && !userProfile) {
            fetchUserProfile(user.uid);
        }
    }, [user, userProfile, fetchUserProfile]);

    if (isLoadingProfile || !userProfile) {
        return <StoreSkeleton />;
    }

    return (
        <>
            <div className="p-4 space-y-8 flex flex-col flex-1">
                <Card className="bg-gradient-to-r from-card to-primary/10 border-accent/30">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Image src={userProfile.profilePictureUrl || 'https://placehold.co/40x40.png'} alt="avatar" width={40} height={40} className="rounded-full" />
                                Billetera de {userProfile.nickname}
                            </CardTitle>
                            <CardDescription>Tus Nexuscoins disponibles para gastar.</CardDescription>
                        </div>
                         <div className="flex items-center gap-2 p-3 bg-amber-400/20 rounded-lg border border-amber-500 text-amber-400 font-bold">
                            <NexusCoinIcon className="w-8 h-8" />
                            <span className="text-xl">
                                {userProfile.nexusCoins?.toLocaleString() || 0}
                            </span>
                        </div>
                    </CardHeader>
                </Card>

                {/* --- Main Content --- */}
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-card/50 border-2 border-dashed border-primary/30 rounded-2xl">
                    <ShoppingBag className="w-24 h-24 text-primary text-glow-primary mb-6"/>
                    <h2 className="text-2xl font-bold text-foreground/90">Aún no hay creaciones en la Tienda Z</h2>
                    <p className="text-muted-foreground mt-2 mb-8">¡Sé el primero en compartir tu arte con el universo Nexus!</p>
                    
                    <Dialog>
                        <DialogTrigger asChild>
                             <Button size="lg" className="bg-gradient-to-r from-primary to-accent">
                                <Plus className="mr-2"/> Crea un Producto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-2xl"><Info className="text-primary"/> Reglas de la Tienda Z</DialogTitle>
                                <DialogDescription>
                                    Esto es lo que necesitas saber antes de crear tu primer artículo.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4 text-left">
                                <div>
                                    <h3 className="font-bold">¿Qué es la Tienda Z?</h3>
                                    <p className="text-sm text-muted-foreground">Es un mercado donde puedes vender tus propias creaciones (como marcos de perfil) a otros usuarios a cambio de Nexuscoins.</p>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-bold">¿A dónde van mis Nexuscoins?</h3>
                                    <p className="text-sm text-muted-foreground">Cuando un usuario compra tu producto, los Nexuscoins de la venta se transfieren directamente a tu billetera. ¡Es tu ganancia por tu creatividad!</p>
                                </div>
                                 <Separator />
                                <div>
                                    <h3 className="font-bold">¿Qué es la opción "Devolución"?</h3>
                                    <p className="text-sm text-muted-foreground">Si un comprador considera que tu producto tiene errores o no funciona como se describe, puede solicitar una devolución. Recibirás una notificación con su reclamo y las pruebas que aporte. Tú decides si aceptas la devolución y reembolsas los Nexuscoins.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" className="w-full">Entendido, ¡listo para crear!</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </>
    );
}

const StoreSkeleton = () => (
    <div className="p-4 space-y-8 animate-pulse">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-14 w-28 rounded-lg" />
            </CardHeader>
        </Card>
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Skeleton className="w-24 h-24 rounded-full mb-6" />
            <Skeleton className="h-7 w-72 mb-2" />
            <Skeleton className="h-5 w-64 mb-8" />
            <Skeleton className="h-12 w-48 rounded-lg" />
        </div>
    </div>
);
