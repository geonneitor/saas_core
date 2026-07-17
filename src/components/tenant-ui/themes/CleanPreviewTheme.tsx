import { ThemeProps } from './types';

export function CleanPreviewTheme({ tenant, settings }: ThemeProps) {
  const tagline = settings?.brand_tagline || 'Modernidad y eficiencia.';
  const font = settings?.font || 'sans';
  
  return (
    <div className={`min-h-screen bg-[#fafafa] text-black ${font === 'serif' ? 'font-serif' : 'font-sans'}`}>
      <header className="border-b border-black/10 py-6 px-10 flex justify-between items-center bg-white">
        <h1 className="text-2xl font-bold tracking-tighter">{tenant.name}</h1>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-black/60">
          <a href="#services" className="hover:text-black">Servicios</a>
          <a href="#about" className="hover:text-black">Nosotros</a>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-10 py-24 text-center">
        <div className="inline-block px-4 py-1.5 bg-black/5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
          {tagline}
        </div>
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-tight">
          La nueva era de <br/> <span className="text-black/40">gestión inteligente.</span>
        </h2>
        <p className="text-lg md:text-xl text-black/60 max-w-2xl mx-auto mb-12">
          Interactúa con nuestro asistente inteligente en la parte inferior para descubrir horarios, servicios y confirmar tu lugar en segundos.
        </p>
      </main>
    </div>
  );
}
