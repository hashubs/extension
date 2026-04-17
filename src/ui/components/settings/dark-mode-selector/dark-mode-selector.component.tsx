import { ThemePreference } from '@/ui/features/appearance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/ui-kit/dropdown-menu';
import {
  LuCheck,
  LuChevronDown,
  LuMonitor,
  LuMoon,
  LuSun,
} from 'react-icons/lu';

const themeOptions: {
  value: ThemePreference;
  icon: typeof LuSun;
  label: string;
}[] = [
  { value: ThemePreference.light, icon: LuSun, label: 'Light' },
  { value: ThemePreference.dark, icon: LuMoon, label: 'Dark' },
  { value: ThemePreference.system, icon: LuMonitor, label: 'System' },
];

interface DarkModeSelectorComponentProps {
  open: boolean;
  theme: ThemePreference;
  onOpenChange: (open: boolean) => void;
  onSetTheme: (theme: ThemePreference) => void;
}

export function DarkModeSelectorComponent({
  open,
  theme,
  onOpenChange,
  onSetTheme,
}: DarkModeSelectorComponentProps) {
  const current = themeOptions.find((o) => o.value === theme)!;

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            className="flex items-center gap-2.5 text-foreground/50 transition-colors hover:text-foreground active:scale-95"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-xs font-medium text-foreground/60">
              {current.label}
            </span>
            <LuChevronDown size={15} />
          </button>
        }
      />

      <DropdownMenuContent className="w-36 p-1 gap-0.5" align="end">
        {themeOptions.map(({ value, icon: Icon, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={(e) => {
              e.stopPropagation();
              onSetTheme(value);
              onOpenChange(false);
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Icon size={14} />
              <span className="text-sm font-medium text-foreground/60">
                {label}
              </span>
            </div>
            {theme === value && <LuCheck size={12} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
