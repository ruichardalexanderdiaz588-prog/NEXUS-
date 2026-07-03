

"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Heart, MessageCircle, Share2, MoreHorizontal, ShieldAlert, EyeOff, Link as LinkIcon,
  Pencil, Trash2, Pin, CheckSquare, Clock, Smile, Laugh, Angry, ThumbsUp, ThumbsDown,
  Brain, Zap, Sparkles, Frown, Annoyed, Star, Rocket, Trophy, Send, Repeat, Reply
} from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import type { Post, ReactionType, Comment } from "@/hooks/use-app-store";
import { useAppStore } from "@/hooks/use-app-store";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { VerifiedNexusCheck } from "../icons";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";


interface PostCardProps {
  post: Post;
  onShare?: () => void;
}

export const reactions: ReactionType[] = [
    { type: 'like', label: 'Me gusta', icon: ThumbsUp, color: 'text-primary' },
    { type: 'love', label: 'Me encanta', icon: Heart, color: 'text-red-500' },
    { type: 'haha', label: 'Me divierte', icon: Laugh, color: 'text-yellow-500' },
    { type: 'wow', label: 'Me asombra', icon: Sparkles, color: 'text-amber-400' },
    { type: 'sad', label: 'Me entristece', icon: Frown, color: 'text-blue-500' },
    { type: 'angry', label: 'Me enoja', icon: Angry, color: 'text-red-700' },
    { type: 'genius', label: 'Genial', icon: Brain, color: 'text-fuchsia-500' },
    { type: 'energy', label: '¡Energía!', icon: Zap, color: 'text-orange-500' },
    { type: 'dislike', label: 'No me gusta', icon: ThumbsDown, color: 'text-gray-500' },
    { type: 'meh', label: 'Meh', icon: Annoyed, color: 'text-stone-500' },
    { type: 'star', label: 'Favorito', icon: Star, color: 'text-yellow-400' },
    { type: 'rocket', label: '¡Al infinito!', icon: Rocket, color: 'text-teal-500' },
    { type: 'trophy', label: '¡Victoria!', icon: Trophy, color: 'text-lime-500' },
];

const PollComponent = ({ post }: { post: Post }) => {
    const isExpired = post.pollExpiresAt ? new Date() > post.pollExpiresAt : false;
    // Votación simulada por ahora. En una app real, esto vendría de la DB.
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [voted, setVoted] = useState(false);

    const handleVote = () => {
        if(selectedOption) {
            setVoted(true);
            // Lógica para enviar voto a la DB iría aquí
        }
    }

    const totalVotes = post.pollOptions?.reduce((acc, opt) => acc + opt.votes, 0) || 0;

    if (isExpired) {
        return (
            <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg border-l-4 border-destructive">
                <div className="flex items-center gap-2 text-destructive font-bold">
                    <Clock className="w-5 h-5" />
                    <span>Encuesta Finalizada</span>
                </div>
                 {post.pollOptions?.map((option, index) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold">{option.text}</span>
                                <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                    )
                 })}
            </div>
        )
    }
    
    if (voted) {
        // Mostrar resultados después de votar
        return (
             <div className="mt-4 space-y-3 p-4 bg-muted/50 rounded-lg">
                 {post.pollOptions?.map((option, index) => {
                    const percentage = totalVotes > 0 ? ((option.votes + (option.text === selectedOption ? 1 : 0)) / (totalVotes + 1)) * 100 : (option.text === selectedOption ? 100 : 0);
                    return (
                        <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-semibold">{option.text} {option.text === selectedOption ? '(Tu voto)' : ''}</span>
                                <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                    )
                 })}
             </div>
        );
    }

    // Mostrar opciones para votar
    return (
        <div className="mt-4 space-y-3">
             <RadioGroup onValueChange={setSelectedOption}>
                {post.pollOptions?.map((option, index) => (
                     <div key={index} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                        <RadioGroupItem value={option.text} id={`opt-${post.id}-${index}`} />
                        <Label htmlFor={`opt-${post.id}-${index}`} className="flex-1 cursor-pointer">{option.text}</Label>
                    </div>
                ))}
             </RadioGroup>
             <Button onClick={handleVote} disabled={!selectedOption} className="w-full">
                <CheckSquare className="mr-2" /> Votar
             </Button>
        </div>
    )
}

export const ReportDialog = ({ onReport }: { onReport: () => void }) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ShieldAlert className="mr-2 h-4 w-4" />
                    <span>Denunciar</span>
                </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Denunciar Publicación</AlertDialogTitle>
                    <AlertDialogDescription>
                        Selecciona el motivo de tu denuncia. Esta acción es confidencial.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col space-y-2">
                    {["Odio", "Acoso o bullying", "Contenido inapropiado (gore, etc.)", "Suplantación de identidad"].map(reason => (
                        <Button key={reason} variant="outline" onClick={() => onReport()}>
                            {reason}
                        </Button>
                    ))}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

const CommentSection = ({ post }: { post: Post }) => {
    const { userProfile, addComment } = useAppStore();
    const [newComment, setNewComment] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !userProfile) return;
        setIsPosting(true);
        try {
            await addComment(post.id, newComment, replyingTo || undefined);
            setNewComment("");
            setReplyingTo(null);
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setIsPosting(false);
        }
    };
    
    const renderComments = (comments: Comment[], level = 0) => {
        return comments.map((comment) => (
            <div key={comment.id} className={cn("flex items-start gap-3", level > 0 && "ml-6 mt-2")}>
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.profilePictureUrl} />
                    <AvatarFallback>{comment.author.nickname.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted/50 p-2 rounded-lg text-sm flex-1">
                    <span className="font-bold text-primary mr-2">{comment.author.nickname}</span>
                    <span>{comment.text}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-1 ml-2 text-xs" onClick={() => setReplyingTo(comment.id)}>
                        <Reply className="w-3 h-3 mr-1" />
                        Responder
                    </Button>
                    {comment.replies && comment.replies.length > 0 && renderComments(comment.replies, level + 1)}
                </div>
            </div>
        ));
    };

    return (
        <div className="px-4 py-2 mt-2 space-y-4">
             {userProfile && (
                <form onSubmit={handleCommentSubmit} className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 mt-1">
                        <AvatarImage src={userProfile.profilePictureUrl} />
                        <AvatarFallback>{userProfile.nickname.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex items-center bg-muted/50 rounded-full pr-2">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyingTo ? "Escribe tu respuesta..." : "Escribe un comentario..."}
                            className="bg-transparent border-0 resize-none py-2 px-3 focus-visible:ring-0 min-h-[20px] h-10"
                            rows={1}
                        />
                        <Button type="submit" size="icon" variant="ghost" disabled={isPosting || !newComment.trim()}>
                            <Send className="w-5 h-5 text-primary" />
                        </Button>
                    </div>
                </form>
            )}

            <div className="space-y-3">
                {renderComments(post.comments)}
                 {post.comments.length > 2 && (
                    <Button variant="link" size="sm" className="p-0 h-auto">Ver más comentarios</Button>
                 )}
            </div>
        </div>
    )
}

const renderContentWithMentionsAndHashtags = (content: string, onHashtagClick: (tag: string) => void) => {
  const parts = content.split(/([#@]\w+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      const tag = part;
      return <span key={index} className="text-blue-400 hover:underline cursor-pointer" onClick={(e) => {e.stopPropagation(); onHashtagClick(tag);}}>{part}</span>;
    }
    if (part.startsWith('@')) {
      // In the future, this could be a Link component
      return <span key={index} className="text-primary hover:underline cursor-pointer">{part}</span>;
    }
    return part;
  });
};

export default function PostCard({ post, onShare }: PostCardProps) {
  const { toast } = useToast();
  const { user, toggleReaction, addShare, deletePost, setPostContent } = useAppStore();
  const [isReactionPopoverOpen, setIsReactionPopoverOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const router = useRouter();
  const controls = useAnimation();

  if (!post || !post.author) {
    return null; // Don't render if post or author is missing
  }

  const isOwner = post.authorId === user?.uid;
  const canEdit = isOwner && (post.editCount || 0) < 8;

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
  }

  const handleRepost = async () => {
    try {
      const success = await addShare(post.id);
      if (success) {
        toast({ title: "¡Republicado!", description: "La publicación ahora aparecerá en tu perfil." });
        controls.start({ rotate: 360, transition: { duration: 0.5 } });
        if(onShare) onShare();
      }
    } catch (error: any) {
        toast({
          variant: "destructive",
          title: error.message || "Error al republicar.",
        });
    }
  };
  
  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareData = {
      title: `Publicación de ${post.author.nickname} en Nexus`,
      text: post.content,
      url: postUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        // No toast needed for successful native share
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error("Error al compartir:", error);
           toast({
            variant: "destructive",
            title: "Error al compartir",
            description: "No se pudo compartir la publicación.",
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

  const handleHashtagClick = (tag: string) => {
    setPostContent(`${tag} `);
    router.push('/create-post');
  };


  const myReaction = (post.reactions || []).find(r => r.userId === user?.uid);
  const MyReactionIcon = myReaction ? reactions.find(r => r.type === myReaction.type)?.icon || Smile : Smile;
  const myReactionColor = myReaction ? reactions.find(r => r.type === myReaction.type)?.color || 'text-muted-foreground' : 'text-muted-foreground';

  const profileLink = `/profile/${post.authorId}`;

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-2 border-border/20 shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:shadow-primary/20">
      <CardHeader className="flex flex-row items-center gap-4 p-4">
        <Link href={profileLink}>
            <Avatar className="h-12 w-12 border-2 border-accent">
              <AvatarImage src={post.author?.profilePictureUrl} alt={post.author?.nickname} />
              <AvatarFallback>{post.author?.nickname?.charAt(0)}</AvatarFallback>
            </Avatar>
        </Link>
        <div className="flex-1">
          <Link href={profileLink} className="flex items-center gap-2 group">
            <p className="font-bold text-primary text-glow-primary group-hover:underline">{post.author?.nickname}</p>
            {post.author?.isVerified && <VerifiedNexusCheck className="h-5 w-5" />}
          </Link>
          <p className="text-xs text-muted-foreground">
            {post.createdAt ? formatDistanceToNow(post.createdAt, { addSuffix: true, locale: es }) : 'hace un momento'}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
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
                <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Compartir</span>
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
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  <span>Compartir</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`)}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  <span>Copiar enlace</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {post.content && <p className="text-foreground/90 whitespace-pre-wrap" style={{color: post.textColor}}>{renderContentWithMentionsAndHashtags(post.content, handleHashtagClick)}</p>}
        {post.type === 'text' && post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mt-4 relative aspect-video">
            <Image src={post.mediaUrls[0]} alt="Post media" layout="fill" objectFit="cover" className="rounded-lg w-full" data-ai-hint="social media" />
          </div>
        )}
        {post.type === 'poll' && (
            <PollComponent post={post} />
        )}
      </CardContent>
       <CardFooter className="flex justify-around p-2 border-t border-border/20">
         <Popover open={isReactionPopoverOpen} onOpenChange={setIsReactionPopoverOpen}>
          <PopoverTrigger asChild>
             <Button variant="ghost" className={cn("flex-1 text-base hover:bg-transparent", myReactionColor)}>
               <MyReactionIcon className={cn("mr-2 h-5 w-5", myReaction && 'fill-current')} />
               {(post.reactions || []).length}
             </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-card/80 backdrop-blur-sm border-primary/30">
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
        <Button variant="ghost" onClick={() => setShowComments(!showComments)} className="text-muted-foreground flex-1 text-base">
          <MessageCircle className="mr-2 h-5 w-5" /> {post.comments.length}
        </Button>
        <Button variant="ghost" onClick={handleRepost} className="text-muted-foreground hover:text-green-500 flex-1 text-base">
          <motion.div animate={controls}>
            <Repeat className="mr-2 h-5 w-5" />
          </motion.div>
          {post.shares || 0}
        </Button>
        <Button variant="ghost" onClick={handleShare} className="text-muted-foreground hover:text-chart-3 flex-1 text-base">
          <Share2 className="mr-2 h-5 w-5" />
        </Button>
      </CardFooter>
      {showComments && <CommentSection post={post} />}
    </Card>
  );
}

    
