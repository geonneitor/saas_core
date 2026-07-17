import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Simulated availability: deterministic per date so it stays stable across renders.
const ALL_SLOTS = ["09:00", "10:00", "11:30", "13:00", "15:00", "16:30", "18:00", "19:30"];

function hashDate(d: Date) {
  return d.getFullYear() * 372 + (d.getMonth() + 1) * 31 + d.getDate();
}

function slotsFor(date: Date): { time: string; taken: boolean }[] {
  const h = hashDate(date);
  return ALL_SLOTS.map((time, i) => ({
    time,
    taken: ((h >> i) & 1) === 1 && ((h + i * 7) % 5 !== 0),
  }));
}

function isSelectable(date: Date, today: Date) {
  if (isBefore(date, today)) return false;
  return date.getDay() !== 0; // cerrado domingos
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];
type View = "dia" | "semana" | "mes";

export function AvailabilityMiniCalendar() {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState<View>("mes");
  const [anchor, setAnchor] = useState<Date>(today);
  const [selected, setSelected] = useState<Date>(() => {
    for (let i = 0; i < 14; i++) {
      const d = addDays(today, i);
      if (isSelectable(d, today)) return d;
    }
    return today;
  });

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [anchor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchor]);

  const slots = useMemo(() => slotsFor(selected), [selected]);
  const availableCount = slots.filter((s) => !s.taken).length;

  const handlePrev = () => {
    if (view === "dia") {
      const d = subDays(anchor, 1);
      setAnchor(d);
      if (isSelectable(d, today)) setSelected(d);
    } else if (view === "semana") setAnchor((a) => subWeeks(a, 1));
    else setAnchor((a) => subMonths(a, 1));
  };
  const handleNext = () => {
    if (view === "dia") {
      const d = addDays(anchor, 1);
      setAnchor(d);
      if (isSelectable(d, today)) setSelected(d);
    } else if (view === "semana") setAnchor((a) => addWeeks(a, 1));
    else setAnchor((a) => addMonths(a, 1));
  };

  const headerLabel =
    view === "mes"
      ? format(anchor, "MMMM yyyy", { locale: es })
      : view === "semana"
      ? `${format(weekDays[0], "d MMM", { locale: es })} – ${format(weekDays[6], "d MMM", { locale: es })}`
      : format(anchor, "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-sm p-5 text-white w-full max-w-md">
      {/* View filter tabs */}
      <div className="flex items-center gap-1 mb-4 bg-white/5 rounded-sm p-1">
        {(["dia", "semana", "mes"] as View[]).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setView(v);
              if (v === "dia") setAnchor(selected);
            }}
            className={[
              "flex-1 text-[11px] uppercase tracking-[0.12em] py-1.5 rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-white/40",
              view === v ? "bg-white text-foreground font-semibold" : "text-white/70 hover:text-white hover:bg-white/10",
            ].join(" ")}
          >
            {v === "dia" ? "Día" : v === "semana" ? "Semana" : "Mes"}
          </button>
        ))}
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 hover:bg-white/10 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-semibold tracking-wide capitalize text-center">{headerLabel}</p>
        <button
          type="button"
          onClick={handleNext}
          className="p-1 hover:bg-white/10 rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Views */}
      {view === "mes" && (
        <>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-[10px] text-center text-white/60 font-semibold py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {monthDays.map((day) => {
              const inMonth = isSameMonth(day, anchor);
              const selectable = isSelectable(day, today) && inMonth;
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, today);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={!selectable}
                  onClick={() => setSelected(day)}
                  className={[
                    "aspect-square text-xs rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-white/60",
                    !inMonth ? "text-white/20" : "",
                    selectable && !isSelected ? "hover:bg-white/15 text-white" : "",
                    !selectable && inMonth ? "text-white/25 line-through cursor-not-allowed" : "",
                    isSelected ? "bg-white text-foreground font-semibold" : "",
                    isToday && !isSelected ? "ring-1 ring-white/40" : "",
                  ].join(" ")}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </>
      )}

      {view === "semana" && (
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const selectable = isSelectable(day, today);
            const isSelected = isSameDay(day, selected);
            const count = slotsFor(day).filter((s) => !s.taken).length;
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={!selectable}
                onClick={() => setSelected(day)}
                className={[
                  "flex flex-col items-center py-2 rounded-sm border transition-colors focus:outline-none focus:ring-1 focus:ring-white/60",
                  isSelected
                    ? "bg-white text-foreground border-white font-semibold"
                    : selectable
                    ? "border-white/20 text-white hover:bg-white/10"
                    : "border-white/10 text-white/30 line-through cursor-not-allowed",
                ].join(" ")}
              >
                <span className="text-[9px] uppercase tracking-wider opacity-70">
                  {format(day, "EEE", { locale: es })}
                </span>
                <span className="text-sm mt-0.5">{day.getDate()}</span>
                <span className="text-[9px] mt-0.5 opacity-70">{selectable ? `${count} libres` : "—"}</span>
              </button>
            );
          })}
        </div>
      )}

      {view === "dia" && (
        <div className="text-center py-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/60">
            {isSelectable(anchor, today) ? "Día disponible" : "Día no disponible"}
          </p>
          <p className="text-3xl font-bold mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {format(anchor, "d 'de' MMMM", { locale: es })}
          </p>
        </div>
      )}

      {/* Slots */}
      <div className="mt-4 pt-3 border-t border-white/15">
        <p className="text-[11px] uppercase tracking-[0.12em] text-white/70 mb-2">
          {format(selected, "EEE d MMM", { locale: es })} · {availableCount} horarios disponibles
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {slots.map((s) => (
            <button
              key={s.time}
              type="button"
              disabled={s.taken}
              className={[
                "text-[11px] text-center py-1.5 rounded-sm border transition-colors",
                s.taken
                  ? "border-white/10 text-white/35 line-through bg-white/5 cursor-not-allowed"
                  : "border-white/30 text-white bg-white/10 hover:bg-white/25",
              ].join(" ")}
            >
              {s.time}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/50 mt-2">Horarios de ejemplo · Cerrado domingos</p>
      </div>
    </div>
  );
}

export default AvailabilityMiniCalendar;
