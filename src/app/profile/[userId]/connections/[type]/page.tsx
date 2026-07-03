
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore, UserProfile } from '@/hooks/use-app-store';
import { ArrowLeft, UserPlus, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

type ConnectionType = 'followers' | 'following' | 'views';

const ConnectionUserCard = ({ profile, isFollowing, onToggleFollow }: { profile: UserProfile, isFollowing: boolean, onToggleFollow: (userId: string) => void }) => {
  const { user } = useAppStore();
  const isSelf = user?.uid === profile.uid;

  return (
    <div className="flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/80 transition-colors">
      <Link href={`/profile/${profile.uid}`} className="flex items-center gap-4">
        <Avatar className="w-12 h-12 border-2 border-accent">
          <AvatarImage src={profile.profilePictureUrl} />
          <AvatarFallback>{profile.nickname.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-bold">{profile.nickname}</p>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </Link>
      {!isSelf && (
        <Button 
          variant={isFollowing ? 'secondary' : 'default'}
          onClick={() => onToggleFollow(profile.uid)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {isFollowing ? 'Siguiendo' : 'Seguir'}
        </Button>
      )}
    </div>
  );
};

export default function ConnectionsPage() {
  const router = useRouter();
  const params = useParams();
  const {
    getConnections,
    toggleFollow,
    userProfile, // logged in user's profile
    fetchUserProfile,
  } = useAppStore();

  const type = params.type as ConnectionType;
  const userId = params.userId as string;

  const [connections, setConnections] = useState<UserProfile[]>([]);
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const titleMap: Record<ConnectionType, string> = {
    followers: 'Seguidores',
    following: 'Siguiendo',
    views: 'Visitas',
  };
  const title = titleMap[type] || 'Conexiones';

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const profile = await fetchUserProfile(userId);
        setTargetProfile(profile);

        if (type === 'followers' || type === 'following') {
          const connectionData = await getConnections(userId, type);
          setConnections(connectionData);
        }
      } catch (error) {
        console.error("Error loading connections:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [userId, type, fetchUserProfile, getConnections]);
  
  if (type === 'views') {
     return (
        <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
            <header className="sticky top-0 z-20 bg-card p-4 border-b-2 border-primary/30 box-shadow-glow-primary flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold text-primary text-glow-primary flex items-center gap-2">
                    <Eye /> Visitas
                </h1>
            </header>
            <main className="flex-1 p-4 flex items-center justify-center">
                 <div className="text-center p-10 bg-card/70 border-2 border-dashed border-primary/40 rounded-xl shadow-lg max-w-md mx-auto my-auto flex flex-col items-center">
                    <Eye className="w-20 h-20 text-chart-3 text-glow-chart-3 mb-5" />
                    <h2 className="text-2xl font-bold">Función en Desarrollo</h2>
                    <p className="text-muted-foreground mt-2">Pronto podrás ver quién ha visitado los perfiles. ¡Mantente al tanto!</p>
                </div>
            </main>
        </div>
    );
  }

  return (
    <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-card p-4 border-b-2 border-primary/30 box-shadow-glow-primary flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary text-glow-primary flex items-center gap-2">
          <Users /> {title}
        </h1>
      </header>
      <main className="flex-1 p-4">
        <Alert variant="destructive" className="mb-4 bg-red-900/50 border-red-500/50 text-white">
            <AlertDescription className="text-center font-semibold">
              Solo {targetProfile?.nickname || 'el usuario'} puede ver el total de seguidores
            </AlertDescription>
        </Alert>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : connections.length > 0 ? (
          <div className="space-y-4">
            {connections.map((profile) => (
              <ConnectionUserCard
                key={profile.uid}
                profile={profile}
                isFollowing={userProfile?.following?.includes(profile.uid) || false}
                onToggleFollow={toggleFollow}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-10 text-muted-foreground">
            No hay {title.toLowerCase()} para mostrar.
          </div>
        )}
      </main>
    </div>
  );
}
