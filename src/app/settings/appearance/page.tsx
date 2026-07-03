
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type Theme = "light" | "dark" | "system";

export default function AppearanceSettingsPage() {
    const { toast } = useToast();
    const [activeTheme, setActiveTheme] = useState<Theme>("dark");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // We need to wait for the component to mount to safely access localStorage
        // and avoid hydration mismatches with server-rendered content.
        setMounted(true);
        const storedTheme = localStorage.getItem("nexus-theme") as Theme | null;
        if (storedTheme) {
            setActiveTheme(storedTheme);
        } else {
            // If no theme is stored, check the system preference
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setActiveTheme(systemPrefersDark ? "dark" : "light");
        }
    }, []);

    const setTheme = (theme: Theme) => {
        setActiveTheme(theme);
        localStorage.setItem("nexus-theme", theme);
        
        // This logic would typically be handled by a theme provider like `next-themes`
        // For this demo, we'll just toggle the 'dark' class on the html element
        if (theme === 'dark' || (theme === 'system' && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        toast({
            title: "Apariencia actualizada",
            description: `El tema se ha establecido a ${theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}.`,
        })
    };
    
    if (!mounted) {
        // Render a skeleton or null while waiting for the client to mount
        // to prevent hydration mismatch.
        return null; 
    }

    const ThemeOption = ({ theme, icon: Icon, title, description }: { theme: Theme; icon: React.ElementType; title: string; description: string }) => (
        <div
            onClick={() => setTheme(theme)}
            className={cn(
                "flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all",
                activeTheme === theme 
                    ? "border-primary shadow-lg shadow-primary/20 bg-primary/10" 
                    : "border-border hover:border-primary/50"
            )}
        >
            <Icon className={cn("w-10 h-10", activeTheme === theme ? "text-primary" : "text-muted-foreground")} />
            <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>
            Personaliza cómo se ve Nexus en tu dispositivo. Tu elección se sincronizará en todas tus sesiones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <ThemeOption 
                theme="light"
                icon={Sun}
                title="Tema Claro"
                description="Una interfaz limpia y brillante, ideal para entornos iluminados."
            />
            <ThemeOption 
                theme="dark"
                icon={Moon}
                title="Tema Oscuro"
                description="Reduce el brillo para una experiencia más cómoda en la oscuridad."
            />
            <ThemeOption 
                theme="system"
                icon={Monitor}
                title="Tema del Sistema"
                description="Nexus se adaptará automáticamente a la configuración de tu dispositivo."
            />
        </CardContent>
      </Card>
    </div>
  );
}
