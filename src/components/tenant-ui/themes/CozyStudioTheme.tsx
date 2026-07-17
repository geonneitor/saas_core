import { ThemeProps } from './types';
import { Calendar, MapPin, Mail, Phone } from 'lucide-react';

export function CozyStudioTheme({ tenant, settings }: ThemeProps) {
  const tagline = settings?.brand_tagline || 'Atención personalizada y exclusiva.';
  const font = settings?.font || 'sans';
  
  let heroImage = settings?.hero_image || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop';
  if (heroImage === 'default_hero.jpg' || !heroImage.startsWith('http')) {
    heroImage = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop';
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white">
      {/* Full-screen background image */}
      <img
        src={heroImage}
        alt="Fondo del estudio"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 animate-in fade-in duration-1000"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Transparent header */}
        <header className="flex items-center justify-between h-20 max-w-7xl mx-auto w-full px-6 md:px-12">
          <span className={`${font === 'serif' ? 'font-serif' : 'font-sans'} font-bold text-2xl tracking-wide`}>
            {tenant.name}
          </span>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center pt-10 pb-20">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              
              {/* Left Column: Typography & Intro */}
              <div className="flex flex-col">
                <p className="uppercase text-xs md:text-sm font-semibold tracking-widest text-white/70 mb-6 border-l-2 border-gold-primary pl-4">
                  Reservas abiertas &bull; {tagline}
                </p>

                <h1 className={`${font === 'serif' ? 'font-serif' : 'font-sans'} text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight`}>
                  Agenda tu <br/><span className="text-gold-primary">Experiencia</span>
                </h1>

                <p className="text-base md:text-lg leading-relaxed text-white/80 max-w-lg mb-10">
                  Bienvenido a {tenant.name}. Nuestro Concierge Inteligente está disponible en la esquina inferior para ayudarte a coordinar tu próxima visita en tiempo real, sin fricciones.
                </p>

                <div className="flex items-center gap-4 text-sm font-medium">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                    <Calendar className="w-4 h-4 text-gold-primary" />
                    <span>Disponibilidad 24/7</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Info & Details */}
              <div className="flex flex-col justify-center bg-black/40 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
                <h3 className={`${font === 'serif' ? 'font-serif' : 'font-sans'} text-2xl font-bold mb-8 text-white`}>
                  Información del Estudio
                </h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-gold-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-white">Ubicación Central</p>
                      <p className="text-white/60 text-sm mt-1">Ciudad Principal, Centro Histórico</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-gold-primary mt-1 shrink-0" />
                    <div>
                      <p className="font-medium text-white">Contacto Digital</p>
                      <p className="text-white/60 text-sm mt-1">hola@{tenant.name.toLowerCase().replace(/\s/g, '')}.com</p>
                    </div>
                  </div>

                  {settings.whatsapp_number && (
                    <div className="flex items-start gap-4">
                      <Phone className="w-5 h-5 text-gold-primary mt-1 shrink-0" />
                      <div>
                        <p className="font-medium text-white">Atención Vía WhatsApp</p>
                        <p className="text-white/60 text-sm mt-1">+{settings.whatsapp_number}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 pt-8 border-t border-white/10">
                  <p className="text-sm text-white/60 text-center">
                    Utiliza el asistente en la esquina para verificar horarios y confirmar tu reserva al instante.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
