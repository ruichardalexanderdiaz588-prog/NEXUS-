'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/hooks/use-app-store';
import PostCard from '@/components/shared/post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { NexusLogo } from '@/components/icons';
import { MessageSquare } from 'lucide-react';

export default function HomePage() {
  const { posts, isLoadingPosts, fetchPosts } = useAppStore();

  useEffect(() => {
    const unsubscribe = fetchPosts();
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const PostSkeleton = () => (
    <div className="p-4 space-y-4 border rounded-lg bg-card/50">
        <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="aspect-video w-full" />
        <div className="flex justify-around pt-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
        </div>
    </div>
  )

  return (
    <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 bg-card p-4 border-b-2 border-primary/30 box-shadow-glow-primary flex justify-center items-center">
        <div className="flex items-center gap-3">
          <NexusLogo className="w-8 h-8" />
          <h1 className="text-xl font-bold text-primary text-glow-primary">
            Feed Z
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        {isLoadingPosts ? (
          <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 mt-10">
                <div className="bg-card/80 border-2 border-dashed border-primary/40 rounded-2xl p-10 flex flex-col items-center gap-5 max-w-md mx-auto">
                    <MessageSquare className="w-24 h-24 text-primary text-glow-primary bounce-scale" />
                    <h2 className="text-2xl font-bold text-foreground/90">¡El universo está esperando!</h2>
                    <p className="text-muted-foreground">Sé el primero en compartir una vibra. Tu publicación aparecerá aquí.</p>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
