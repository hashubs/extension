import { useState } from 'react';
import { LuEye, LuEyeOff } from 'react-icons/lu';

interface RevealProps {
  children: React.ReactNode;
  isLoading?: boolean;
  label?: string;
  description?: string;
  canHide?: boolean;
  className?: string;
}

export function Reveal({
  children,
  isLoading = false,
  label = 'Tap to Reveal',
  description = '',
  canHide = true,
  className = '',
}: RevealProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className={`relative border border-muted rounded-lg overflow-hidden p-4 ${className}`}
      onClick={() => canHide && revealed && setRevealed(false)}
      style={{ cursor: canHide && revealed ? 'pointer' : 'default' }}
    >
      {!revealed && (
        <div
          className="absolute inset-0 bg-muted/10 z-10 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer gap-2 text-center px-4"
          onClick={(e) => {
            e.stopPropagation();
            if (isLoading) return;
            setRevealed(true);
          }}
        >
          {isLoading ? (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <LuEyeOff size={20} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <>
              <LuEyeOff size={20} />
              <p className="font-semibold">{label}</p>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </>
          )}
        </div>
      )}

      {revealed && canHide && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 rounded px-2 py-1 backdrop-blur-sm pointer-events-none">
          <LuEye size={12} />
          <span>Tap to hide</span>
        </div>
      )}

      {children}
    </div>
  );
}
