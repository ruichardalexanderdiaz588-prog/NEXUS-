
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, LogIn, Mail, Lock, ShieldQuestion, CheckCircle } from "lucide-react";
import { NexusLogo } from "@/components/icons";
import { useAppStore } from "@/hooks/use-app-store";


type AuthView = "login" | "forgotPasswordEmail" | "forgotPasswordQuestion" | "forgotPasswordSuccess";

const loginSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido."),
  password: z.string().min(1, "La contraseña no puede estar vacía."),
});
type LoginFormData = z.infer<typeof loginSchema>;

const emailSchema = z.object({
    email: z.string().email("Por favor, introduce un email válido."),
});
type EmailFormData = z.infer<typeof emailSchema>;

const recoverySchema = z.object({
    answer: z.string().min(1, "La respuesta no puede estar vacía."),
    newPassword: z.string().min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden.",
  path: ["confirmPassword"],
});
type RecoveryFormData = z.infer<typeof recoverySchema>;


export function LoginFlow({ onBack }: { onBack: () => void }) {
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { loginUser, getSecurityQuestionForUser, resetPasswordWithSecurityAnswer } = useAppStore();
  
  // State for recovery flow
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  
  const emailForm = useForm<EmailFormData>({
      resolver: zodResolver(emailSchema),
      defaultValues: { email: "" }
  });

  const recoveryForm = useForm<RecoveryFormData>({
      resolver: zodResolver(recoverySchema),
      defaultValues: { answer: "", newPassword: "", confirmPassword: "" }
  });


  const processLogin: SubmitHandler<LoginFormData> = async (data) => {
    setIsLoading(true);
    const result = await loginUser(data.email, data.password);
    
    if (result.success) {
      toast({
        title: "¡Bienvenid@ de vuelta!",
        description: "Iniciando sesión en el universo Nexus...",
      });
      router.push("/home");
    } else {
      toast({
        variant: "destructive",
        title: "Error de Inicio de Sesión",
        description: result.message,
      });
      setIsLoading(false);
    }
  };

  const handleEmailSubmit: SubmitHandler<EmailFormData> = async (data) => {
      setIsLoading(true);
      try {
          const question = await getSecurityQuestionForUser(data.email);
          if (question) {
              setRecoveryEmail(data.email);
              setSecurityQuestion(question);
              setView("forgotPasswordQuestion");
          } else {
               toast({
                  variant: "destructive",
                  title: "Error",
                  description: "No se encontró un usuario con ese email o no tiene una palabra clave configurada.",
              });
          }
      } catch (error: any) {
           toast({ variant: "destructive", title: "Error", description: error.message });
      } finally {
          setIsLoading(false);
      }
  };

  const handleRecoverySubmit: SubmitHandler<RecoveryFormData> = async (data) => {
      setIsLoading(true);
      try {
          await resetPasswordWithSecurityAnswer(recoveryEmail, data.answer, data.newPassword);
          setView("forgotPasswordSuccess");
      } catch (error: any) {
          toast({ variant: "destructive", title: "Error de Recuperación", description: error.message });
      } finally {
          setIsLoading(false);
      }
  };


  const renderContent = () => {
    switch(view) {
        case "forgotPasswordEmail":
            return (
                 <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-3xl">Recuperar Contraseña</CardTitle>
                        <CardDescription>Introduce tu email para encontrar tu pregunta de seguridad.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="recovery-email" className="flex items-center gap-2 font-bold"><Mail className="w-4 h-4 text-accent"/> Email</Label>
                            <Input id="recovery-email" type="email" placeholder="tu@email.com" {...emailForm.register("email")} />
                            {emailForm.formState.errors.email && <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Buscando..." : "Buscar Pregunta"}
                        </Button>
                        <Button variant="ghost" type="button" onClick={() => setView("login")} disabled={isLoading}>
                            <ChevronLeft className="h-4 w-4 mr-1"/> Volver a Inicio de Sesión
                        </Button>
                    </CardFooter>
                 </form>
            );
        case "forgotPasswordQuestion":
             return (
                 <form onSubmit={recoveryForm.handleSubmit(handleRecoverySubmit)}>
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-3xl">Pregunta de Seguridad</CardTitle>
                        <CardDescription className="pt-2">Responde a tu pregunta secreta para continuar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg text-center">
                            <p className="font-semibold text-primary">{securityQuestion}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secret-answer" className="flex items-center gap-2 font-bold"><ShieldQuestion className="w-4 h-4 text-accent"/> Tu Respuesta Secreta</Label>
                            <Input id="secret-answer" type="password" {...recoveryForm.register("answer")} autoFocus />
                            {recoveryForm.formState.errors.answer && <p className="text-sm text-destructive">{recoveryForm.formState.errors.answer.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-password">Nueva Contraseña</Label>
                            <Input id="new-password" type="password" {...recoveryForm.register("newPassword")} />
                             {recoveryForm.formState.errors.newPassword && <p className="text-sm text-destructive">{recoveryForm.formState.errors.newPassword.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                            <Input id="confirm-password" type="password" {...recoveryForm.register("confirmPassword")} />
                             {recoveryForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{recoveryForm.formState.errors.confirmPassword.message}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Verificando..." : "Restablecer Contraseña"}
                        </Button>
                    </CardFooter>
                 </form>
            );
        case "forgotPasswordSuccess":
            return (
                 <>
                    <CardHeader className="text-center items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                        <CardTitle className="font-headline text-3xl">¡Contraseña Restablecida!</CardTitle>
                        <CardDescription>Tu contraseña ha sido actualizada con éxito.</CardDescription>
                    </CardHeader>
                    <CardContent/>
                    <CardFooter>
                         <Button onClick={() => setView("login")} className="w-full">Volver a Inicio de Sesión</Button>
                    </CardFooter>
                 </>
            );
        case "login":
        default:
          return (
            <form onSubmit={loginForm.handleSubmit(processLogin)}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <NexusLogo className="w-16 h-16 text-primary" />
                </div>
                <CardTitle className="font-headline text-3xl">¡Qué bueno verte!</CardTitle>
                <CardDescription>
                  Introduce tus credenciales para volver a conectar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="flex items-center gap-2 font-bold"><Mail className="w-4 h-4 text-accent"/> Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="tu@email.com"
                    {...loginForm.register("email")}
                  />
                  {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login" className="flex items-center gap-2 font-bold"><Lock className="w-4 h-4 text-accent"/> Contraseña</Label>
                  <Input
                    id="password-login"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                  <div className="text-right">
                    <Button variant="link" type="button" className="text-xs h-auto p-0" onClick={() => setView("forgotPasswordEmail")}>
                      ¿Olvidaste tu contraseña?
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full font-bold text-lg" size="lg" disabled={isLoading}>
                  {isLoading ? "Conectando..." : <>Iniciar Sesión <LogIn className="ml-2"/></>}
                </Button>
                 <Button variant="ghost" type="button" onClick={onBack} disabled={isLoading}>
                  <ChevronLeft className="h-4 h-4 mr-1"/> Volver
                </Button>
              </CardFooter>
            </form>
          );
    }
  }


  return (
    <motion.div
      key="login-flow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md"
    >
      <Card className="w-full bg-card/80 backdrop-blur-sm border-border/20">
        <AnimatePresence mode="wait">
            <motion.div
                key={view}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
