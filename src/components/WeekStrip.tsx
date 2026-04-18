import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toLocalDateStr } from "@/lib/dateUtils";

interface WeekStripProps {
  weekStart: string; // YYYY-MM-DD (Monday)
  selectedDate: string; // YYYY-MM-DD
  today: string;
  eventDates: Set<string>;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectDate: (date: string) => void;
  onToday: () => void;
}

const WEEKDAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function parseLocal(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(date: string, days: number): string {
  const d = parseLocal(date);
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d.toISOString()) as string;
}

export function WeekStrip({
  weekStart,
  selectedDate,
  today,
  eventDates,
  onPrevWeek,
  onNextWeek,
  onSelectDate,
  onToday,
}: WeekStripProps) {
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const dateStr = addDays(weekStart, i);
      const d = parseLocal(dateStr);
      return {
        dateStr,
        label: WEEKDAY_LABELS[i],
        dayNumber: d.getDate(),
      };
    });
  }, [weekStart]);

  return (
    <div className="rounded-lg border bg-card p-2">
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onPrevWeek}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-1 items-stretch justify-between gap-1 overflow-x-auto">
          {days.map((day) => {
            const isToday = day.dateStr === today;
            const isSelected = day.dateStr === selectedDate;
            const hasEvent = eventDates.has(day.dateStr);

            return (
              <button
                key={day.dateStr}
                type="button"
                onClick={() => onSelectDate(day.dateStr)}
                className={cn(
                  "flex min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5 transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground",
                  !isSelected && isToday && "ring-1 ring-primary",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase",
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {day.label}
                </span>
                <span className="text-sm font-semibold leading-none">{day.dayNumber}</span>
                <span
                  className={cn(
                    "h-1 w-1 rounded-full",
                    hasEvent
                      ? isSelected
                        ? "bg-primary-foreground"
                        : "bg-primary"
                      : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onNextWeek}
          aria-label="Próxima semana"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-8 shrink-0 px-2.5 text-xs"
          onClick={onToday}
        >
          Hoje
        </Button>
      </div>
    </div>
  );
}
