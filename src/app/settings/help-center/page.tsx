
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function HelpCenterPage() {
  const faqs = {
    "General": [
      {
        question: "¿Qué es Nexus?",
        answer: "Nexus es una plataforma social de nueva generación diseñada para conectar personas a través de intereses compartidos y experiencias auténticas. Nuestro objetivo es proporcionar un espacio seguro y positivo para que todos puedan expresarse."
      },
      {
        question: "¿Cómo puedo verificar mi cuenta?",
        answer: "La verificación de cuenta (con la insignia de Nexus) actualmente se otorga a figuras públicas, creadores de contenido y organizaciones para indicar su autenticidad. Estamos trabajando en un proceso de verificación más accesible para todos los usuarios en el futuro."
      }
    ],
    "Seguridad y Privacidad": [
      {
        question: "¿Cómo funciona el Modo de Mantenimiento?",
        answer: "El Modo de Mantenimiento es una herramienta exclusiva del administrador de la plataforma. Cuando se activa, todas las funciones interactivas de la aplicación (publicar, comentar, comprar, etc.) se deshabilitan temporalmente para todos los usuarios, excepto para la cuenta del administrador. Esto permite realizar actualizaciones importantes o solucionar problemas sin afectar la integridad de los datos de los usuarios. Tu cuenta y tus datos permanecen seguros durante este tiempo."
      },
      {
        question: "¿Qué pasa si desactivo mi cuenta?",
        answer: "Al desactivar tu cuenta, tu perfil y todo tu contenido se ocultarán de la plataforma. Nadie podrá encontrarte ni ver tus publicaciones. Sin embargo, tus datos no se eliminan. Puedes reactivar tu cuenta en cualquier momento simplemente iniciando sesión de nuevo."
      },
      {
        question: "¿Qué sucede al eliminar mi cuenta?",
        answer: "Eliminar tu cuenta es una acción permanente e irreversible. Todos tus datos, incluyendo perfil, publicaciones, comentarios, seguidores y Nexuscoins, serán eliminados de nuestros servidores para siempre. Por seguridad, te pediremos tu contraseña para confirmar esta acción."
      }
    ],
    "Nexuscoins y Tienda": [
        {
            question: "¿Qué son las Nexuscoins?",
            answer: "Las Nexuscoins son la moneda virtual oficial de Nexus. Puedes ganarlas reclamando tu recompensa diaria. Úsalas en la Tienda Z para comprar artículos virtuales como marcos de perfil y estilos de texto para personalizar tu experiencia. Las Nexuscoins no tienen valor monetario real y no se pueden canjear por dinero."
        },
        {
            question: "¿Cómo reclamo mi recompensa diaria?",
            answer: "Ve a tu Perfil y toca el icono de NexusCoin. Se abrirá un calendario donde podrás reclamar tu recompensa de 8 Nexuscoins una vez cada 24 horas. ¡No olvides volver cada día!"
        }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">¿Cómo podemos ayudarte?</h1>
        <p className="text-muted-foreground mt-2">Busca en nuestras preguntas frecuentes o contacta con soporte.</p>
        <div className="relative mt-4 max-w-lg mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
            <Input placeholder="Buscar en el centro de ayuda..." className="pl-10"/>
        </div>
      </div>

      {Object.entries(faqs).map(([category, items]) => (
        <Card key={category}>
            <CardHeader>
                <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full">
                    {items.map((faq, index) => (
                        <AccordionItem value={`item-${category}-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent className="prose dark:prose-invert">
                               {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
      ))}
    </div>
  );
}
