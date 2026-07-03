
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Camera, Save, User, AtSign, MapPin, Quote, Hash, Sparkles, X, Plus, Upload, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { NexusLogo } from "@/components/icons";
import { useAppStore } from "@/hooks/use-app-store";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInDays } from 'date-fns';
import { uploadToCloudinary } from "@/lib/cloudinary";

const USERNAME_CHANGE_COOLDOWN_DAYS = 8;

export default function EditProfilePage() {
    const { toast } = useToast();
    const router = useRouter();
    const { user, userProfile, fetchUserProfile, updateUserProfile, isLoadingProfile } = useAppStore();
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state
    const [nickname, setNickname] = useState('');
    const [username, setUsername] = useState('');
    const [slogan, setSlogan] = useState('');
    const [location, setLocation] = useState('');
    const [interests, setInterests] = useState<string[]>([]);
    const [newInterest, setNewInterest] = useState("");
    const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
    const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isLoadingProfile && !user) {
            router.push('/');
        }
        if (user && !userProfile && !isLoadingProfile) {
            fetchUserProfile(user.uid);
        }
    }, [user, userProfile, isLoadingProfile, fetchUserProfile, router]);
    
    useEffect(() => {
        if (userProfile) {
            setNickname(userProfile.nickname || '');
            setUsername(userProfile.username || '');
            setSlogan(userProfile.slogan || '');
            setLocation(userProfile.location || '');
            setInterests(userProfile.interests || []);
            setProfilePicPreview(userProfile.profilePictureUrl);
        }
    }, [userProfile]);

    const usernameCooldownInfo = useMemo(() => {
        if (!userProfile?.usernameLastChanged) {
            return { canChange: true, daysRemaining: 0 };
        }
        const lastChanged = new Date(userProfile.usernameLastChanged);
        const daysSinceChange = differenceInDays(new Date(), lastChanged);
        
        if (daysSinceChange >= USERNAME_CHANGE_COOLDOWN_DAYS) {
            return { canChange: true, daysRemaining: 0 };
        }
        
        const daysRemaining = USERNAME_CHANGE_COOLDOWN_DAYS - daysSinceChange;
        return { canChange: false, daysRemaining };
    }, [userProfile?.usernameLastChanged]);

    const handleAddInterest = () => {
        if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
            setInterests([...interests, newInterest.trim()]);
            setNewInterest("");
        }
    }

    const handleRemoveInterest = (interestToRemove: string) => {
        setInterests(interests.filter(i => i !== interestToRemove));
    }

    const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfilePicPreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        if (!nickname.trim() || !username.trim()) {
            toast({ variant: 'destructive', title: "Campos requeridos", description: "Nombre y nombre de usuario no pueden estar vacíos."});
            return;
        }

        setIsSaving(true);
        
        try {
            let profilePictureUrl = userProfile?.profilePictureUrl || "";
            if (profilePicFile) {
                profilePictureUrl = await uploadToCloudinary(profilePicFile, "avatars/");
            }

            const updatedData = {
                nickname,
                username,
                slogan,
                location,
                interests,
                profilePictureUrl,
                searchableInterests: interests.map(i => i.toLowerCase()),
            };
            
            await updateUserProfile(updatedData);
            
            toast({
                title: "💾 Perfil Actualizado",
                description: "Tus cambios han sido guardados con éxito.",
            });
            router.push("/profile");
        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast({ variant: 'destructive', title: "Error", description: error.message || "No se pudieron guardar los cambios."})
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoadingProfile || !userProfile) {
        return <EditProfileSkeleton />;
    }
    
    const getButtonText = () => {
        if (isSaving) {
            return "Guardando...";
        }
        return <><Save className="w-5 h-5 mr-2"/> Guardar Cambios</>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <Card>
                <CardHeader>
                    <CardTitle>Información Pública</CardTitle>
                    <CardDescription>Esta información será visible para otros en Nexus.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <Avatar className="w-32 h-32 border-4 border-primary">
                                <AvatarImage src={profilePicPreview || undefined} alt="User Avatar" />
                                <AvatarFallback><NexusLogo className="w-16 h-16 text-primary" /></AvatarFallback>
                            </Avatar>
                             <input id="profile-pic-upload" type="file" ref={fileInputRef} onChange={handleProfilePicSelect} accept="image/*" className="sr-only" disabled={isSaving} />
                            <Button size="icon" className="absolute bottom-1 right-1 rounded-full w-8 h-8" disabled={isSaving} onClick={() => fileInputRef.current?.click()}>
                                <Camera className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="flex items-center gap-2"><User /> Nombre</Label>
                            <Input id="name" value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={isSaving} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2"><AtSign /> Nombre de Usuario</Label>
                            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSaving || !usernameCooldownInfo.canChange} />
                            {!usernameCooldownInfo.canChange && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3 h-3"/> Puedes cambiarlo de nuevo en {usernameCooldownInfo.daysRemaining} día(s).</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slogan" className="flex items-center gap-2"><Quote /> Eslogan / Bio</Label>
                            <Textarea id="slogan" placeholder="Añade tu eslogan aquí" value={slogan} onChange={(e) => setSlogan(e.target.value)} disabled={isSaving}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location" className="flex items-center gap-2"><MapPin /> Ubicación</Label>
                            <Input id="location" placeholder="¿Desde qué galaxia te conectas?" value={location} onChange={(e) => setLocation(e.target.value)} disabled={isSaving} />
                        </div>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Intereses y Temas</CardTitle>
                    <CardDescription>Ayuda a otros a conectar contigo. Usa # para añadir temas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {interests.map(interest => (
                            <Badge key={interest} variant="secondary" className="text-base py-1 pl-3 pr-2">
                                {interest}
                                <Button variant="ghost" size="icon" className="w-4 h-4 ml-1 hover:bg-destructive/20 rounded-full" onClick={() => handleRemoveInterest(interest)} disabled={isSaving}>
                                    <X className="w-3 h-3"/>
                                </Button>
                            </Badge>
                        ))}
                    </div>
                     <div className="flex items-center gap-2 mt-4">
                        <Input placeholder="Añade nuevos intereses..." value={newInterest} onChange={e => setNewInterest(e.target.value)} disabled={isSaving}/>
                        <Button onClick={handleAddInterest} disabled={isSaving || interests.length >= 10}>
                          <Plus className="w-4 h-4 mr-2"/> Añadir
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Puedes añadir hasta 10 intereses.</p>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button size="lg" onClick={handleSaveChanges} disabled={isSaving || isLoadingProfile} className="bg-gradient-to-r from-green-500 to-teal-500 text-primary-foreground font-bold">
                    {getButtonText()}
                </Button>
            </div>
        </div>
    );
}

const EditProfileSkeleton = () => (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="w-32 h-32 rounded-full" />
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);
