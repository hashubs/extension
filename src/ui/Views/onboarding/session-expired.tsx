import { Button } from '@/ui/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { MdRefresh } from 'react-icons/md';
import { getCurrentUser } from 'src/shared/get-current-user';

export function SessionExpired({ onRestart }: { onRestart: () => void }) {
  const { data: existingUser, isLoading } = useQuery({
    queryKey: ['getCurrentUser'],
    queryFn: async () => {
      const result = await getCurrentUser();
      return result || null;
    },
    suspense: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-[3px] border-[rgba(15,61,62,0.1)]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-primary-container border-t-transparent animate-spin animation-duration-[0.9s]" />
        </div>
      </div>
    );
  }

  const hasExistingUser = Boolean(existingUser);

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center gap-7">
      <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
        <div className="absolute inset-0 rounded-full border-[1.5px] border-[rgba(15,61,62,0.12)]" />
        <div className="absolute inset-[10px] rounded-full border-[1.5px] border-dashed border-[rgba(15,61,62,0.1)]" />
        <div className="w-16 h-16 rounded-full bg-[rgba(15,61,62,0.07)] flex items-center justify-center">
          <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none">
            <circle
              cx="18"
              cy="18"
              r="13"
              stroke="#0f3d3e"
              strokeWidth="1.5"
              fill="rgba(15,61,62,0.07)"
            />
            <line
              x1="18"
              y1="18"
              x2="18"
              y2="10"
              stroke="#0f3d3e"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="18"
              y1="18"
              x2="23"
              y2="22"
              stroke="#0f3d3e"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx="18" cy="18" r="1.5" fill="#0f3d3e" />
            <path
              d="M28 8 L30 6 M28 8 L26 7 M28 8 L28 10.5"
              stroke="#a3cfcf"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 max-w-88">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">
          Session Expired
        </h1>
        <p className="text-base text-muted-foreground/80 leading-relaxed m-0">
          {hasExistingUser
            ? 'Your session timed out for security. Please unlock your wallet to continue.'
            : 'Your session timed out for security. Create or import a wallet to continue.'}
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        icon={MdRefresh}
        iconPosition="left"
        onClick={onRestart}
      >
        {hasExistingUser ? 'Back to Login' : 'Restart'}
      </Button>

      <span className="text-[10px] text-muted-foreground/80 uppercase tracking-[0.06em] font-semibold">
        Secured by Monolith Protocol
      </span>
    </div>
  );
}
