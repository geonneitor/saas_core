'use client';

import { useState } from 'react';
import { Wallet, Sparkles, Zap, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WalletDashboard() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [showSpei, setShowSpei] = useState(false);

  const packages = [
    { id: 1, tokens: 5000, price: 150, popular: false },
    { id: 2, tokens: 15000, price: 350, popular: true },
    { id: 3, tokens: 35000, price: 750, popular: false },
  ];

  return (
    <div className="space-y-8">
      {/* Tarjeta Black/Gold */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 md:p-10 card-depth border border-white/[0.08] shadow-2xl">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-gold-primary/20 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center backdrop-blur-md">
                <Wallet className="w-5 h-5 text-gold-primary" />
              </div>
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-muted-foreground">Billetera Prepago Amigo</span>
            </div>
            
            <div>
              <div className="flex items-end gap-2">
                <h2 className="text-5xl md:text-6xl font-serif text-foreground tracking-tight leading-none">4,850</h2>
                <span className="text-xl text-gold-primary font-medium mb-1">Tokens</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                Suficiente para aproximadamente <strong>120 reservaciones</strong>. Tu asistente IA se pausará automáticamente cuando el saldo llegue a cero.
              </p>
            </div>
          </div>

          {/* SIM Card / Chip visual effect */}
          <div className="hidden md:flex w-20 h-24 rounded-lg border border-gold-primary/30 bg-gradient-to-br from-gold-primary/10 to-gold-dark/20 items-center justify-center relative overflow-hidden">
            <div className="absolute inset-x-0 h-[1px] bg-gold-primary/20 top-1/3" />
            <div className="absolute inset-x-0 h-[1px] bg-gold-primary/20 top-2/3" />
            <div className="absolute inset-y-0 w-[1px] bg-gold-primary/20 left-1/2" />
            <Sparkles className="w-6 h-6 text-gold-primary relative z-10" />
          </div>
        </div>
      </div>

      {/* Recargas */}
      <div>
        <h3 className="text-xl font-serif text-foreground mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-gold-primary" />
          Recargar Saldo
        </h3>
        
        {!showSpei ? (
          <div className="grid md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <motion.div
                whileHover={{ y: -4 }}
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
                  selectedPackage === pkg.id 
                    ? 'bg-gradient-to-b from-gold-primary/10 to-transparent border-gold-primary/50 shadow-gold-glow-sm'
                    : 'bg-white/[0.02] border-white/[0.05] hover:border-white/15'
                } border`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-gold-light to-gold-primary text-[#121212] text-[9px] font-black uppercase tracking-widest">
                    Más popular
                  </div>
                )}
                <div className="text-center space-y-4">
                  <div className="text-3xl font-serif text-foreground">
                    {pkg.tokens.toLocaleString()}<span className="text-sm text-gold-primary block mt-1">Tokens IA</span>
                  </div>
                  <div className="text-2xl font-medium text-foreground">
                    ${pkg.price}<span className="text-xs text-muted-foreground uppercase"> MXN</span>
                  </div>
                  
                  <div className={`w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center ${selectedPackage === pkg.id ? 'border-gold-primary bg-gold-primary text-[#121212]' : 'border-white/20 text-transparent'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-serif text-foreground mb-2">Paga vía SPEI</h4>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              Transfiere exactamente <strong className="text-foreground">${packages.find(p => p.id === selectedPackage)?.price}.00 MXN</strong> a la siguiente CLABE interbancaria. Tu saldo se reflejará en menos de 5 minutos.
            </p>
            <div className="bg-[#0A0A0C] border border-white/10 rounded-xl p-4 max-w-sm mx-auto font-mono text-lg tracking-widest text-gold-primary">
              012 180 0011 8299 1234
            </div>
            <button 
              onClick={() => setShowSpei(false)}
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Elegir otro paquete
            </button>
          </motion.div>
        )}

        {!showSpei && (
          <div className="mt-8 flex justify-end">
            <button 
              onClick={() => setShowSpei(true)}
              disabled={!selectedPackage}
              className="btn-premium-gold px-8 py-3 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generar Referencia de Pago <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
