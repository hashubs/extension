import { ellipsis, NBSP } from '@/shared/typography';
import { LuLoader } from 'react-icons/lu';
import { useRenderDelay } from '../DelayedRender/DelayedRender';

interface Props {
  size?: string;
  kind?: 'default' | 'network';
}

export function ViewLoading({ size = '24px', kind = 'default' }: Props) {
  const isTooLong = useRenderDelay(6000);

  return (
    <div className="flex h-full w-full items-center justify-center">
      {!navigator.onLine && kind === 'network' ? (
        <p className="text-base font-normal text-neutral-600">
          You are offline
        </p>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <LuLoader className="animate-spin" size={size} />

          {kind === 'network' ? (
            <p className="text-sm font-normal text-neutral-600">
              {isTooLong
                ? `Request is taking longer than usual${ellipsis}`
                : NBSP}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
