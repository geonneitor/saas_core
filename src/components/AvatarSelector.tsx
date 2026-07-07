"use client";

import { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { updateAiSettings } from '@/app/[domain]/actions';
import { AvatarSystem } from './avatars/AvatarSystem';

const AVATARS = [
  { id: 'lotito', name: 'Lotito (Clásico)' },
  { id: 'orb', name: 'Orbe Mágico (Minimalista)' },
  { id: 'cat', name: 'Gato Kawaii (Mascotas)' },
  { id: 'robot', name: 'Robot (Corporativo)' },
  { id: 'star', name: 'Estrella (Premium)' }
];

export function AvatarSelector({ tenantId, currentAvatar, isAdmin = false }: { tenantId: string, currentAvatar: string, isAdmin?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSelect = async (avatarId: string) => {
    setIsUpdating(true);
    const result = await updateAiSettings(tenantId, { ai_avatar: avatarId });
    if (!result.success) {
      alert('Error al guardar avatar: ' + JSON.stringify(result.error));
    }
    setIsUpdating(false);
    setIsOpen(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-700 text-[13px] font-bold rounded-full border border-neutral-200 cursor-default shadow-sm">
        <div className="w-5 h-5 flex items-center justify-center overflow-hidden rounded-full">
           <div className="scale-[0.4]"><AvatarSystem variant={currentAvatar as any} isActive={false} /></div>
        </div>
        <span>IA Asistente</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[13px] font-bold rounded-full transition-colors border border-neutral-200"
      >
        <Settings2 size={14} />
        <span>Personalizar IA</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 z-60 animate-in slide-in-from-top-2 duration-200">
          <div className="p-2 pb-3 mb-2 border-b border-neutral-100">
            <h4 className="text-[13px] font-bold text-neutral-900">Elige a tu Asistente</h4>
            <p className="text-[11px] text-neutral-500 font-medium">Esta será la cara de tu negocio.</p>
          </div>
          
          <div className="space-y-1">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleSelect(avatar.id)}
                disabled={isUpdating}
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${currentAvatar === avatar.id ? 'bg-black text-white' : 'hover:bg-neutral-50 text-neutral-700'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden bg-white border ${currentAvatar === avatar.id ? 'border-neutral-700' : 'border-neutral-200'}`}>
                   {/* Usamos una versión inactiva chiquita del avatar */}
                   <div className="scale-[0.5]">
                     <AvatarSystem variant={avatar.id as any} isActive={false} />
                   </div>
                </div>
                <span className="text-[13px] font-semibold">{avatar.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
