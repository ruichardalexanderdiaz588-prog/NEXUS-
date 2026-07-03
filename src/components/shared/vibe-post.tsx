
"use client";

import { useState } from "react";
import type { Post } from "@/hooks/use-app-store";
import { useAppStore } from "@/hooks/use-app-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  MoreHorizontal,
  Smile,
  Share2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { reactions } from "./post-card"; // Re-use the reactions array
import { useToast } from "@/hooks/use-toast";
import { VerifiedNexusCheck } from "../icons";
import { AlertDialog, AlertDialogTrigger } from "../ui/alert-dialog";
import { ReportDialog } from "./post-card";
import { EyeOff, Link as LinkIcon, Pencil, Pin, ShieldAlert, Trash2 } from "lucide-react";

interface VibePostProps {
  post: Post;
}

export default function VibePost({ post }: VibePostProps) {
  const { user, toggleReaction, addShare, deletePost } = useAppStore();
  const { toast } = useToast();
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false);

  const isOwner = post.authorId === user?.uid;
  const canEdit = isOwner && (post.editCount || 0) < 8;

  const myReaction = (post.reactions || []).find((r) => r.userId === user?.uid);
  const MyReactionIcon = myReaction
    ? reactions.find((r) => r.type === myReaction.type)?.icon || Smile
    : Smile;
  const myReactionColor = myReaction
    ? reactions.find((r) => r.type === myReaction.type)?.color || "text-white"
    : "text-white";

  const handleReaction = (reactionType: string) => {
    if (isOwner) {
      toast({
        variant: "destructive",
        title: "Acción no permitida",
        description: "No puedes reaccionar a tu propia publicación.",
      });
      return;
    }
    toggleReaction(post, reactionType);
    setIsReactionPopoverOpen(false);
  };
  
  const handleShare = async () => {
    addShare(post.id);
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `Publicación de ${post.author.nickname} en Nexus`,
      text: post.content,
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "¡Compartido con éxito!" });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
           toast({
            variant: "destructive",
            title: "Error al compartir",
          });
        }
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      toast({
        title: "Enlace copiado",
        description: "Se ha copiado el enlace de la publicación al portapapeles.",
      });
    }
  };

  const handleReport = () => {
    toast({
        title: "Gracias por tu reporte",
        description: "Revisaremos la publicación lo antes posible.",
    });
  }

  const handleDelete = async () => {
     try {
       await deletePost(post.id);
       toast({
          variant: "destructive",
          title: "Publicación eliminada",
          description: "Tu vibra ha sido eliminada del universo Nexus.",
      });
     } catch (error) {
       toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo eliminar la publicación.",
      });
     }
  }


  return (
    <div className="relative h-full w-full flex-shrink-0 snap-center flex items-center justify-center p-4 bg-gradient-to-br from-primary via-accent to-purple-800">
      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white text-center p-8 text-shadow-lg">
          {post.content}
        </h1>
      </div>

      {/* Overlay UI */}
      <div className="absolute bottom-24 left-4 right-4 text-white">
        <div className="bg-black/30 backdrop-blur-sm p-3 rounded-xl max-h-32 overflow-y-auto">
            <div className="flex items-center gap-2 font-bold">
                <Link href={`/profile/${post.authorId}`} className="hover:underline">@{post.author.username}</Link>
                {post.author.isVerified && <VerifiedNexusCheck className="w-4 h-4 text-white" />}
            </div>
          <p className="text-sm text-white/90 whitespace-pre-wrap">{post.content}</p>
        </div>
      </div>

      {/* Vertical Actions */}
      <div className="absolute bottom-24 right-4 flex flex-col items-center gap-6 text-white">
        <Link href={`/profile/${post.authorId}`} className="relative">
          <Avatar className="w-12 h-12 border-2 border-white">
            <AvatarImage
              src={post.author.profilePictureUrl}
              alt={post.author.nickname}
            />
            <AvatarFallback>{post.author.nickname?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Link>
        
        <Popover open={isReactionPopoverOpen} onOpenChange={setIsReactionPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-12 w-12 rounded-full hover:bg-white/20", myReactionColor)}
              >
                <MyReactionIcon className={cn("w-8 h-8", myReaction && "fill-current")} />
              </Button>
              <span className="text-sm font-semibold">{(post.reactions || []).length}</span>
            </div>
          </PopoverTrigger>
          <PopoverContent side="left" className="w-auto p-2 bg-card/80 backdrop-blur-sm border-primary/30">
            <div className="flex gap-1">
              {reactions.map((reaction) => {
                const Icon = reaction.icon;
                return (
                  <motion.button
                    key={reaction.type}
                    onClick={() => handleReaction(reaction.type)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn("p-1.5 rounded-full transition-colors", reaction.color)}
                    title={reaction.label}
                  >
                    <Icon className="w-7 h-7" />
                  </motion.button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleShare}>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-white/20">
                <Share2 className="w-7 h-7" />
            </Button>
            <span className="text-sm font-semibold">{post.shares || 0}</span>
        </div>

        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-white/20">
                    <MoreHorizontal className="w-7 h-7" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 {isOwner ? (
                    <>
                        {canEdit && (
                            <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                        <Pin className="mr-2 h-4 w-4" />
                        <span>Anclar al perfil</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <EyeOff className="mr-2 h-4 w-4" />
                            <span>Privacidad</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                        </DropdownMenuItem>
                    </>
                    ) : (
                    <>
                        <ReportDialog onReport={handleReport}/>
                        <DropdownMenuItem>
                        <EyeOff className="mr-2 h-4 w-4" />
                        <span>No me interesa</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)}>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        <span>Copiar enlace</span>
                        </DropdownMenuItem>
                    </>
                    )}
            </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </div>
  );
}
