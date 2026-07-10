"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Sparkles } from 'lucide-react';
import { AvatarSystem } from './avatars/AvatarSystem';
import { useBookingStore } from '@/store/useBookingStore';
import { useRouter } from 'next/navigation';

type AvatarVariant = 'lotito' | 'orb' | 'cat' | 'robot' | 'star' | 'error404';

export default function AiAssistantChat({ 
  tenantId, 
  tenantName,
  aiAvatar = 'lotito',
  tagline = 'Darte el mejor servicio.',
  isAdmin = false
}: { 
  tenantId: string; 
  tenantName: string;
  aiAvatar?: AvatarVariant;
  tagline?: string;
  isAdmin?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const initialText = `¡Hola! Soy el asistente IA de ${tenantName}. ✨\n\nNuestra promesa: ${tagline}\n\nPuedo ayudarte a:\n📅 Agendar citas en segundos\n⏰ Consultar nuestros horarios\n❓ Resolver cualquier duda sobre los servicios\n\n¿Qué te gustaría hacer hoy?`;
  
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'assistant', text: initialText }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { openModal } = useBookingStore();
  const router = useRouter();
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // DIAL-UP / FAX SOUND EFFECT FOR ERROR404
  useEffect(() => {
    if (isLoading && aiAvatar === 'error404') {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioCtx = new AudioContextClass();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        oscillator.frequency.linearRampToValueAtTime(2400, audioCtx.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
        
        const interval = setInterval(() => {
          const osc = audioCtx.createOscillator();
          const gn = audioCtx.createGain();
          osc.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
          osc.frequency.setValueAtTime(400 + Math.random() * 2000, audioCtx.currentTime);
          gn.gain.setValueAtTime(0.01 + Math.random() * 0.02, audioCtx.currentTime);
          gn.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
          osc.connect(gn);
          gn.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.1);
        }, 150);

        return () => {
          clearInterval(interval);
          if (audioCtx.state !== 'closed') audioCtx.close();
        };
      } catch (e) {
        console.warn("AudioContext bloqueado. Se requiere interacción del usuario previa.");
      }
    }
  }, [isLoading, aiAvatar]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-ai-chat', handleOpenChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenChat);
  }, []);

  const toggleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador actual no soporta dictado por voz nativo.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-MX';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " + transcript : transcript));
    };
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const newMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          isAdmin,
          messages: [...messages, newMsg]
        })
      });
      const data = await res.json();
      
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
      }
      
      if (data.toolCalls && data.toolCalls.length > 0) {
        data.toolCalls.forEach((tool: any) => {
          if (tool.name === 'open_booking_modal') {
             // ZUSTAND: Abre el modal real
             openModal(tool.arguments);
          }
          if (tool.name === 'refresh_calendar') {
             router.refresh();
          }
        });
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Hubo un error de conexión temporal. Intenta de nuevo." }]);
    }
    setIsLoading(false);
  };

  return (
    <>
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-6 h-16 w-16 bg-surface border border-border rounded-full shadow-gold-glow flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group"
        >
          <AvatarSystem variant={aiAvatar} isActive={false} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[92vw] sm:w-100 h-150 max-h-[85vh] bg-surface rounded-3xl flex flex-col z-50 border border-border overflow-hidden animate-in slide-in-from-bottom-8 duration-300 card-depth">
          <div className="bg-surface-bright border-b border-border p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-surface rounded-full shadow-sm flex items-center justify-center border border-border overflow-hidden">
                <AvatarSystem variant={aiAvatar} isActive={true} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-foreground text-lg leading-none">{tenantName} Asistente</h3>
                <span className="text-[10px] text-gold-primary font-bold tracking-wide uppercase mt-1 block flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> En línea 24/7</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-surface-container transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto bg-surface flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'btn-premium-gold rounded-tr-sm' : 'bg-surface-container border border-border text-foreground rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface-container border border-border p-4 rounded-3xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-gold-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gold-primary rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                  <div className="w-2 h-2 bg-gold-primary rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="p-4 bg-surface border-t border-border">
            <div className="flex items-center gap-2 bg-surface-bright rounded-full p-1.5 pr-2.5 border border-border shadow-inner">
              <button 
                onClick={toggleMic}
                className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-error text-on-error shadow-lg animate-pulse' : 'text-muted-foreground hover:bg-surface-container hover:text-foreground'}`}
                title="Dictado por voz"
              >
                <Mic size={18} className="stroke-[2.5px]" />
              </button>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ej. Cancela mi cita de hoy..." 
                className="flex-1 bg-transparent border-none focus:outline-none text-[14px] px-2 py-2 placeholder:text-muted-foreground font-medium text-foreground"
              />
              <button 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 btn-premium-gold rounded-full disabled:opacity-50 transition-colors shadow-md flex items-center justify-center"
              >
                <Send size={18} className="ml-0.5 stroke-[2.5px] text-on-primary" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
