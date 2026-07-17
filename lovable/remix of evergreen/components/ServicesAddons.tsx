import { useState } from "react";
import { Check } from "lucide-react";

type Service = {
  id: string;
  name: string;
  duration: string;
  price: number;
};

const SERVICES: Service[] = [
  { id: "facial", name: "Facial personalizado", duration: "60 min", price: 45 },
  { id: "masaje", name: "Masaje relajante", duration: "45 min", price: 38 },
  { id: "manicura", name: "Manicura spa", duration: "40 min", price: 22 },
];

const ADDONS: Service[] = [
  { id: "aroma", name: "Aromaterapia", duration: "+10 min", price: 8 },
  { id: "mascarilla", name: "Mascarilla de oro", duration: "+15 min", price: 12 },
  { id: "cuero", name: "Masaje de cuero cabelludo", duration: "+10 min", price: 9 },
  { id: "bebida", name: "Bebida de bienvenida", duration: "—", price: 0 },
];

export function ServicesAddons() {
  const [selectedService, setSelectedService] = useState<string>("facial");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["aroma"]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  };

  const service = SERVICES.find((s) => s.id === selectedService);
  const addonsTotal = ADDONS.filter((a) => selectedAddons.includes(a.id)).reduce(
    (sum, a) => sum + a.price,
    0,
  );
  const total = (service?.price ?? 0) + addonsTotal;

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-sm p-5 text-white w-full">
      <p className="text-[11px] uppercase tracking-[0.15em] text-white/70 mb-3">
        Personaliza tu cita
      </p>

      {/* Services */}
      <div className="space-y-1.5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
          Servicio
        </p>
        {SERVICES.map((s) => {
          const active = selectedService === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedService(s.id)}
              className={[
                "w-full flex items-center justify-between text-left px-3 py-2.5 rounded-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white/60",
                active
                  ? "bg-white text-foreground border-white"
                  : "border-white/20 text-white hover:bg-white/10",
              ].join(" ")}
            >
              <div>
                <p className="text-sm font-semibold">{s.name}</p>
                <p className={active ? "text-xs text-foreground/60" : "text-xs text-white/60"}>
                  {s.duration}
                </p>
              </div>
              <span className="text-sm font-semibold">${s.price}</span>
            </button>
          );
        })}
      </div>

      {/* Add-ons */}
      <div className="space-y-1.5 mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2">
          Adicionales
        </p>
        {ADDONS.map((a) => {
          const active = selectedAddons.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggleAddon(a.id)}
              className={[
                "w-full flex items-center justify-between text-left px-3 py-2 rounded-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white/60",
                active
                  ? "border-white/60 bg-white/15"
                  : "border-white/15 hover:bg-white/10",
              ].join(" ")}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={[
                    "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0",
                    active ? "bg-white border-white" : "border-white/40",
                  ].join(" ")}
                >
                  {active && <Check className="w-3 h-3 text-foreground" strokeWidth={3} />}
                </span>
                <div>
                  <p className="text-sm">{a.name}</p>
                  <p className="text-[11px] text-white/50">{a.duration}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-white/90">
                {a.price === 0 ? "Gratis" : `+$${a.price}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-3 border-t border-white/15">
        <span className="text-xs uppercase tracking-[0.12em] text-white/70">Total estimado</span>
        <span className="text-lg font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
          ${total}
        </span>
      </div>
    </div>
  );
}

export default ServicesAddons;
