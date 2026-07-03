
"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b-2 border-primary/30 bg-card p-4 box-shadow-glow-primary">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings">
            <ArrowLeft className="h-6 w-6" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-primary text-glow-primary">
          Términos de Servicio
        </h1>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
