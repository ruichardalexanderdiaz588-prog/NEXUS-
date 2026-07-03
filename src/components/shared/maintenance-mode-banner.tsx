
"use client";

import { useAppStore } from "@/hooks/use-app-store";
import { X, AlertTriangle, Ban } from "lucide-react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default function AccountStatusBanner() {
    const { appStatus, userProfile } = useAppStore();
    const [isVisible, setIsVisible] = useState(true);

    const bannerContent = useMemo(() => {
        if (!userProfile) return null;

        if (userProfile.isBlocked) {
            return {
                type: 'blocked',
                message: `Tu cuenta ha sido bloqueada. Motivo: ${userProfile.blockReason || 'No especificado'}. Contacta a nexusapp@soporte.`,
                icon: Ban
            };
        }

        if (userProfile.isDisabled && userProfile.disabledUntil && new Date() < userProfile.disabledUntil) {
             return {
                type: 'disabled',
                message: `Tu cuenta está inhabilitada hasta ${formatDistanceToNow(userProfile.disabledUntil, { addSuffix: true, locale: es })}.`,
                icon: Ban
            };
        }

        const isAdmin = userProfile.email === 'alexanderdiazcruz@gmail.com';
        if (appStatus.isMaintenanceModeEnabled && !isAdmin) {
             return {
                type: 'maintenance',
                message: "La aplicación está en mantenimiento. Algunas funciones pueden estar limitadas.",
                icon: AlertTriangle
            };
        }

        return null;
    }, [appStatus, userProfile]);

    if (!bannerContent || !isVisible) {
        return null;
    }

    const Icon = bannerContent.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-destructive text-destructive-foreground p-3 text-center text-sm font-semibold flex items-center justify-center gap-4 z-50 relative"
            >
                <Icon className="w-5 h-5" />
                <span>{bannerContent.message}</span>
                <button onClick={() => setIsVisible(false)} className="hover:bg-destructive-foreground/20 p-1 rounded-full">
                    <X className="w-5 h-5" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
