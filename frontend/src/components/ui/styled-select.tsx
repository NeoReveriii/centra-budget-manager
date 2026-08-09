import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

export interface StyledSelectOption {
  value: string;
  label: string;
}

interface StyledSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly StyledSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

export function StyledSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  className,
  disabled = false,
  required = false,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value)),
  );
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const menuHeight = Math.min(options.length * 44 + 8, 280);
      const roomBelow = window.innerHeight - rect.bottom;
      const top = roomBelow < menuHeight && rect.top > menuHeight
        ? rect.top - menuHeight - 6
        : rect.bottom + 6;
      setMenuStyle({
        top,
        left: Math.min(rect.left, Math.max(8, window.innerWidth - rect.width - 8)),
        width: rect.width,
        minWidth: rect.width,
        maxWidth: `calc(100vw - 16px)`,
        boxSizing: "border-box",
      });
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !(target as HTMLElement).closest(`[data-select-menu="${menuId}"]`)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, menuId]);

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const next = open
        ? (activeIndex + direction + options.length) % options.length
        : Math.max(0, selectedIndex) + (event.key === "ArrowDown" ? 1 : -1);
      setActiveIndex(Math.max(0, Math.min(options.length - 1, next)));
      setOpen(true);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) choose(activeIndex);
      else {
        setActiveIndex(Math.max(0, selectedIndex));
        setOpen(true);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      setOpen(true);
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-required={required || undefined}
        aria-invalid={ariaInvalid || undefined}
        aria-describedby={ariaDescribedBy}
        onClick={() => {
          setActiveIndex(Math.max(0, selectedIndex));
          setOpen((current) => !current);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 text-left text-sm font-semibold text-slate-800 shadow-sm outline-none transition-[border-color,box-shadow,background-color] hover:border-slate-400 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#454545] dark:bg-[#181818] dark:text-[#ededed] dark:hover:border-[#666]",
          className,
        )}
        title={selectedOption?.label ?? placeholder}
      >
        <span className={cn("min-w-0 flex-1 truncate", !selectedOption && "text-slate-400")}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span className={cn("material-symbols-outlined shrink-0 text-[18px] text-slate-500 transition-transform", open && "rotate-180 text-primary")} aria-hidden="true">
          expand_more
        </span>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              id={menuId}
              data-select-menu={menuId}
              role="listbox"
              aria-labelledby={id}
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              className="pointer-events-auto fixed z-[300] max-h-[280px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_16px_38px_rgba(15,23,42,0.16)] dark:border-[#343434] dark:bg-[#181818] dark:shadow-[0_18px_44px_rgba(0,0,0,0.65)]"
              style={menuStyle}
            >
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    choose(index);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(index)}
                  className={cn(
                    "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-[#eff8f3] hover:text-primary focus-visible:bg-[#eff8f3] focus-visible:text-primary focus-visible:outline-none dark:text-[#ededed] dark:hover:bg-[#242424] dark:focus-visible:bg-[#242424]",
                    index === activeIndex && "bg-slate-50",
                    option.value === value && "font-bold text-primary",
                  )}
                >
                  <span className="min-w-0 flex-1 break-words leading-5">{option.label}</span>
                  {option.value === value ? <span className="material-symbols-outlined text-[18px]" aria-hidden="true">check</span> : null}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
