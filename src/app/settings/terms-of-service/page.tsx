
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 prose dark:prose-invert">
      <Card>
        <CardHeader>
          <CardTitle>Términos y Condiciones de Uso de Nexus</CardTitle>
           <p className="text-sm text-muted-foreground">Última actualización: 31 de Julio de 2024</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <section>
            <h2>1. Aceptación de los Términos</h2>
            <p>
              Al acceder y utilizar Nexus (la "Aplicación"), usted acepta y se compromete a cumplir con estos Términos de Servicio. Si no está de acuerdo con alguna parte de los términos, no podrá utilizar nuestro servicio. Su acceso y uso del servicio están condicionados a su aceptación y cumplimiento de estos Términos.
            </p>
          </section>
          
          <section>
            <h2>2. Descripción del Servicio</h2>
            <p>
              Nexus es una plataforma de redes sociales diseñada para conectar a usuarios a través de perfiles, publicaciones, mensajería y otras funciones interactivas. El servicio es proporcionado "tal cual" y "según disponibilidad" sin garantías de ningún tipo.
            </p>
          </section>

          <section>
            <h2>3. Cuentas de Usuario</h2>
            <p>
              Cuando crea una cuenta con nosotros, debe proporcionarnos información precisa, completa y actualizada en todo momento. El no hacerlo constituye una violación de los Términos, lo que puede resultar en la terminación inmediata de su cuenta en nuestro Servicio.
            </p>
            <p>
              Usted es responsable de salvaguardar la contraseña que utiliza para acceder al Servicio y de cualquier actividad o acción bajo su contraseña.
            </p>
          </section>

           <section>
            <h2>4. Contenido del Usuario</h2>
            <p>
              Nuestro Servicio le permite publicar, enlazar, almacenar, compartir y de otra manera hacer disponible cierta información, texto, gráficos, videos u otro material ("Contenido"). Usted es responsable del Contenido que publica en el Servicio, incluida su legalidad, fiabilidad y adecuación.
            </p>
            <p>
              Al publicar Contenido en el Servicio, nos otorga el derecho y la licencia para usar, modificar, ejecutar públicamente, mostrar públicamente, reproducir y distribuir dicho Contenido en y a través del Servicio. Usted retiene todos sus derechos sobre cualquier Contenido que envíe, publique o muestre en o a través del Servicio y es responsable de proteger esos derechos.
            </p>
          </section>

           <section>
            <h2>5. Conducta del Usuario</h2>
            <p>Usted se compromete a no utilizar el Servicio para:</p>
            <ul>
                <li>Publicar contenido ilegal, dañino, amenazante, abusivo, acosador, difamatorio, vulgar, obsceno o de otro modo objetable.</li>
                <li>Suplantar a cualquier persona o entidad, o declarar falsamente o tergiversar su afiliación con una persona o entidad.</li>
                <li>Publicar contenido que infrinja cualquier patente, marca registrada, secreto comercial, derecho de autor u otros derechos de propiedad de cualquier parte.</li>
                <li>Participar en cualquier actividad que interfiera o interrumpa el Servicio.</li>
            </ul>
          </section>
          
          <section>
            <h2>6. Terminación</h2>
            <p>
              Podemos terminar o suspender su cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumple los Términos. Tras la terminación, su derecho a utilizar el Servicio cesará inmediatamente.
            </p>
          </section>
          
          <section>
            <h2>7. Cambios en los Términos</h2>
            <p>
              Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que los nuevos términos entren en vigencia. Lo que constituye un cambio material se determinará a nuestra sola discreción.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
