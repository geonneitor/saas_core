'use client';

import { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MapModal({ 
  latitude, 
  longitude, 
  apiKey 
}: { 
  latitude: number, 
  longitude: number, 
  apiKey: string 
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-full"
        onClick={() => setIsOpen(true)}
        title="Ver mapa integrado"
      >
        <MapPin size={14} />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" /> Ubicación del Negocio
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </Button>
            </div>
            
            {/* Map Frame */}
            <div className="w-full h-[400px] bg-neutral-950">
              {apiKey ? (
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}`}
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
                  Falta configurar NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
