
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Users, Eye, AtSign, MessageCircleWarning, ShieldQuestion, Heart, KeyRound, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from '@/hooks/use-app-store';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const keywordsSchema = z.object({
  secretQuestion: z.string().min(10, 'La pregunta debe tener al menos 10 caracteres.'),
  secretAnswer: z.string().min(4, 'La respuesta debe tener al menos 4 caracteres.'),
});
type KeywordsFormData = z.infer<typeof keywordsSchema>;


const PrivacySetting = ({ icon: Icon, title, description, id, fieldKey, disabled }: { icon: React.ElementType; title: string; description: string; id: string; fieldKey: 'isPrivate' | 'showOrientation' | 'allowMentions' | 'showActivityStatus', disabled?: boolean }) => {
    const { toast } = useToast();
    const { userProfile, updateUserProfile } = useAppStore();
    
    const [isChecked, setIsChecked] = React.useState(userProfile?.[fieldKey] ?? false);

    React.useEffect(() => {
        setIsChecked(userProfile?.[fieldKey] ?? false);
    }, [userProfile, fieldKey]);
    
    const handleToggle = async (checked: boolean) => {
        setIsChecked(checked);
        try {
            await updateUserProfile({ [fieldKey]: checked });
            toast({
                title: "Ajuste de privacidad guardado",
                description: `"${title}" ha sido ${checked ? 'activado' : 'desactivado'}.`,
            });
        } catch (error) {
            setIsChecked(!checked);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'No se pudo guardar el ajuste.',
            });
        }
    };

    if (userProfile === null) return null;

    return (
        <div className="flex items-start justify-between p-4 rounded-lg transition-colors hover:bg-muted/50">
            <div className="flex items-start gap-4">
                <Icon className="w-6 h-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
            </div>
            <Switch id={id} checked={isChecked} onCheckedChange={handleToggle} disabled={disabled} />
        </div>
    );
};

export default function PrivacySettingsPage() {
  const { toast } = useToast();
  const { userProfile, updateSecurityKeywords } = useAppStore();
  const [isSavingKeywords, setIsSavingKeywords] = React.useState(false);
  
  const keywordsForm = useForm<KeywordsFormData>({
    resolver: zodResolver(keywordsSchema),
    defaultValues: {
      secretQuestion: userProfile?.securityQuestion || '',
      secretAnswer: '',
    }
  });

  React.useEffect(() => {
    if (userProfile) {
        keywordsForm.setValue('secretQuestion', userProfile.securityQuestion || '');
    }
  }, [userProfile, keywordsForm]);

  const handleKeywordsSubmit = async (data: KeywordsFormData) => {
    setIsSavingKeywords(true);
    try {
        await updateSecurityKeywords(data.secretQuestion, data.secretAnswer);
        toast({
            title: "¡Palabra Clave Guardada!",
            description: "Tu método de recuperación ha sido actualizado."
        });
        keywordsForm.reset({ secretQuestion: data.secretQuestion, secretAnswer: '' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || "No se pudo guardar." });
    } finally {
        setIsSavingKeywords(false);
    }
  };

  const handleNotImplemented = () => {
    toast({ title: "Función no implementada", description: "Esta opción estará disponible pronto." });
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Privacidad de la Cuenta</CardTitle>
          <CardDescription>Controla quién puede ver tu actividad y seguirte.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
            <PrivacySetting 
                id="private-account"
                icon={Users}
                title="Cuenta Privada"
                description="Si activas esta opción, solo las personas que apruebes podrán seguirte y ver tus publicaciones."
                fieldKey="isPrivate"
            />
             <PrivacySetting
                id="activity-status"
                icon={Eye}
                title="Estado de Actividad"
                description="Permite que las cuentas que sigues y las personas a las que envías mensajes vean cuándo estuviste activo por última vez. Si lo desactivas, tú tampoco podrás ver el de los demás."
                fieldKey="showActivityStatus"
            />
             <PrivacySetting 
                id="show-orientation"
                icon={Heart}
                title="Mostrar Orientación Sexual"
                description="Decide si tu orientación sexual es visible en tu perfil para los demás usuarios."
                fieldKey="showOrientation"
            />
        </CardContent>
      </Card>
      
      <Card>
        <form onSubmit={keywordsForm.handleSubmit(handleKeywordsSubmit)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound /> Palabras Claves de Seguridad
                {userProfile?.securityQuestion ? (
                     <Badge className="bg-green-500 text-white">Configurado</Badge>
                ) : (
                    <Badge className="bg-green-500 text-white">¡Nuevo!</Badge>
                )}
              </CardTitle>
              <CardDescription>Configura una pregunta secreta para recuperar tu cuenta si olvidas tu contraseña. Esta información es privada.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="secret-question">Tu Pregunta Secreta</Label>
                 <Textarea 
                    id="secret-question" 
                    placeholder="Ej: ¿Cuál es el nombre de mi primera mascota?" 
                    {...keywordsForm.register('secretQuestion')}
                />
                 {keywordsForm.formState.errors.secretQuestion && <p className="text-sm text-destructive">{keywordsForm.formState.errors.secretQuestion.message}</p>}
               </div>
               <div className="space-y-2">
                 <Label htmlFor="secret-answer">Tu Respuesta Clave</Label>
                 <Input 
                    id="secret-answer" 
                    type="password" 
                    placeholder="Tu respuesta secreta aquí..."
                    {...keywordsForm.register('secretAnswer')}
                />
                 {keywordsForm.formState.errors.secretAnswer && <p className="text-sm text-destructive">{keywordsForm.formState.errors.secretAnswer.message}</p>}
                 <p className="text-xs text-muted-foreground">La respuesta distingue entre mayúsculas y minúsculas.</p>
               </div>
            </CardContent>
            <CardContent>
                <Button type="submit" disabled={isSavingKeywords}>
                    <Check className="w-4 h-4 mr-2"/> {isSavingKeywords ? 'Guardando...' : 'Guardar Palabra Clave'}
                </Button>
            </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interacciones</CardTitle>
          <CardDescription>Limita las interacciones no deseadas.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
            <PrivacySetting
                id="mentions"
                icon={AtSign}
                title="Menciones"
                description="Elige quién puede mencionarte para vincular tu cuenta en sus publicaciones o comentarios."
                fieldKey="allowMentions"
            />
             <div className="flex items-start justify-between p-4 rounded-lg transition-colors hover:bg-muted/50">
                <div className="flex items-start gap-4">
                    <MessageCircleWarning className="w-6 h-6 text-primary mt-1" />
                    <div>
                        <h3 className="font-semibold">Solicitudes de Mensajes</h3>
                        <p className="text-sm text-muted-foreground">Controla si las solicitudes de mensaje de gente que no sigues van a tu bandeja de entrada o se ocultan.</p>
                    </div>
                </div>
                <Switch id="message-requests" onCheckedChange={handleNotImplemented}/>
            </div>
             <div className="flex items-start justify-between p-4 rounded-lg transition-colors hover:bg-muted/50">
                <div className="flex items-start gap-4">
                    <ShieldQuestion className="w-6 h-6 text-primary mt-1" />
                    <div>
                        <h3 className="font-semibold">Sugerir tu Cuenta a Otros</h3>
                        <p className="text-sm text-muted-foreground">Permite que tu perfil sea sugerido a personas que podrían estar interesadas en tu contenido.</p>
                    </div>
                </div>
                <Switch id="suggestions" onCheckedChange={handleNotImplemented}/>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
