import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

export interface DropdownItem {
  value: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
}

export default function CustomDropdown({
  items,
  value,
  onChange,
  icon,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  align = 'right',
  size = 'sm',
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => item.value === value);

  // Close on outside click or escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    if (open) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={clsx('relative inline-block text-left', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          'flex items-center gap-1.5 rounded-xl border border-sky-150 bg-white/90 backdrop-blur-xs hover:bg-sky-50/70 text-slate-700 font-medium transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-2xs',
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
          open && 'bg-sky-50/80 border-sky-300 ring-2 ring-sky-500/15',
          buttonClassName
        )}
      >
        {icon && <span className="text-sky-600 shrink-0">{icon}</span>}
        <span className="truncate max-w-[130px] sm:max-w-[180px]">
          {selectedItem?.label || placeholder}
        </span>
        <ChevronDown
          size={size === 'sm' ? 13 : 15}
          className={clsx('text-slate-400 shrink-0 transition-transform duration-200', open && 'rotate-180 text-sky-600')}
        />
      </button>

      {/* Floating Menu */}
      {open && (
        <div
          className={clsx(
            'absolute top-full mt-1.5 z-50 min-w-[170px] max-w-[280px] rounded-2xl border border-sky-100 bg-white/95 backdrop-blur-md p-1.5 shadow-xl shadow-sky-950/8 animate-in fade-in zoom-in-95 duration-150',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          <div className="max-h-64 overflow-y-auto space-y-0.5 overscroll-contain">
            {items.map((item) => {
              const active = item.value === value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center justify-between gap-2.5 px-3 py-2 text-left text-xs rounded-xl transition-all cursor-pointer',
                    active
                      ? 'bg-sky-50 text-sky-900 font-semibold border-l-2 border-sky-600 pl-2.5'
                      : 'text-slate-700 hover:bg-sky-50/60 hover:text-sky-900 font-normal'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.icon && <span className="shrink-0 text-sky-500">{item.icon}</span>}
                    <div className="min-w-0">
                      <div className="truncate">{item.label}</div>
                      {item.sublabel && (
                        <div className="text-[10px] text-slate-400 truncate">{item.sublabel}</div>
                      )}
                    </div>
                  </div>
                  {active && <Check size={13} className="text-sky-600 shrink-0 ml-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
