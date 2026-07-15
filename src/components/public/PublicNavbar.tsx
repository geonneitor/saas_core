'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PublicNavbar() {
  const pathname = usePathname();
  const isRoot = pathname === '/';

  return (
    <header className="relative z-20 px-8 py-6 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
      <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-white flex items-center gap-2">
        GEO<span className="text-[#ff0055]">DEV</span>
        <div className="w-2 h-2 bg-[#ff0055] animate-pulse rounded-none"></div>
      </Link>
      <nav className="hidden md:flex gap-8 text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        {isRoot ? (
          <>
            <Link href="#arquitectura" className="hover:text-white transition-colors">Sistemas</Link>
            <Link href="#seguridad" className="hover:text-white transition-colors">Seguridad</Link>
            <Link href="#metricas" className="hover:text-white transition-colors">Métricas</Link>
            <Link href="#contacto" className="hover:text-white transition-colors">Contacto</Link>
          </>
        ) : (
          <Link href="/" className="hover:text-white transition-colors">← Volver</Link>
        )}
      </nav>
    </header>
  )
}
