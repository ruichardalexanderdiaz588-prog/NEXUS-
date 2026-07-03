
"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search as SearchIcon, X, ShieldAlert, Users, TowerControl, Hash, Bot, Group, Sparkles, MessageSquare, Plus, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { moderateText } from "@/ai/flows/text-moderation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppStore, UserProfile, Post, ZLiveStream, Hashtag } from "@/hooks/use-app-store";
import PostCard from "@/components/shared/post-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type SearchTab = "todo" | "cuentas" | "publicaciones" | "zlives" | "hashtags";

type SearchResults = {
  users: UserProfile[];
  posts: Post[];
  zlives: ZLiveStream[];
  hashtags: Hashtag[];
};

const tabs: { key: SearchTab, label: string, icon: React.ElementType }[] = [
  { key: "todo", label: "Todo", icon: Sparkles },
  { key: "cuentas", label: "Cuentas", icon: Users },
  { key: "publicaciones", label: "Publicaciones", icon: MessageSquare },
  { key: "zlives", label: "ZLives", icon: TowerControl },
  { key: "hashtags", label: "Hashtags", icon: Hash },
];

export default function SearchPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, searchUsers, searchPosts, searchZLives, searchHashtags } = useAppStore();

  const [query, setQuery] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<SearchTab>("todo");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [blockReason, setBlockReason] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<SearchResults | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setIsBlocked(false);
    setSearchResults(null);
    setActiveTab("todo");

    try {
      const moderationResult = await moderateText({ text: query });
      if (!moderationResult.isSafe) {
        setIsBlocked(true);
        setBlockReason(moderationResult.reason || "Término de búsqueda no permitido.");
      } else {
        const [users, posts, zlives, hashtags] = await Promise.all([
            searchUsers(query),
            searchPosts(query),
            searchZLives(query),
            searchHashtags(query),
        ]);
        setSearchResults({
          users,
          posts,
          zlives,
          hashtags,
        });
      }
    } catch (error) {
      console.error("Error during search:", error);
      toast({
        variant: "destructive",
        title: "Error de Búsqueda",
        description: "No se pudo realizar la búsqueda. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearSearch = () => {
    setQuery("");
    setIsBlocked(false);
    setSearchResults(null);
  }

  const renderContent = () => {
    if (isLoading) {
        return <Bot className="w-24 h-24 text-primary animate-spin mx-auto mt-20" style={{ animationDuration: '3s' }} />;
    }

    if (isBlocked) {
        return (
            <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="text-center p-8 bg-destructive/10 border-2 border-dashed border-destructive rounded-2xl shadow-lg max-w-md mx-auto mt-10">
                <ShieldAlert className="w-24 h-24 text-destructive mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-destructive-foreground">Búsqueda no permitida</h2>
                <p className="text-destructive-foreground/80 mt-2">{blockReason}</p>
            </motion.div>
        );
    }

    if (searchResults) {
        const hasResults = searchResults.users.length > 0 || searchResults.posts.length > 0 || searchResults.zlives.length > 0 || searchResults.hashtags.length > 0;
        if (!hasResults) {
          return (
            <div className="text-center p-10 flex flex-col items-center mt-20">
              <SearchIcon className="w-24 h-24 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">¡Ups... no hay ese tipo de contenido para "{query}", pero... puedes crearlo tú!</p>
               <Button onClick={() => router.push('/create-post')} className="mt-4">
                  <Plus className="mr-2" /> Crear
               </Button>
            </div>
          )
        }

        const renderContentForTab = (tab: SearchTab) => {
             switch (tab) {
                case 'cuentas':
                    return searchResults.users.length > 0 ? searchResults.users.map(p => (
                        <Link href={`/profile/${p.uid}`} key={p.uid} className="flex items-center gap-4 p-3 hover:bg-card/80 rounded-lg cursor-pointer">
                            <Avatar className="h-12 w-12 border-2 border-accent">
                                <AvatarImage src={p.profilePictureUrl} data-ai-hint="avatar profile" />
                                <AvatarFallback>{p.nickname[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold">{p.nickname}</p>
                                <p className="text-muted-foreground text-sm">@{p.username}</p>
                            </div>
                        </Link>
                    )) : <p className="text-muted-foreground text-center p-4">No se encontraron cuentas.</p>;
                case 'publicaciones':
                     return searchResults.posts.length > 0 ? (
                        <div className="space-y-4">
                            {searchResults.posts.map(post => <PostCard key={post.id} post={post} />)}
                        </div>
                     ) : <p className="text-muted-foreground text-center p-4">No se encontraron publicaciones.</p>;
                case 'zlives':
                    return searchResults.zlives.length > 0 ? searchResults.zlives.map(live => (
                        <Link href={`/zlive/${live.id}`} key={live.id} className="flex items-center gap-4 p-3 hover:bg-card/80 rounded-lg cursor-pointer">
                            <Avatar className="h-12 w-12 border-2 border-destructive">
                                <AvatarImage src={live.author.profilePictureUrl} />
                                <AvatarFallback>{live.author.nickname[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-bold">{live.title}</p>
                                <p className="text-sm text-muted-foreground">@{live.author.username}</p>
                            </div>
                            <Badge variant="destructive" className="flex items-center gap-1"><Wifi className="w-3 h-3"/> LIVE</Badge>
                        </Link>
                    )) : <p className="text-muted-foreground text-center p-4">No se encontraron ZLives.</p>;
                case 'hashtags':
                     return searchResults.hashtags.length > 0 ? searchResults.hashtags.map(tag => (
                        <div key={tag.id} className="flex items-center gap-4 p-3 hover:bg-card/80 rounded-lg cursor-pointer">
                           <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                             <Hash className="w-6 h-6 text-primary"/>
                           </div>
                           <div>
                            <p className="font-bold">#{tag.id}</p>
                            <p className="text-sm text-muted-foreground">{tag.useCount.toLocaleString()} publicaciones</p>
                           </div>
                        </div>
                     )) : <p className="text-muted-foreground text-center p-4">No se encontraron Hashtags.</p>;
                default: return null;
             }
        }

        return (
             <div className="space-y-6">
                {activeTab === 'todo' ? (
                    <>
                        {searchResults.users.length > 0 && (
                          <section>
                            <h3 className="section-title !text-left !mb-2 !text-base !justify-start"><Users className="w-5 h-5" /> Cuentas</h3>
                            <div className="mb-4">{renderContentForTab('cuentas')}</div>
                          </section>
                        )}
                         {searchResults.posts.length > 0 && (
                          <section>
                            <h3 className="section-title !text-left !mb-2 !text-base !justify-start"><MessageSquare className="w-5 h-5" /> Publicaciones</h3>
                            <div className="mb-4">{renderContentForTab('publicaciones')}</div>
                          </section>
                        )}
                        {searchResults.zlives.length > 0 && (
                           <section>
                            <h3 className="section-title !text-left !mb-2 !text-base !justify-start"><TowerControl className="w-5 h-5" /> ZLives</h3>
                            <div className="mb-4">{renderContentForTab('zlives')}</div>
                          </section>
                        )}
                         {searchResults.hashtags.length > 0 && (
                           <section>
                            <h3 className="section-title !text-left !mb-2 !text-base !justify-start"><Hash className="w-5 h-5" /> Hashtags</h3>
                            <div className="mb-4">{renderContentForTab('hashtags')}</div>
                          </section>
                        )}
                    </>
                ) : (
                    renderContentForTab(activeTab)
                )}
            </div>
        )
    }

    return (
        <div className="text-center p-10 flex flex-col items-center mt-20">
            <SearchIcon className="w-24 h-24 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Busca almas, temas, grupos y más en el universo Nexus.</p>
        </div>
    );
  };

  return (
    <div className="w-full min-h-svh flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm p-3 border-b-2 border-primary/30 box-shadow-glow-primary flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <form onSubmit={handleSearch} className="relative w-full">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en Nexus..."
            className="pl-10 pr-10 text-base"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={clearSearch}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </form>
      </header>
      
      {searchResults && (
        <nav className="sticky top-[69px] z-10 bg-background/80 backdrop-blur-sm flex justify-around p-2 border-b border-border/30">
          {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "rounded-full px-3 py-2 text-xs sm:text-sm transition-all duration-300 flex items-center gap-2 text-muted-foreground hover:text-primary",
                    activeTab === tab.key && "bg-gradient-to-r from-purple-600 to-accent text-foreground font-bold shadow-lg shadow-accent/30"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </Button>
              )
          })}
        </nav>
      )}

      <main className="flex-1 p-4">
        {renderContent()}
      </main>
    </div>
  );
}
