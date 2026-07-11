import AiAssistantChat from '@/components/AiAssistantChat';
import { PublicNavbar } from '@/components/public/PublicNavbar';
import { PublicHero } from '@/components/public/PublicHero';
import { PublicFeatureGrid } from '@/components/public/PublicFeatureGrid';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-[#fafafa] font-sans selection:bg-[#ff0055] selection:text-white overflow-hidden relative">
      {/* Background CRT/Grid Effect */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      
      <PublicNavbar />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 py-12">
        <PublicHero />
        <PublicFeatureGrid />
      </main>

      <div className="fixed bottom-0 right-0 z-50 pointer-events-auto">
        <AiAssistantChat 
          tenantId="00000000-0000-0000-0000-000000000000" 
          tenantName="debugGeo" 
          aiAvatar="error404" 
          tagline="Resolviendo problemas complejos. La IA hace exactamente lo que necesitas. *Beep boop*"
        />
      </div>
    </div>
  );
}
