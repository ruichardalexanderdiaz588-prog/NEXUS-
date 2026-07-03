
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 prose dark:prose-invert">
      <Card>
        <CardHeader>
          <CardTitle>Política de Privacidad de Nexus</CardTitle>
          <p className="text-sm text-muted-foreground">Última actualización: 31 de Julio de 2024</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2>1. Introducción</h2>
            <p>
              Bienvenido a Nexus ("nosotros", "nuestro"). Nos comprometemos a proteger tu información personal y tu derecho a la privacidad. Si tienes alguna pregunta o inquietud sobre nuestra política, o nuestras prácticas con respecto a tu información personal, por favor contáctanos.
            </p>
          </section>
          
          <section>
            <h2>2. ¿Qué información recopilamos?</h2>
            <p>
              Recopilamos información personal que nos proporcionas voluntariamente cuando te registras en la aplicación, expresas interés en obtener información sobre nosotros o nuestros productos y servicios, cuando participas en actividades en la aplicación o cuando nos contactas.
            </p>
            <p>
              La información personal que recopilamos incluye lo siguiente:
            </p>
            <ul>
              <li><strong>Información de Identificación Personal:</strong> Nombre, nombre de usuario, correo electrónico, fecha de nacimiento.</li>
              <li><strong>Contenido del Usuario:</strong> Publicaciones, comentarios, mensajes, fotos y videos que compartes.</li>
              <li><strong>Información Técnica:</strong> Dirección IP, información del navegador, patrones de uso.</li>
            </ul>
          </section>

          <section>
            <h2>3. ¿Cómo utilizamos tu información?</h2>
            <p>
              Utilizamos la información personal recopilada a través de nuestra aplicación para una variedad de propósitos comerciales que se describen a continuación. Procesamos tu información personal para estos fines en base a nuestros intereses comerciales legítimos, para celebrar o ejecutar un contrato contigo, con tu consentimiento, y/o para cumplir con nuestras obligaciones legales.
            </p>
            <ul>
                <li>Para facilitar la creación de cuentas y el proceso de inicio de sesión.</li>
                <li>Para enviarte comunicaciones administrativas.</li>
                <li>Para proteger nuestros Servicios.</li>
                <li>Para responder a las solicitudes de los usuarios y ofrecer soporte.</li>
                <li>Para analizar tendencias de uso y mejorar la experiencia del usuario.</li>
            </ul>
          </section>

           <section>
            <h2>4. ¿Se compartirá tu información con alguien?</h2>
            <p>
              Solo compartimos y divulgamos tu información en las siguientes situaciones:
            </p>
             <ul>
                <li><strong>Cumplimiento de las Leyes:</strong> Podemos divulgar tu información cuando estemos legalmente obligados a hacerlo para cumplir con la ley aplicable, solicitudes gubernamentales, un procedimiento judicial, una orden judicial o un proceso legal.</li>
                <li><strong>Intereses Vitales y Derechos Legales:</strong> Podemos divulgar tu información cuando creamos que es necesario para investigar, prevenir o tomar medidas con respecto a posibles violaciones de nuestras políticas, sospecha de fraude, situaciones que impliquen amenazas potenciales a la seguridad de cualquier persona y actividades ilegales.</li>
                <li><strong>Proveedores de Servicios:</strong> Podemos compartir tus datos con proveedores de servicios de terceros que realizan servicios para nosotros o en nuestro nombre y requieren acceso a dicha información para hacer ese trabajo.</li>
            </ul>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
