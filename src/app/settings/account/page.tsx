
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { Mail, Lock, AlertCircle, Trash2, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es requerida."),
  newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las nuevas contraseñas no coinciden.",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;


const deleteSchema = z.object({
  password: z.string().min(1, "La contraseña es requerida para eliminar la cuenta."),
});
type DeleteFormData = z.infer<typeof deleteSchema>;

export default function AccountSettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const { userProfile, changePassword, deactivateAccount, deleteAccount } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeactivating, setIsDeactivating] = useState(false);
    
    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
    });
    
    const deleteForm = useForm<DeleteFormData>({
        resolver: zodResolver(deleteSchema)
    });

    const onPasswordSubmit: SubmitHandler<PasswordFormData> = async (data) => {
        setIsSaving(true);
        try {
            await changePassword(data.currentPassword, data.newPassword);
            toast({
                title: "Contraseña Actualizada",
                description: "Tu contraseña ha sido cambiada con éxito. Esto cerrará la sesión en tus otros dispositivos.",
            });
            passwordForm.reset();
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
        }
    }
    
    const onDeactivateAccount = async () => {
        setIsDeactivating(true);
        try {
            await deactivateAccount();
            toast({ title: "Cuenta Desactivada", description: "Tu cuenta ha sido desactivada. Inicia sesión para reactivarla." });
            router.push('/');
        } catch (error: any) {
             toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsDeactivating(false);
        }
    };
    
    const onDeleteAccount: SubmitHandler<DeleteFormData> = async (data) => {
        setIsDeleting(true);
         try {
            await deleteAccount(data.password);
            toast({ title: "Cuenta Eliminada", description: "Tu cuenta y todos tus datos han sido eliminados permanentemente." });
            router.push('/');
        } catch (error: any) {
             toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setIsDeleting(false);
        }
    };

  return (
    <div className="space-y-8">
      <Card>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
              <CardDescription>
                Actualiza tu correo electrónico de inicio de sesión o cambia tu contraseña. 
                El nombre de usuario se cambia desde la edición de perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2"><Mail /> Correo Electrónico</Label>
                <Input id="email" type="email" defaultValue={userProfile?.email} disabled />
                <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar por ahora.</p>
              </div>
              <Separator/>
               <div className="space-y-2">
                    <h3 className="font-semibold">Cambiar Contraseña</h3>
                    <Label htmlFor="current-password" >Contraseña actual</Label>
                    <Input id="current-password" type="password" {...passwordForm.register("currentPassword")} />
                    {passwordForm.formState.errors.currentPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva contraseña</Label>
                    <Input id="new-password" type="password" {...passwordForm.register("newPassword")} />
                    {passwordForm.formState.errors.newPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
                    <Input id="confirm-password" type="password" {...passwordForm.register("confirmPassword")} />
                    {passwordForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                  </div>
            </CardContent>
             <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button>
            </CardFooter>
        </form>
      </Card>
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2"><AlertCircle /> Zona Peligrosa</CardTitle>
          <CardDescription>Estas acciones son permanentes. Procede con cuidado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 rounded-lg bg-destructive/10 cursor-pointer hover:bg-destructive/20 transition-colors">
                        <div>
                            <h3 className="font-bold">Desactivar Cuenta</h3>
                            <p className="text-sm text-muted-foreground">Tu perfil se ocultará temporalmente. Podrás reactivarlo al iniciar sesión de nuevo.</p>
                        </div>
                        <Button variant="outline" className="mt-2 sm:mt-0 border-destructive text-destructive hover:bg-destructive/20 hover:text-destructive flex-shrink-0">Desactivar Cuenta</Button>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro de desactivar tu cuenta?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tu perfil y contenido se ocultarán hasta que inicies sesión de nuevo. Nadie podrá encontrarte ni ver tus publicaciones.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={onDeactivateAccount} disabled={isDeactivating} className="bg-orange-600 hover:bg-orange-700">{isDeactivating ? 'Desactivando...' : 'Sí, desactivar'}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog>
                 <AlertDialogTrigger asChild>
                    <div className="flex flex-col sm:flex-row justify-between items-center p-4 mt-4 rounded-lg bg-destructive/10 cursor-pointer hover:bg-destructive/20 transition-colors">
                        <div>
                            <h3 className="font-bold">Eliminar Cuenta Permanentemente</h3>
                            <p className="text-sm text-muted-foreground">Todos tus datos, publicaciones y conexiones serán eliminados para siempre. Esta acción no se puede deshacer.</p>
                        </div>
                         <Button variant="destructive" className="mt-2 sm:mt-0 flex items-center gap-2 flex-shrink-0"><Trash2/> Eliminar Cuenta</Button>
                    </div>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <form onSubmit={deleteForm.handleSubmit(onDeleteAccount)}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¡Acción irreversible! ¿Estás absolutamente seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esto eliminará permanentemente tu cuenta y todos tus datos. Para confirmar, por favor, introduce tu contraseña.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="py-4">
                            <Label htmlFor="delete-password">Contraseña</Label>
                            <Input id="delete-password" type="password" {...deleteForm.register("password")} autoFocus/>
                            {deleteForm.formState.errors.password && <p className="text-sm text-destructive pt-2">{deleteForm.formState.errors.password.message}</p>}
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
                            <AlertDialogAction type="submit" disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">{isDeleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}</AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
