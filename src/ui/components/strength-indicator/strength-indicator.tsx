import {
  Strength,
  type StrengthStats,
} from '@/shared/validation/password-strength';

export function StrengthIndicator({ stats }: { stats: StrengthStats }) {
  const levels = [Strength.weak, Strength.medium, Strength.strong];
  const currentIndex = levels.indexOf(stats.strength);

  const colorMap: Record<Strength, string> = {
    [Strength.weak]: 'bg-red-500',
    [Strength.medium]: 'bg-yellow-400',
    [Strength.strong]: 'bg-emerald-500',
  };

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {levels.map((level, i) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= currentIndex
                ? colorMap[stats.strength]
                : 'bg-muted-foreground/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
