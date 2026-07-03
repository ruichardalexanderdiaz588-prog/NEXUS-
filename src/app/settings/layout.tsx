
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

// Helper para capitalizar y formatear el título desde el slug
function formatTitle(pathname: string): string {
    if (pathname === '/settings') return "Ajustes y Privacidad";
    
    const slug = pathname.split('/').pop() || '';
    const formatted = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const titleMap: { [key: string]: string } = {
        'Account': 'Cuenta',
        'Security': 'Seguridad',
        'Privacy': 'Privacidad',
        'Notifications': 'Notificaciones',
        'Appearance': 'Apariencia'
    };
    
    return titleMap[formatted] || formatted;
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = formatTitle(pathname);
  const isMainSettingsPage = pathname === '/settings';

  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b-2 border-primary/30 bg-card p-4 box-shadow-glow-primary">
        <Button variant="ghost" size="icon" asChild>
          <Link href={isMainSettingsPage ? "/profile" : "/settings"}>
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-primary text-glow-primary">
          {title}
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
