import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseDateValue(value: string): Date | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(first: Date, second: Date): boolean {
  return toDateValue(first) === toDateValue(second);
}

function isSameMonth(first: Date, second: Date): boolean {
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

interface DatePickerProps {
  id?: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  "aria-label"?: string;
}

export function DatePicker({
  id,
  value,
  min,
  onChange,
  placeholder = "Select a date",
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const selectedDate = parseDateValue(value);
  const minimumDate = min ? parseDateValue(min) : null;
  const today = startOfDay(new Date());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = selectedDate ?? minimumDate ?? today;
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const selectedLabel = selectedDate
    ? selectedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : placeholder;
  const cannotGoPrevious = minimumDate
    ? isSameMonth(visibleMonth, new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1))
    : false;

  function chooseDate(date: Date) {
    if (minimumDate && date < minimumDate) return;
    onChange(toDateValue(date));
    setOpen(false);
  }

  function showToday() {
    const date = minimumDate && today < minimumDate ? minimumDate : today;
    chooseDate(date);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input type="hidden" name={id} value={value} />
      <button
        id={id}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open && selectedDate) {
            setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
          }
          setOpen((current) => !current);
        }}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-left text-sm font-semibold text-on-surface shadow-sm outline-none transition-[border-color,box-shadow,background-color] hover:border-primary/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          !selectedDate && "text-on-surface-variant",
        )}
      >
        <span className="flex min-w-0 items-center gap-2 truncate">
          <CalendarDays className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
          <span className="truncate">{selectedLabel}</span>
        </span>
        <ChevronRight className={cn("h-4 w-4 shrink-0 text-on-surface-variant transition-transform", open && "rotate-90 text-primary")} aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose target date"
          className="absolute left-0 top-full z-[120] mt-2 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-outline-variant bg-surface-container-lowest p-3 shadow-[0_18px_44px_rgba(15,23,42,0.16)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.6)]"
        >
          <div className="flex items-center justify-between px-1 pb-3">
            <p className="text-sm font-bold text-on-surface">{monthLabel}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                disabled={cannotGoPrevious}
                onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_LABELS.map((label) => (
              <span key={label} className="py-1 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
                {label}
              </span>
            ))}
            {calendarDays.map((date) => {
              const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth();
              const isDisabled = Boolean(minimumDate && date < minimumDate);
              const isSelected = Boolean(selectedDate && isSameDay(date, selectedDate));
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={toDateValue(date)}
                  type="button"
                  disabled={isDisabled}
                  aria-label={date.toLocaleDateString("en-US", { dateStyle: "full" })}
                  aria-pressed={isSelected}
                  onClick={() => chooseDate(date)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isOutsideMonth && "text-on-surface-variant/35",
                    !isOutsideMonth && !isSelected && "text-on-surface hover:bg-surface-container-high",
                    isDisabled && "cursor-not-allowed text-on-surface-variant/25 hover:bg-transparent",
                    isSelected && "bg-primary text-on-primary shadow-sm hover:bg-primary/90",
                    isToday && !isSelected && "ring-1 ring-primary/50 text-primary",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-outline-variant/40 pt-3 px-1">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              disabled={!value}
              className="text-xs font-bold text-primary transition-colors hover:text-primary-container disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={showToday}
              className="text-xs font-bold text-primary transition-colors hover:text-primary-container"
            >
              Today
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
