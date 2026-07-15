'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Phone, Globe, Star, Check, ChevronRight, Building2, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { updateAiSettings, updateVisualSettings } from '@/app/[domain]/actions';

interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  types: string[];
  location: { lat: number; lng: number } | null;
}

interface PlaceDetails {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: number | null;
  openingTime: string;
  closingTime: string;
  hoursRaw: string[];
  latitude: number | null;
  longitude: number | null;
  photoRef: string | null;
  photoUrl: string | null;
}

type Step = 'search' | 'review' | 'saving' | 'done';

export function AutoConfigWizard({ 
  tenantId, 
  tenantName,
  onCompleteAction 
}: { 
  tenantId: string;
  tenantName: string;
  onCompleteAction?: () => void;
}) {
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state (pre-filled from Google Maps)
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formOpening, setFormOpening] = useState('09:00');
  const [formClosing, setFormClosing] = useState('18:00');
  const [formTagline, setFormTagline] = useState('');
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);

  const handleSearch = async () => {
    if (query.trim().length < 3) return;
    setIsSearching(true);
    setSearchError('');
    setResults([]);

    try {
      const res = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (data.error) {
        setSearchError(data.error);
      } else {
        setResults(data.results || []);
        if (data.results?.length === 0) {
          setSearchError('No se encontraron resultados. Puedes ingresar los datos manualmente.');
        }
      }
    } catch (e) {
      setSearchError('Error de conexión al buscar en Google Maps.');
    }
    setIsSearching(false);
  };

  const handleSelectPlace = async (placeId: string) => {
    setStep('review');
    try {
      const res = await fetch('/api/places/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId }),
      });
      const data: PlaceDetails = await res.json();
      setSelectedPlace(data);
      setFormName(data.name);
      setFormAddress(data.address);
      setFormPhone(data.phone);
      setFormOpening(data.openingTime);
      setFormClosing(data.closingTime);
      setFormLat(data.latitude);
      setFormLng(data.longitude);
      setFormTagline(`Bienvenido a ${data.name}. Agenda tu cita en segundos.`);
    } catch (e) {
      setSearchError('Error al obtener detalles del lugar.');
      setStep('search');
    }
  };

  const handleManualEntry = () => {
    setSelectedPlace(null);
    setFormName(tenantName || '');
    setFormAddress('');
    setFormPhone('');
    setFormOpening('09:00');
    setFormClosing('18:00');
    setFormLat(null);
    setFormLng(null);
    setFormTagline('Bienvenido. Agenda tu cita en segundos.');
    setStep('review');
  };

  const handleSave = async () => {
    setStep('saving');
    startTransition(async () => {
      try {
        // Guardar settings visuales
        await updateVisualSettings(tenantId, {
          brand_tagline: formTagline,
        });

        // Guardar settings de IA con datos del negocio
        await updateAiSettings(tenantId, {
          ai_prompt: `Eres el asistente virtual de ${formName}. 
Ubicación: ${formAddress}. 
Teléfono: ${formPhone}. 
Horario: ${formOpening} a ${formClosing}.
Ayuda a los clientes a agendar citas de manera profesional y amable.`,
        });

        // Actualizar nombre del tenant si cambió
        if (formName && formName !== tenantName) {
          try {
            const res = await fetch('/api/tenants/rename', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tenantId, name: formName }),
            });
            if (!res.ok) console.error('Error renaming tenant:', res.status);
          } catch (e) {
            console.error('Error renaming tenant:', e);
          }
        }

        // Actualizar ubicación en business_settings
        try {
          await fetch('/api/tenants/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              tenantId, 
              lat: formLat, 
              lng: formLng, 
              address: formAddress, 
              phone: formPhone, 
              openingTime: formOpening, 
              closingTime: formClosing 
            }),
          });
        } catch (e) {
          console.error('Error saving location:', e);
        }

        setStep('done');
        setTimeout(() => {
          onCompleteAction?.();
        }, 1500);
      } catch (e) {
        console.error('Error saving config:', e);
        setStep('review');
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gold-primary/20 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-gold-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Auto-Configuración del Negocio</h3>
          <p className="text-sm text-muted-foreground">
            Busca tu negocio en Google Maps o ingresa los datos manualmente
          </p>
        </div>
      </div>

      {/* Paso 1: Search */}
      {step === 'search' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar negocio por nombre o dirección..."
                className="w-full pl-10 pr-4 py-3 bg-surface-container border border-border rounded-xl text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={query.trim().length < 3 || isSearching}
              className="px-5 py-3 bg-gold-primary text-black font-bold rounded-xl text-sm disabled:opacity-50 hover:brightness-110 transition-all flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Buscar
            </button>
          </div>

          {/* Error */}
          {searchError && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Resultados encontrados
                </p>
                {results.map((place) => (
                  <button
                    key={place.placeId}
                    onClick={() => handleSelectPlace(place.placeId)}
                    className="w-full text-left p-4 bg-surface-container border border-border rounded-xl hover:border-gold-primary/50 hover:bg-gold-primary/5 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gold-primary shrink-0" />
                          {place.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {place.address}
                        </p>
                        {place.rating && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400" />
                            {place.rating}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Manual Entry Option */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 text-xs text-muted-foreground">o</span>
            </div>
          </div>

          <button
            onClick={handleManualEntry}
            className="w-full p-4 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-gold-primary/50 hover:text-gold-primary transition-all"
          >
            Ingresar datos manualmente
          </button>
        </motion.div>
      )}

      {/* Paso 2: Review & Edit */}
      {step === 'review' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {selectedPlace?.photoUrl && (
            <div className="w-full h-32 rounded-xl overflow-hidden bg-surface-container">
              <img 
                src={selectedPlace.photoUrl} 
                alt="Foto del lugar"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Nombre del Negocio
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-border rounded-lg text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Teléfono
              </label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                className="w-full px-3 py-2.5 bg-surface-container border border-border rounded-lg text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Dirección
              </label>
              <input
                type="text"
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-border rounded-lg text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Horario Apertura
              </label>
              <input
                type="time"
                value={formOpening}
                onChange={(e) => setFormOpening(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-border rounded-lg text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> Horario Cierre
              </label>
              <input
                type="time"
                value={formClosing}
                onChange={(e) => setFormClosing(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-container border border-border rounded-lg text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-all"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1">
                Mensaje de Bienvenida (Tagline)
              </label>
              <input
                type="text"
                value={formTagline}
                onChange={(e) => setFormTagline(e.target.value)}
                placeholder="Ej: El mejor servicio de la ciudad..."
                className="w-full px-3 py-2.5 bg-surface-container border border-border rounded-lg text-sm focus:border-gold-primary focus:ring-1 focus:ring-gold-primary/30 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep('search')}
              className="px-5 py-3 bg-surface-container border border-border rounded-xl text-sm hover:bg-surface-bright transition-all"
            >
              ← Atrás
            </button>
            <button
              onClick={handleSave}
              disabled={!formName.trim() || isPending}
              className="flex-1 px-5 py-3 bg-gold-primary text-black font-bold rounded-xl text-sm disabled:opacity-50 hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Guardar Configuración
            </button>
          </div>
        </motion.div>
      )}

      {/* Paso 3: Saving */}
      {step === 'saving' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <Loader2 className="w-12 h-12 text-gold-primary animate-spin mb-4" />
          <p className="text-lg font-medium">Guardando configuración...</p>
          <p className="text-sm text-muted-foreground mt-1">Tu negocio está siendo preconfigurado</p>
        </motion.div>
      )}

      {/* Paso 4: Done */}
      {step === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="text-lg font-bold">¡Configuración Guardada!</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formName} está listo para recibir clientes.
          </p>
        </motion.div>
      )}
    </div>
  );
}
