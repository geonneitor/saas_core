export default function SaaSLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight">SaaS Caballo de Troya</h1>
        <p className="text-lg text-zinc-400">
          El motor de reservas y automatización con IA que multiplicará los ingresos de tu negocio.
        </p>
        <div className="pt-8">
          <button className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-zinc-200 transition">
            Iniciar Prueba Gratuita
          </button>
        </div>
      </div>
    </div>
  );
}
