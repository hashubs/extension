import { ViewLoading } from '@/ui/components/view-loading';
import { animated, useSpring } from '@react-spring/web';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { HiCheckCircle } from 'react-icons/hi2';

interface Props {
  groupName: string;
  isLoading: boolean;
  loadingTitle: string;
}

function SecurityCheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-2xl border border-neutral-100 dark:border-white/5 shadow-sm w-full">
      <div className="flex items-center justify-center text-green-500">
        <HiCheckCircle size={22} />
      </div>
      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
        {text}
      </span>
    </div>
  );
}

export function GroupImportDecoration({
  groupName,
  isLoading,
  loadingTitle,
}: Props) {
  const style = useSpring({
    opacity: isLoading ? 0 : 1,
    transform: isLoading ? 'scale(0.8)' : 'scale(1)',
    config: { tension: 200, friction: 20 },
  });

  useEffect(() => {
    if (!isLoading) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#84cc16', '#65a30d', '#bef264', '#ffffff'],
      });
    }
  }, [isLoading]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      {isLoading ? (
        <ViewLoading />
      ) : (
        <animated.div style={{ ...style, width: '100%', maxWidth: '325px' }}>
          <div className="bg-item p-6 rounded-[32px] border border-muted-foreground/20 shadow-2xl flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]">
                Wallet Group Secured
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-center">
                {groupName}
              </h3>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <SecurityCheckItem text="Verified Successfully" />
              <SecurityCheckItem text="Encryption Active" />
              <SecurityCheckItem text="Safe & Secure" />
            </div>
          </div>
        </animated.div>
      )}
    </div>
  );
}
