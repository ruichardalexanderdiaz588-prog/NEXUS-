
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageSquare, User, PlusCircle, Bell, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/hooks/use-app-store";

const navItems = [
  { href: "/home", icon: Home, label: "Inicio" },
  { href: "/discover", icon: Compass, label: "Descubre" },
  { isCreateButton: true },
  { href: "/chats", icon: MessageSquare, label: "Chats" },
  { href: "/profile", icon: User, label: "Perfil" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { notifications } = useAppStore(); 

  // Don't render the nav on these pages
  const hiddenPaths = ['/create-post', '/create-story', '/zlive'];
  if (hiddenPaths.some(path => pathname.startsWith(path))) {
    return null;
  }
  
  const hasUnreadChatActivity = notifications.some(n => !n.read && (n.type === 'chat_request'));
  const hasUnreadProfileActivity = notifications.some(n => !n.read && (n.type !== 'chat_request'));


  // Special styling for the home page to make the nav transparent
  const isHomePage = pathname === '/home';

  return (
    <nav className={cn(
        "fixed bottom-0 left-0 right-0 h-20 z-50",
        isHomePage 
            ? "bg-transparent"
            : "bg-card border-t-2 border-border/80 shadow-[0_-5px_15px_rgba(0,0,0,0.5),_0_0_10px_hsl(var(--primary)/0.5)]"
    )}>
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {navItems.map((item, index) => {
          if (item.isCreateButton) {
            return (
              <div key="create-button" className="flex-1 flex justify-center items-center">
                 <Link href="/create-post" className="block">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl font-light shadow-lg transition-all transform hover:scale-105 animate-tricolor-gradient">
                      +
                    </div>
                </Link>
              </div>
            );
          }

          const isActive = pathname.startsWith(item.href!);
          const Icon = item.icon!;

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full transition-all transform hover:translate-y-[-2px] text-xs",
                isHomePage
                  ? "text-white/80"
                  : "text-muted-foreground hover:text-foreground",
                isActive && !isHomePage ? "text-primary text-glow-primary" : "",
                isActive && isHomePage ? "text-white font-bold" : ""
              )}
            >
              <Icon className="h-7 w-7 mb-1" />
              <span>{item.label}</span>
              {item.href === '/chats' && hasUnreadChatActivity && (
                  <div className="absolute top-2 right-4 w-3 h-3 bg-destructive rounded-full border-2 border-card animate-pulse" />
              )}
               {item.href === '/profile' && (
                  <div className="absolute top-2 right-4">
                    <Bell className={cn("h-4 w-4", hasUnreadProfileActivity ? "text-destructive animate-pulse" : "text-transparent")} />
                  </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
