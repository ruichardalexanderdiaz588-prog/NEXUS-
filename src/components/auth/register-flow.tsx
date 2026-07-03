

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  User,
  AtSign,
  Lock,
  Heart,
  Sparkles,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Smile,
  Mail,
  Clapperboard,
  Palette,
  BookOpen,
  Music,
  Dumbbell,
  AlertTriangle,
  Upload,
} from "lucide-react";
import Image from "next/image";
import { createUserWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { doc, setDoc, serverTimestamp, writeBatch } from "firebase/firestore";

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
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { orientations, interests as interestOptions } from "@/lib/constants";
import { NexusLogo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarCreator } from "./avatar-creator";

const formSchema = z
  .object({
    nickname: z.string().min(2, "¡Mínimo 2 caracteres!"),
    username: z
      .string()
      .min(3, "Necesita 3+ caracteres.")
      .regex(
        /^[a-zA-Z0-9_.]+$/,
        "Solo letras, números, guiones bajos y puntos."
      ),
    dob: z.date({ required_error: "¡Necesitamos saber tu cumpleaños!" }),
    parentalConsent: z.boolean().optional(),
    orientation: z.string().min(1, "Por favor, selecciona una opción."),
    showOrientation: z.boolean().default(false),
    interests: z.array(z.string()).min(1, "¡Elige al menos un interés!"),
    customInterest: z.string().optional(),
    email: z.string().email("Se necesita un email válido."),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "Debes aceptar los términos para continuar.",
    }),
    avatarUrl: z.string().optional(),
  });

type FormData = z.infer<typeof formSchema>;

const steps = [
  { id: "01", name: "Bienvenid@", fields: ["nickname", "username"] },
  { id: "02", name: "Cumpleaños", fields: ["dob"] },
  { id: "03", name: "Identidad", fields: ["orientation", "showOrientation"] },
  { id: "04", name: "Intereses", fields: ["interests", "customInterest"] },
  { id: "05", name: "Cuenta", fields: ["email", "password", "acceptTerms"] },
  { id: "06", name: "Avatar", fields: ["avatarUrl"] },
  { id: "07", name: "Listo", fields: [] },
];

const interestIcons: { [key: string]: React.ElementType } = {
    "Crear historias": Clapperboard,
    "Arte y Creatividad": Palette,
    "Leer y Escribir": BookOpen,
    "Música": Music,
    "Fitness y Deportes": Dumbbell,
    "Ayudar a otros": Heart,
};


export function RegisterFlow({ onBack }: { onBack: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [age, setAge] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [showOrientationWarning, setShowOrientationWarning] = useState(false);
  
  const [dobState, setDobState] = useState<{year: string | null, month: string | null, day: string | null}>({
      year: null, month: null, day: null
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      username: "",
      orientation: "",
      showOrientation: false,
      interests: [],
      customInterest: "",
      email: "",
      password: "",
      acceptTerms: false,
      avatarUrl: "",
    },
  });

  const {
    handleSubmit,
    trigger,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;
  const watchedDob = watch("dob");
  const avatarUrl = watch("avatarUrl");

  useEffect(() => {
    if (dobState.year && dobState.month && dobState.day) {
        const newDob = new Date(parseInt(dobState.year), parseInt(dobState.month), parseInt(dobState.day));
        if (!isNaN(newDob.getTime())) {
            setValue('dob', newDob, { shouldValidate: true, shouldDirty: true });
        }
    }
  }, [dobState, setValue]);

  useMemo(() => {
    if (watchedDob) {
      const today = new Date();
      let calculatedAge = today.getFullYear() - watchedDob.getFullYear();
      const m = today.getMonth() - watchedDob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < watchedDob.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    }
  }, [watchedDob]);

    const processAccountCreation = async () => {
        setIsLoading(true);
        const data = getValues();
        try {
            if (auth.currentUser) {
                await auth.signOut();
            }

            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            setCreatedUser(userCredential.user);
            setIsLoading(false);
            setCurrentStep((prev) => prev + 1);
        } catch (error: any) {
            setIsLoading(false);
            console.error("Firebase registration error:", error);
            let description = "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
            if (error.code === 'auth/email-already-in-use') {
                description = "Este correo electrónico ya está registrado. Intenta iniciar sesión.";
            } else if (error.code === 'auth/weak-password') {
                description = "La contraseña es demasiado débil. Debe tener al menos 8 caracteres.";
            }
            toast({
                variant: "destructive",
                title: "Error de Registro",
                description: description,
            });
        }
    };
    
    const processFinish = async () => {
        setIsLoading(true);
        const data = getValues();
        if (!createdUser) {
             toast({ variant: 'destructive', title: 'Error', description: 'No se encontró el usuario creado. Por favor, reinicia el registro.' });
             setIsLoading(false);
             return;
        }

        try {
            const combinedInterests = [...data.interests];
            if (data.customInterest) {
                const custom = data.customInterest.split(',').map(i => i.trim()).filter(Boolean);
                combinedInterests.push(...custom);
            }
            
            const batch = writeBatch(db);
            const userDocRef = doc(db, "users", createdUser.uid);
            
            batch.set(userDocRef, {
                uid: createdUser.uid,
                nickname: data.nickname,
                username: data.username,
                username_lowercase: data.username.toLowerCase(),
                email: data.email,
                dob: data.dob,
                orientation: data.orientation,
                showOrientation: data.showOrientation,
                interests: combinedInterests,
                searchableInterests: combinedInterests.map(i => i.toLowerCase()),
                profilePictureUrl: data.avatarUrl || "",
                slogan: "Un alma libre explorando el cosmos digital.",
                location: "Vía Láctea",
                createdAt: serverTimestamp(),
                usernameLastChanged: serverTimestamp(),
                isVerified: false,
                followers: [],
                following: [],
                followerCount: 0,
                followingCount: 0,
                nexusCoins: 0,
                isPrivate: false,
                deactivated: false,
                allowMentions: true,
                showActivityStatus: true,
            });
            
            await batch.commit();

            setIsLoading(false);
            setCurrentStep((prev) => prev + 1);

        } catch (dbError) {
            console.error("Firestore save error:", dbError);
            setIsLoading(false);
            toast({
                variant: "destructive",
                title: "Error al Guardar Perfil",
                description: "No pudimos guardar los datos de tu perfil. Por favor, intenta editar tu perfil más tarde.",
            });
        }
    }


  const nextStep = async () => {
    const fields = steps[currentStep].fields as (keyof FormData)[];
    const output = await trigger(fields, { shouldFocus: true });
    if (!output) return;

    if (currentStep === 1 && age !== null && age < 13) {
      toast({
        variant: "destructive",
        title: "Restricción de Edad",
        description: "Por tu seguridad, debes tener al menos 13 años para unirte a Nexus.",
      });
      return;
    }

    if (currentStep === 4) {
      await processAccountCreation();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };
  
  const finalRedirect = () => {
    router.push("/home");
  }

  const progress = ((currentStep + 1) / (steps.length)) * 100;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: format(new Date(2000, i), 'MMMM', { locale: es })
  }));
  const daysInMonth = (year: string | null, month: string | null) => {
      if (year && month) {
          return new Date(parseInt(year), parseInt(month) + 1, 0).getDate();
      }
      return 31;
  };

  return (
    <>
      <Card className="w-full max-w-lg shadow-2xl bg-card/80 backdrop-blur-sm border-border/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep < 6 ? (
              <form onSubmit={(e) => e.preventDefault()}>
                <CardHeader>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-primary uppercase">
                      Paso {steps[currentStep].id} / 06
                    </span>
                    {currentStep > 0 && (
                      <Button variant="ghost" size="sm" type="button" onClick={prevStep} className="hidden sm:flex">
                        <ChevronLeft className="h-4 w-4 mr-1"/> Volver
                      </Button>
                    )}
                  </div>
                  <Progress value={progress} className="w-full h-2" />
                  <CardTitle className="font-headline pt-4 text-3xl">{steps[currentStep].name}</CardTitle>
                  <CardDescription>
                    {
                      [
                        "Primero lo primero... ¿cómo deberíamos llamarte?",
                        "Tu seguridad y experiencia dependen de tu edad.",
                        "Nexus es un espacio para todos. ¿Cómo te identificas?",
                        "¿Qué te apasiona? Esto nos ayuda a construir tu mundo.",
                        "Aseguremos tu lugar en el Nexus.",
                        "¡Casi list@! Añade tu toque personal.",
                        "¡Todo listo!",
                      ][currentStep]
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[300px]">
                  {currentStep === 0 && (
                    <div className="space-y-4">
                      <Controller name="nickname" control={control} render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="nickname" className="flex items-center gap-2 font-bold"><Smile className="w-4 h-4 text-accent"/> ¿Cómo deberíamos llamarte?</Label>
                            <Input id="nickname" placeholder="p.ej., Alex" {...field} onBlur={() => trigger("nickname")} />
                            {errors.nickname && <p className="text-sm text-destructive">{errors.nickname.message}</p>}
                          </div>
                      )}/>
                      <Controller name="username" control={control} render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2 font-bold"><AtSign className="w-4 h-4 text-accent" /> Elige tu nombre de usuario único</Label>
                            <Input id="username" placeholder="p.ej., alex_el_genial" {...field} onBlur={() => trigger("username")} />
                            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                            <p className="text-xs text-muted-foreground">Así es como otros te encontrarán.</p>
                          </div>
                      )}/>
                    </div>
                  )}
                  {currentStep === 1 && (
                    <div className="space-y-4 flex flex-col items-center">
                      <Label className="font-bold text-base">¿Cuál es tu fecha de nacimiento?</Label>
                      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
                          <Select onValueChange={(val) => setDobState(s => ({...s, year: val}))}>
                              <SelectTrigger><SelectValue placeholder="Año" /></SelectTrigger>
                              <SelectContent>
                                  {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <Select onValueChange={(val) => setDobState(s => ({...s, month: val}))} disabled={!dobState.year}>
                              <SelectTrigger><SelectValue placeholder="Mes" /></SelectTrigger>
                              <SelectContent>
                                  {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                              </SelectContent>
                          </Select>
                          <Select onValueChange={(val) => setDobState(s => ({...s, day: val}))} disabled={!dobState.year || !dobState.month}>
                              <SelectTrigger><SelectValue placeholder="Día" /></SelectTrigger>
                              <SelectContent>
                                  {Array.from({ length: daysInMonth(dobState.year, dobState.month) }, (_, i) => i + 1).map(d => (
                                      <SelectItem key={d} value={d.toString()}>{d}</SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                      </div>

                      {age !== null && ( <div className={cn("text-8xl font-bold font-headline transition-colors", (age < 13) ? "text-destructive" : "text-primary")}> ({age}) </div> )}
                      {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
                    </div>
                  )}
                  {currentStep === 2 && (
                     <div className="space-y-4">
                       <Controller name="orientation" control={control} render={({ field }) => (
                          <div className="space-y-2">
                             <Label htmlFor="orientation" className="font-bold">¿Cómo te identificas?</Label>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="orientation" className="py-6 text-base"><SelectValue placeholder="Selecciona tu orientación" /></SelectTrigger>
                                <SelectContent>
                                  {orientations.map((o) => (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                                </SelectContent>
                             </Select>
                             {errors.orientation && <p className="text-sm text-destructive">{errors.orientation.message}</p>}
                          </div>
                        )}/>
                      <Controller name="showOrientation" control={control} render={({ field }) => (
                          <div className="flex items-center space-x-2 pt-2">
                              <Checkbox 
                                id="showOrientation" 
                                checked={field.value} 
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                      setShowOrientationWarning(true);
                                  } else {
                                      field.onChange(false);
                                  }
                                }} 
                              />
                              <Label htmlFor="showOrientation" className="text-sm font-normal">Mostrar en mi perfil</Label>
                          </div>
                      )}/>
                    </div>
                  )}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <Label className="font-bold text-base">¿Qué te interesa?</Label>
                      <Controller name="interests" control={control} render={({ field }) => (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {interestOptions.map((interest) => {
                              const Icon = interestIcons[interest.name] || Sparkles;
                              return (
                                <div key={interest.name} className="flex items-center">
                                  <Checkbox id={interest.name} checked={field.value?.includes(interest.name)} onCheckedChange={(checked) => {
                                      const updatedInterests = checked ? [...(field.value || []), interest.name] : field.value?.filter((v) => v !== interest.name);
                                      field.onChange(updatedInterests);
                                  }} className="sr-only peer" />
                                  <Label htmlFor={interest.name} className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary peer-data-[state=checked]:shadow-lg peer-data-[state=checked]:shadow-primary/20 [&:has([data-state=checked])]:border-primary w-full cursor-pointer transition-all duration-200">
                                    <Icon className="mb-2 h-7 w-7" />
                                    <span className="text-center text-sm">{interest.name}</span>
                                  </Label>
                                </div>
                              )
                            })}
                          </div>
                      )}/>
                       {errors.interests && <p className="text-sm text-destructive">{errors.interests.message}</p>}
                       <Controller name="customInterest" control={control} render={({ field }) => (
                          <div className="space-y-2">
                            <Label htmlFor="customInterest" className="font-bold">¿Algo más? (separado por comas)</Label>
                            <Textarea id="customInterest" placeholder="Describe tus intereses únicos aquí..." {...field} />
                          </div>
                      )}/>
                    </div>
                  )}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <Controller name="email" control={control} render={({ field }) => ( <div className="space-y-2"> <Label htmlFor="email" className="flex items-center gap-2 font-bold"><Mail className="w-4 h-4 text-accent"/> Tu Email</Label> <Input id="email" type="email" placeholder="tu@ejemplo.com" {...field} onBlur={() => trigger("email")}/> {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>} </div> )}/>
                      <Controller name="password" control={control} render={({ field }) => ( <div className="space-y-2"> <Label htmlFor="password" className="flex items-center gap-2 font-bold"><Lock className="w-4 h-4 text-accent"/> Crea una Contraseña</Label> <Input id="password" type="password" {...field} /> {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>} </div> )}/>
                      <Controller name="acceptTerms" control={control} render={({ field }) => (
                          <div className="flex items-center space-x-2 pt-4">
                             <Checkbox id="acceptTerms" checked={field.value} onCheckedChange={field.onChange}/>
                             <div className="grid gap-1.5 leading-none">
                              <label htmlFor="acceptTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Acepto los términos y la política de privacidad. </label>
                            </div>
                          </div>
                      )}/>
                      {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>}
                    </div>
                  )}
                  {currentStep === 5 && (
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <AvatarCreator 
                            onAvatarExported={(url) => setValue('avatarUrl', url, { shouldValidate: true })} 
                        />
                        <p className="text-xs text-muted-foreground max-w-sm">
                            Crea un avatar 3D que te represente en el universo Nexus.
                        </p>
                         {avatarUrl && (
                            <div className="flex items-center gap-2 p-2 bg-green-500/20 text-green-300 rounded-lg">
                                <Check className="w-5 h-5"/>
                                <p className="text-sm font-semibold">¡Avatar listo para usar!</p>
                            </div>
                        )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="ghost" type="button" onClick={prevStep} disabled={isLoading}>
                      <ChevronLeft className="h-4 w-4 mr-1"/> Volver
                    </Button>
                   
                    <Button type="button" onClick={currentStep === 5 ? processFinish : nextStep} disabled={isLoading || (currentStep === 5 && !avatarUrl)}>
                        {isLoading ? (currentStep === 4 ? "Creando cuenta..." : "Guardando...") : (currentStep === 5 ? "Finalizar" : "Siguiente")} 
                        {currentStep < 5 && <ChevronRight className="h-4 w-4 ml-1" />}
                    </Button>
                </CardFooter>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center min-h-[480px] overflow-hidden relative">
                <div className="absolute inset-0">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full w-2 h-2 bg-primary confetti-fall"
                      style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2.5}s`, opacity: Math.random(), backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)` }}
                    />
                  ))}
                </div>
                <div className="relative z-10">
                   <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-30 animate-pulse blur-2xl"></div>
                      <NexusLogo className="w-40 h-40 text-primary z-10" />
                  </div>
                  <CardTitle className="font-headline text-4xl">¡GENIAL, TU CUENTA HA SIDO CREADA!</CardTitle>
                  <CardDescription className="mt-2 text-lg">
                    Bienvenid@ a Nexus, {watch("nickname") || "amig@"}. Tu viaje comienza ahora.
                  </CardDescription>
                  <Button onClick={finalRedirect} size="lg" className="mt-8">
                    Entrar a Nexus <Sparkles className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </Card>
      <AlertDialog open={showOrientationWarning} onOpenChange={setShowOrientationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Hacer pública tu orientación?</AlertDialogTitle>
            <AlertDialogDescription>
              Si continúas, tu orientación será visible para cualquier persona en tu perfil de Nexus. ¿Estás segurx de que quieres continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setValue('showOrientation', false)}>No, no mostrar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                setValue('showOrientation', true);
                setShowOrientationWarning(false);
            }}>
                Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
