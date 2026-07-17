import { useState } from "react";
import { Facebook, X } from "lucide-react";
import heroImage from "@/assets/hero-aesthetics-studio.jpg";
import { AvailabilityMiniCalendar } from "@/components/AvailabilityMiniCalendar";
import { ServicesAddons } from "@/components/ServicesAddons";

const Index = () => {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", guests: "1" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Full-screen hero */}
      <div className="relative w-full min-h-screen">
        <img
          src={heroImage}
          alt="Interior de estética minimalista con iluminación cálida"
          className="absolute inset-0 w-full h-full object-cover object-center animate-ken-burns"
        />
        <div className="absolute inset-0 bg-black/45" />

        {/* Transparent header */}
        <header className="absolute top-0 left-0 right-0 z-50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between h-16 max-w-6xl mx-auto px-6 md:px-12">
            <span
              className="font-bold text-lg md:text-xl text-white shrink-0"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Maison &amp; Co.
            </span>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visítanos en Facebook"
              className="text-white/80 hover:text-white transition-colors duration-200"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* Content overlaid on hero */}
        <div className="relative flex items-center pt-24 pb-16 min-h-screen">
          <div className="w-full max-w-6xl mx-auto px-6 md:px-12">
            <div className="grid md:grid-cols-[1fr_auto] gap-10 md:gap-16 items-start">
              {/* Left column */}
              <div className="flex flex-col justify-center">
                <p className="uppercase text-sm md:text-base font-semibold tracking-[0.15em] text-white/80 mb-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                  Reservas abiertas &nbsp;&bull;&nbsp; Atención personalizada
                </p>

                <h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1] animate-fade-up"
                  style={{ fontFamily: "'Nunito', sans-serif", animationDelay: '0.5s' }}
                >
                  Agenda tu cita
                </h1>

                <p className="text-sm md:text-base leading-relaxed text-white/75 max-w-lg mb-8 animate-fade-up" style={{ animationDelay: '0.7s' }}>
                  Somos tales y nos gusta esto y el otro y queremos que te sientas así y ojalá que te guste y que puedas agendar una cita con el asistente inteligente o tú mism@ a través de el calendario en tiempo real.
                </p>

                <div className="animate-fade-up" style={{ animationDelay: '0.9s' }}>
                  <AvailabilityMiniCalendar />
                </div>
              </div>

              {/* Right column - services + contact + CTA */}
              <div className="flex flex-col gap-6 text-white pt-4 w-full md:w-[340px] animate-fade-up" style={{ animationDelay: '1.1s' }}>
                <ServicesAddons />

                <div className="leading-relaxed text-sm">
                  <p className="font-medium">Calle Olmo 742</p>
                  <p className="font-medium">Brooklyn, Nueva York</p>
                </div>

                <div className="leading-relaxed text-sm">
                  <a href="mailto:hola@maisonandco.com" className="block text-white/90 hover:text-white transition-colors">
                    hola@maisonandco.com
                  </a>
                  <a href="tel:+17185559012" className="block text-white/90 hover:text-white transition-colors">
                    (718) 555-9012
                  </a>
                </div>

                <button
                  onClick={() => { setRsvpOpen(true); setSubmitted(false); }}
                  className="inline-block px-10 py-3.5 text-sm font-semibold tracking-[0.15em] uppercase bg-white text-foreground rounded-sm hover:bg-white/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                >
                  Confirmar reserva
                </button>

                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors duration-200"
                >
                  Síguenos en <span className="underline">Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RSVP Overlay */}
      {rsvpOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-overlay-in"
            onClick={() => setRsvpOpen(false)}
          />

          <div className="relative bg-background rounded-sm shadow-xl w-full max-w-md mx-4 p-8 md:p-10 animate-dialog-in">
            <button
              onClick={() => setRsvpOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Cerrar formulario"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <h2
                  className="text-2xl font-bold text-foreground mb-3"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  ¡Cita confirmada!
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Te esperamos pronto. Enviamos la confirmación a{" "}
                  <span className="font-medium text-foreground">{formData.email}</span>.
                </p>
              </div>
            ) : (
              <>
                <h2
                  className="text-2xl font-bold text-foreground mb-1"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Confirma tu reserva
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Completa tus datos para asegurar tu horario
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="rsvp-name" className="block text-sm font-medium text-foreground mb-1.5">
                      Nombre completo
                    </label>
                    <input
                      id="rsvp-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-input rounded-sm px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="María López"
                    />
                  </div>

                  <div>
                    <label htmlFor="rsvp-email" className="block text-sm font-medium text-foreground mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      id="rsvp-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-input rounded-sm px-3 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      placeholder="maria@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="rsvp-guests" className="block text-sm font-medium text-foreground mb-1.5">
                      Personas
                    </label>
                    <select
                      id="rsvp-guests"
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full border border-input rounded-sm px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-2 px-6 py-3 text-sm font-semibold tracking-[0.1em] uppercase bg-foreground text-background rounded-sm hover:opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    Confirmar cita
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
