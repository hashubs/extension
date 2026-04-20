import { cn } from '@/ui/lib/utils';

interface Props {
  animate?: boolean;
}

export function ImportBackground({ animate = true }: Props) {
  return (
    <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-hidden pointer-events-none">
      <div
        className={cn(
          'w-[500px] h-[500px] rounded-full border border-primary/5 transition-opacity duration-1000',
          animate ? 'animate-ping opacity-20' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'absolute w-[300px] h-[300px] rounded-full border border-primary/10 transition-opacity duration-700',
          animate ? 'animate-pulse opacity-30' : 'opacity-0'
        )}
      />
      <div
        className={cn(
          'absolute w-[150px] h-[150px] rounded-full bg-primary/5 blur-3xl transition-opacity duration-1000',
          animate ? 'animate-pulse opacity-40' : 'opacity-0'
        )}
      />
    </div>
  );
}
