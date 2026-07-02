"use client";

import { useState, useRef, useEffect } from 'react';
import { X, Send, Mic, Sparkles } from 'lucide-react';
import { AvatarSystem } from './avatars/AvatarSystem';
import { useBookingStore } from '@/store/useBookingStore';

type AvatarVariant = 'lotito' | 'orb' | 'cat' | 'robot' | 'star';

export default function AiAssistantChat({ 
  tenantId, 
  tenantName,
  aiAvatar = 'lotito'
}: { 
  tenantId: string; 
  tenantName: string;
  aiAvatar?: AvatarVariant;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, text: string}[]>([
    { role: 'assistant', text: `¡Hola! Soy el asistente IA de ${tenantName}. ¿En qué te puedo ayudar hoy? ✨` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { openModal } = useBookingStore();
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

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
          if (tool.name === 'cancel_appointment') {
             // MVP simple mock for cancelling (will be handled in backend if possible, or trigger another UI)
             setMessages(prev => [...prev, { role: 'assistant', text: "He cancelado la cita solicitada." }]);
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
          className="fixed bottom-8 right-6 h-16 w-16 bg-white border border-neutral-100 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50 group"
        >
          <AvatarSystem variant={aiAvatar} isActive={false} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[92vw] sm:w-100 h-150 max-h-[85vh] bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col z-50 border border-neutral-200 overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-neutral-50 border-b border-neutral-100 p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-neutral-100 overflow-hidden">
                <AvatarSystem variant={aiAvatar} isActive={true} />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-[15px] leading-none capitalize">{aiAvatar} AI</h3>
                <span className="text-[10px] text-neutral-400 font-bold tracking-wide uppercase mt-1 block">Conectado a Groq</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-neutral-400 hover:text-neutral-900 p-2 rounded-full hover:bg-neutral-100 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 p-5 overflow-y-auto bg-white flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-black text-white rounded-tr-sm' : 'bg-[#F9FAFB] border border-neutral-100 text-neutral-800 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F9FAFB] border border-neutral-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                  <div className="w-2 h-2 bg-neutral-300 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>

          <div className="p-4 bg-white border-t border-neutral-100">
            <div className="flex items-center gap-2 bg-neutral-50 rounded-full p-1.5 pr-2.5 border border-neutral-200 shadow-inner">
              <button 
                onClick={toggleMic}
                className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white shadow-lg animate-pulse' : 'text-neutral-400 hover:bg-neutral-200 hover:text-neutral-800'}`}
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
                className="flex-1 bg-transparent border-none focus:outline-none text-[14px] px-1 py-2 placeholder:text-neutral-400 font-medium text-neutral-900"
              />
              <button 
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2.5 bg-black text-white rounded-full disabled:opacity-50 hover:bg-neutral-800 transition-colors shadow-md"
              >
                <Send size={18} className="ml-0.5 stroke-[2.5px]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
