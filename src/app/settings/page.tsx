
"use client";

import {
  User,
  Shield,
  Bell,
  Palette,
  HelpCircle,
  ChevronRight,
  LogOut,
  Mail,
  Lock,
  Smartphone,
  EyeOff,
  Users,
  Moon,
  Sun,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useAppStore } from "@/hooks/use-app-store";
import { auth } from "@/lib/firebase";

const SettingsItemLink = ({ href, icon: Icon, title, description }: { href: string; icon: React.ElementType, title: string, description?: string }) => (
  <Link href={href} className="flex items-center py-4 cursor-pointer group">
    <Icon className="w-6 h-6 mr-4 text-primary group-hover:text-accent transition-colors" />
    <div className="flex-1">
      <p className="font-semibold group-hover:text-accent transition-colors">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
  </Link>
);


export default function SettingsPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = () => {
        auth.signOut().then(() => {
             toast({
                title: "Sesión cerrada",
                description: "¡Vuelve pronto al universo Nexus!",
            });
            router.push('/');
        }).catch((error) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No se pudo cerrar la sesión.",
            });
        });
    }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Sección Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> Cuenta</CardTitle>
          <CardDescription>Gestiona la información de tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingsItemLink href="/profile/edit" icon={User} title="Editar Perfil" description="Actualiza tu avatar, nombre, bio, etc." />
          <SettingsItemLink href="/settings/account" icon={Lock} title="Seguridad de la Cuenta" description="Cambia tu contraseña y gestiona la eliminación." />
           <div className="flex items-center py-4 text-destructive cursor-pointer group" onClick={handleLogout}>
            <LogOut className="w-6 h-6 mr-4" />
            <div className="flex-1">
                <p className="font-semibold">Cerrar Sesión</p>
            </div>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </CardContent>
      </Card>
      
      {/* Sección Privacidad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><EyeOff /> Privacidad</CardTitle>
          <CardDescription>Controla quién ve tu contenido y cómo te encuentran.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
           <SettingsItemLink href="/settings/privacy" icon={Users} title="Privacidad y Visibilidad" description="Decide si tu cuenta es pública o privada." />
        </CardContent>
      </Card>

      {/* Sección Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell /> Notificaciones</CardTitle>
          <CardDescription>Elige qué notificaciones quieres recibir.</CardDescription>
        </CardHeader>
        <CardContent>
            <SettingsItemLink href="/settings/notifications" icon={Bell} title="Configurar Notificaciones" description="Personaliza las alertas de la app." />
        </CardContent>
      </Card>

      {/* Sección Apariencia */}
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette /> Apariencia</CardTitle>
          <CardDescription>Personaliza el aspecto de la app.</CardDescription>
        </CardHeader>
        <CardContent>
            <SettingsItemLink href="/settings/appearance" icon={Palette} title="Temas y Colores" description="Elige entre tema claro, oscuro y más."/>
        </CardContent>
      </Card>
      
      {/* Sección Ayuda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HelpCircle /> Ayuda</CardTitle>
          <CardDescription>Encuentra soporte y recursos.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <SettingsItemLink href="/settings/help-center" icon={HelpCircle} title="Centro de Ayuda" />
          <SettingsItemLink href="/settings/terms-of-service" icon={FileText} title="Términos de Servicio" />
          <SettingsItemLink href="/settings/privacy-policy" icon={FileText} title="Política de Privacidad" />
        </CardContent>
      </Card>
    </div>
  );
}
