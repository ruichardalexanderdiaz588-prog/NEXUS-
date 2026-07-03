
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Smartphone, Laptop, Tablet, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";

export default function SecuritySettingsPage() {
    const { toast } = useToast();
    const { changePassword } = useAppStore();

    const handleAction = () => {
        toast({
            title: "Función no implementada",
            description: "Esta función de seguridad estará disponible en futuras actualizaciones.",
        });
    }

    const handleLogoutAll = () => {
        toast({
            title: "Cerrando otras sesiones...",
            description: "Para cerrar sesión en todos los demás dispositivos, por favor cambia tu contraseña en la página de 'Cuenta'.",
        });
    }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Autenticación de Dos Factores (2FA)</CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta. Al iniciar sesión,
            se te pedirá un código de autenticación además de tu contraseña. (Función no implementada)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <h3 className="font-semibold">Activar 2FA</h3>
              <p className="text-sm text-muted-foreground">
                Usa una app de autenticación (ej. Google Authenticator).
              </p>
            </div>
            <Switch id="2fa-switch" onCheckedChange={handleAction} disabled />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">La seguridad es primordial en el universo Nexus.</p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesiones Activas</CardTitle>
          <CardDescription>
            Aquí puedes ver dónde has iniciado sesión con tu cuenta de Nexus.
            Para cerrar una sesión que no reconozcas, cambia tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Smartphone className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <p className="font-semibold">Este Dispositivo (Móvil)</p>
              <p className="text-sm text-green-500">Activa ahora</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-4 opacity-60">
            <Laptop className="w-8 h-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-semibold">Chrome en Windows 11 (Simulado)</p>
              <p className="text-sm text-muted-foreground">Madrid, España - Hace 2 días</p>
            </div>
            <Button variant="ghost" className="text-muted-foreground" disabled>Cerrar Sesión</Button>
          </div>
          <Separator />
           <div className="flex items-center gap-4 opacity-60">
            <Tablet className="w-8 h-8 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-semibold">Safari en iPad (Simulado)</p>
              <p className="text-sm text-muted-foreground">Barcelona, España - Hace 1 semana</p>
            </div>
            <Button variant="ghost" className="text-muted-foreground" disabled>Cerrar Sesión</Button>
          </div>
        </CardContent>
         <CardFooter className="border-t px-6 py-4 flex justify-end">
            <Button variant="destructive" className="flex items-center gap-2" onClick={handleLogoutAll}><LogOut /> Cerrar todas las demás sesiones</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
