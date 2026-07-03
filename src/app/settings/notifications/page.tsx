
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Bell, Heart, MessageCircle, UserPlus, Users, Mic, Video, Share2, Globe, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NotificationSetting = ({ icon: Icon, title, id, defaultChecked = true }: { icon: React.ElementType; title: string; id: string, defaultChecked?: boolean }) => {
    const { toast } = useToast();
    const handleToggle = (checked: boolean) => {
        toast({
            title: `Notificaciones de ${title} ${checked ? 'activadas' : 'desactivadas'}.`,
        });
    };
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">{title}</span>
            </div>
            <Switch id={id} onCheckedChange={handleToggle} defaultChecked={defaultChecked}/>
        </div>
    );
};

export default function NotificationSettingsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
            <CardTitle>Pausar Notificaciones</CardTitle>
            <CardDescription>Activa esta opción para dejar de recibir notificaciones push temporalmente.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                    <Bell className="w-6 h-6 text-primary" />
                    <h3 className="font-semibold">Pausar Todas</h3>
                </div>
                <Switch id="pause-all-notifications" defaultChecked={false} />
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publicaciones, Historias y Comentarios</CardTitle>
          <CardDescription>Gestiona las notificaciones sobre tu contenido e interacciones.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <NotificationSetting icon={Heart} title="Reacciones y Likes" id="likes-notifications" />
          <NotificationSetting icon={MessageCircle} title="Comentarios" id="comments-notifications" />
          <NotificationSetting icon={Share2} title="Publicaciones compartidas" id="shares-notifications" />
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Seguimiento y Seguidores</CardTitle>
          <CardDescription>Alertas sobre tu círculo de conexiones sociales.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <NotificationSetting icon={UserPlus} title="Nuevos seguidores" id="followers-notifications" />
          <NotificationSetting icon={Users} title="Solicitudes de seguimiento aceptadas" id="accepted-requests-notifications" />
          <NotificationSetting icon={Users} title="Sugerencias de cuentas" id="account-suggestions-notifications" />
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle>Notificaciones de la App</CardTitle>
          <CardDescription>Mantente al día con las novedades de Nexus.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <NotificationSetting icon={Globe} title="Anuncios de Nexus" id="announcements-notifications" />
          <NotificationSetting icon={Trophy} title="Nuevos eventos" id="events-notifications" />
        </CardContent>
      </Card>
    </div>
  );
}
