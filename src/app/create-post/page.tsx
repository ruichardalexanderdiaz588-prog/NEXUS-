
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Dices, ListOrdered, Plus, ArrowLeft, Calendar as CalendarIcon, Clock, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const iceBreakers = [
  "Si pudieras tener cualquier superpoder, ¿cuál sería y por qué?",
  "¿Cuál es la película que podrías ver una y otra vez sin cansarte?",
  "Si el dinero no fuera un problema, ¿a qué te dedicarías?",
  "¿Cuál es el mejor consejo que te han dado?",
  "Si pudieras viajar en el tiempo, ¿irías al pasado o al futuro?",
  "¿Qué es algo que te apasione y de lo que podrías hablar durante horas?",
  "Describe tu día perfecto de principio a fin.",
  "¿Cuál es la canción que siempre te pone de buen humor?",
  "Si pudieras cenar con cualquier personaje histórico, ¿quién sería?",
  "¿Qué es lo más aventurero que has hecho?",
];

const textColors = [
    { name: 'Default', value: 'hsl(var(--foreground))' },
    { name: 'Red', value: '#FF5C5C' },
    { name: 'Orange', value: '#FFB067' },
    { name: 'Yellow', value: '#FFEE83' },
    { name: 'Green', value: '#83F383' },
    { name: 'Cyan', value: '#79F2EC' },
    { name: 'Blue', value: '#7AB2FF' },
    { name: 'Indigo', value: '#A085EE' },
    { name: 'Purple', value: '#D689EF' },
    { name: 'Pink', value: '#FF87C4' },
    { name: 'White', value: '#FFFFFF' },
];


type PostType = "text" | "poll-question" | "poll-schedule";
type PollData = {
    question: string;
    options: string[];
}

const PollQuestionEditor = ({ onNext }: { onNext: (data: PollData) => void }) => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        if (options.length < 5) {
            setOptions([...options, ""]);
        }
    };
    
    const removeOption = (indexToRemove: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, index) => index !== indexToRemove));
        }
    };

    const handleNext = () => {
        onNext({ question, options });
    }

    const isNextDisabled = !question.trim() || options.some(opt => !opt.trim());

    return (
        <div className="flex flex-col h-full text-center space-y-6 p-4 bg-card/50 rounded-lg border-2 border-primary/30">
            <div>
                <Label htmlFor="poll-question" className="text-xl font-bold text-primary">Crea tu Debate</Label>
                <Textarea
                    id="poll-question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Escribe tu pregunta aquí... ej: ¿A quién le gusta el chocolate?"
                    maxLength={80}
                    className="mt-2 min-h-[80px] text-center text-lg"
                />
                <p className="text-xs text-right text-muted-foreground mt-1">{question.length}/80</p>
            </div>
            <div className="space-y-3">
                {options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <Input
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Opción ${index + 1}`}
                        />
                         {options.length > 2 && (
                            <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="text-destructive hover:bg-destructive/20">
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
                {options.length < 5 && (
                    <Button variant="outline" onClick={addOption} className="w-full border-dashed">
                        <Plus className="mr-2 h-4 w-4" /> ¿Otra opción?
                    </Button>
                )}
            </div>
             <Button onClick={handleNext} disabled={isNextDisabled} size="lg">
                Siguiente
            </Button>
        </div>
    );
};

const PollScheduleEditor = ({ onBack, onPublish }: { onBack: () => void, onPublish: (date: Date) => void }) => {
    const [date, setDate] = useState<Date | undefined>(undefined);

    const setExpiration = (hours: number) => {
        const newDate = new Date();
        newDate.setHours(newDate.getHours() + hours);
        setDate(newDate);
    };

    return (
        <div className="flex flex-col h-full text-center space-y-6 p-4 bg-card/50 rounded-lg border-2 border-accent/30">
            <h2 className="text-xl font-bold text-accent">¿Cuándo caduca la encuesta?</h2>
            
            <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" onClick={() => setExpiration(24)}>24 Horas</Button>
                <Button variant="outline" onClick={() => setExpiration(48)}>48 Horas</Button>
                <Button variant="outline" onClick={() => setExpiration(24*7)}>7 Días</Button>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">O elige una fecha</span>
                </div>
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(d) => d < new Date()}
                    />
                </PopoverContent>
            </Popover>

            {date && (
                <div className="p-3 bg-green-500/20 text-green-300 rounded-lg text-sm font-semibold">
                    ¡Genial! Tu encuesta caducará el {format(date, "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}.
                </div>
            )}
            
            <div className="flex gap-4 mt-auto">
                <Button onClick={onBack} variant="ghost" className="w-full"><ArrowLeft className="mr-2"/> Atrás</Button>
                <Button onClick={() => date && onPublish(date)} disabled={!date} size="lg" className="w-full bg-gradient-to-r from-primary to-accent">
                    Publicar Encuesta
                </Button>
            </div>
        </div>
    );
}

export default function CreatePostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addPost, postContent, setPostContent, appStatus, userProfile } = useAppStore();

  const [postType, setPostType] = useState<PostType>("text");
  const [pollData, setPollData] = useState<PollData | null>(null);
  const [selectedColor, setSelectedColor] = useState(textColors[0].value);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  
  const handlePublish = async () => {
    if (appStatus.isMaintenanceModeEnabled) {
        toast({ variant: "destructive", title: "Modo Mantenimiento", description: "Las publicaciones están deshabilitadas temporalmente." });
        return;
    }
    
    // Regla de Menores
    if (!userProfile?.isAdult && imageFile) {
        const confirm = window.confirm("NEXUS AVISO: Al ser menor de edad, tu publicación no puede contener imágenes sugerentes, semidesnudos o ropa interior. AIMEA está monitoreando. ¿Confirmas que tu imagen es apta para todo público?");
        if (!confirm) return;
    }

    if (!postContent.trim() && !imageFile) {
      toast({
        variant: "destructive",
        title: "Vibra Vacía",
        description: "Añade texto o una imagen para publicar.",
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      await addPost({ type: 'text', content: postContent, textColor: selectedColor, mediaFile: imageFile });

      toast({
          title: "✨ ¡Vibra Publicada!",
          description: "Tu publicación ya está visible en el feed.",
      });
      
      setPostContent("");
      setImageFile(null);
      setImagePreview(null);
      router.push("/home");
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Error al Publicar",
        description: error.message || "No se pudo guardar tu vibra. Inténtalo de nuevo.",
      });
    } finally {
        setIsPublishing(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const handlePublishPoll = async (expirationDate: Date) => {
    if (appStatus.isMaintenanceModeEnabled) {
        toast({ variant: "destructive", title: "Modo Mantenimiento", description: "Las encuestas están deshabilitadas temporalmente." });
        return;
    }
    if (!pollData) return;
    setIsPublishing(true);
    
    try {
        await addPost({
            type: 'poll',
            content: pollData.question,
            pollOptions: pollData.options.map(opt => ({ text: opt, votes: 0 })),
            pollExpiresAt: expirationDate
        });
        toast({
            title: "📊 ¡Encuesta Publicada!",
            description: `Tu debate está en marcha y caducará el ${format(expirationDate, 'PPP', {locale: es})}.`,
        });
        setPostContent("");
        router.push("/home");
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error al Publicar",
            description: "No se pudo guardar tu encuesta. Inténtalo de nuevo.",
        });
    } finally {
        setIsPublishing(false);
    }
  };

  const handleIceBreaker = () => {
    const randomQuestion = iceBreakers[Math.floor(Math.random() * iceBreakers.length)];
    setPostContent(randomQuestion);
    setIsRolling(true);
    setTimeout(() => setIsRolling(false), 300);
  };
  
  const handlePollNext = (data: PollData) => {
    setPollData(data);
    setPostType("poll-schedule");
  }

  return (
    <div className="flex flex-col h-full">
      <AnimatePresence mode="wait">
        {postType === "text" && (
           <motion.div 
                key="text" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="flex-1 flex flex-col"
            >
                <div className="mb-4">
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-2 p-2">
                        {textColors.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => setSelectedColor(color.value)}
                                className={cn(
                                    "w-8 h-8 rounded-full transition-all duration-200",
                                    selectedColor === color.value ? "ring-2 ring-offset-2 ring-offset-background ring-white" : ""
                                )}
                                style={{ backgroundColor: color.value }}
                                aria-label={`Select ${color.name} color`}
                            />
                        ))}
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                </div>
                
                <Textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="¿Qué vibra quieres compartir con el universo hoy? Usa @ para mencionar..."
                  className="min-h-[250px] text-lg bg-card/50 border-2 border-border/30 focus:border-primary flex-1"
                  maxLength={2000}
                  autoFocus
                  style={{ color: selectedColor }}
                />
                
                {imagePreview && (
                  <div className="mt-4 relative w-full max-w-sm mx-auto">
                    <Image src={imagePreview} alt="Vista previa de la imagen" width={400} height={400} className="rounded-lg object-contain" />
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-7 w-7 rounded-full" onClick={removeImage}>
                      <X className="h-4 w-4"/>
                    </Button>
                  </div>
                )}

                <div className="mt-auto pt-4 space-y-6 flex flex-col items-center">
                    <div className="flex justify-around w-full max-w-xs">
                        <motion.div
                            animate={{ scale: isRolling ? [1, 1.2, 1] : 1, y: isRolling ? [0, -10, 0] : 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center gap-2 cursor-pointer text-center"
                            onClick={handleIceBreaker}
                        >
                            <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-dashed border-accent border-2">
                                <Dices className="w-8 h-8 text-accent"/>
                            </Button>
                            <p className="text-xs font-semibold text-accent">Rompe el hielo</p>
                        </motion.div>
                        <div
                            className="flex flex-col items-center gap-2 cursor-pointer text-center"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-dashed border-green-400 border-2">
                                <ImageIcon className="w-8 h-8 text-green-400"/>
                            </Button>
                            <p className="text-xs font-semibold text-green-400">Añadir Foto</p>
                            <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                        </div>
                        <div
                            className="flex flex-col items-center gap-2 cursor-pointer text-center"
                            onClick={() => setPostType("poll-question")}
                        >
                            <Button variant="outline" size="icon" className="w-16 h-16 rounded-full border-dashed border-primary border-2">
                                <ListOrdered className="w-8 h-8 text-primary"/>
                            </Button>
                            <p className="text-xs font-semibold text-primary">Crea un debate</p>
                        </div>
                    </div>

                    <Button onClick={handlePublish} disabled={isPublishing || (!postContent.trim() && !imageFile)} size="lg" className="w-full bg-gradient-to-r from-primary to-accent">
                      {isPublishing ? "Publicando..." : <>Publicar Vibra <Send className="ml-2" /></>}
                    </Button>
                </div>
           </motion.div>
        )}
        
        {postType === "poll-question" && (
            <motion.div key="poll-q" initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }}>
                <PollQuestionEditor onNext={handlePollNext} />
            </motion.div>
        )}

        {postType === "poll-schedule" && (
            <motion.div key="poll-s" initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }}>
                 <PollScheduleEditor onBack={() => setPostType("poll-question")} onPublish={handlePublishPoll}/>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}