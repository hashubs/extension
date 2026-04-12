import { Button } from '@/ui/ui-kit';
import { animated, useChain, useSpring, useSpringRef } from '@react-spring/web';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { MdArrowForward, MdRefresh } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from 'src/shared/get-current-user';
import browser from 'webextension-polyfill';
import { ONBOARDING_ROUTES } from './routes';

function SessionExpiredIcon() {
  const handSpin = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: { duration: 3000 },
  });

  const starPulse = useSpring({
    from: { opacity: 0.3, scale: 0.85 },
    to: { opacity: 1, scale: 1 },
    loop: { reverse: true },
    config: { duration: 900, easing: (t) => t * (2 - t) },
  });

  return (
    <svg className="w-9 h-9" viewBox="0 0 36 36" fill="none">
      <circle
        cx="18"
        cy="18"
        r="13"
        stroke="#0f3d3e"
        strokeWidth="1.5"
        fill="rgba(15,61,62,0.07)"
      />

      <animated.g
        style={{
          transformOrigin: '18px 18px',
          rotate: handSpin.rotate.to((r) => `${r}deg`),
        }}
      >
        <line
          x1="18"
          y1="18"
          x2="18"
          y2="10"
          stroke="#0f3d3e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </animated.g>

      <animated.g
        style={{
          transformOrigin: '18px 18px',
          rotate: handSpin.rotate.to((r) => `${r * 0.5}deg`),
        }}
      >
        <line
          x1="18"
          y1="18"
          x2="23"
          y2="22"
          stroke="#0f3d3e"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </animated.g>

      <circle cx="18" cy="18" r="1.5" fill="#0f3d3e" />

      <animated.path
        d="M28 8 L30 6 M28 8 L26 7 M28 8 L28 10.5"
        stroke="#a3cfcf"
        strokeWidth="1.2"
        strokeLinecap="round"
        style={{ opacity: starPulse.opacity, scale: starPulse.scale }}
      />
    </svg>
  );
}

function WalletCreatedIcon() {
  const bounceRef = useSpringRef();
  const bounce = useSpring({
    ref: bounceRef,
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1 },
    config: { tension: 280, friction: 14 },
  });

  const checkRef = useSpringRef();
  const checkDraw = useSpring({
    ref: checkRef,
    from: { strokeDashoffset: 12 },
    to: { strokeDashoffset: 0 },
    config: { duration: 400 },
  });

  useChain([bounceRef, checkRef], [0, 0.6]);

  return (
    <animated.svg
      className="w-9 h-9"
      viewBox="0 0 36 36"
      fill="none"
      style={{ scale: bounce.scale, opacity: bounce.opacity }}
    >
      <rect
        x="6"
        y="11"
        width="24"
        height="16"
        rx="2.5"
        stroke="#0f3d3e"
        strokeWidth="1.5"
        fill="rgba(15,61,62,0.07)"
      />
      <path
        d="M10 11V9.5C10 8.4 10.9 7.5 12 7.5H24C25.1 7.5 26 8.4 26 9.5V11"
        stroke="#0f3d3e"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="20"
        y="17"
        width="7"
        height="4.5"
        rx="1.2"
        stroke="#0f3d3e"
        strokeWidth="1.2"
        fill="rgba(15,61,62,0.1)"
      />
      <circle cx="27" cy="10" r="4.5" fill="#0f3d3e" />

      <animated.path
        d="M24.8 10 L26.4 11.6 L29.2 8.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="12"
        style={{ strokeDashoffset: checkDraw.strokeDashoffset }}
      />
    </animated.svg>
  );
}

export function Oops() {
  const navigate = useNavigate();

  const { data: existingUser } = useQuery({
    queryKey: ['getCurrentUser'],
    queryFn: async () => {
      const result = await getCurrentUser();
      return result || null;
    },
    refetchOnWindowFocus: false,
  });

  const hasExistingUser = Boolean(existingUser);

  const handleAction = useCallback(() => {
    if (hasExistingUser) {
      browser.action.openPopup();
    } else {
      navigate(`/onboarding/${ONBOARDING_ROUTES.WELCOME}`);
    }
  }, [hasExistingUser, navigate]);

  const title = hasExistingUser ? 'Wallet Created!' : 'Session Expired';

  const description = hasExistingUser
    ? "Your wallet is ready to use. Make sure to back up your recovery phrase — it's the only way to restore access if you lose your device."
    : 'Your session timed out for security. Create or import a wallet to continue.';

  const buttonLabel = hasExistingUser ? 'Open Wallet' : 'Restart';

  const ButtonIcon = hasExistingUser ? MdArrowForward : MdRefresh;
  const iconPosition = hasExistingUser ? 'right' : 'left';

  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center gap-7">
      <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
        <div className="absolute inset-0 rounded-full border-[1.5px] border-[rgba(15,61,62,0.12)]" />
        <div className="absolute inset-[10px] rounded-full border-[1.5px] border-dashed border-[rgba(15,61,62,0.1)]" />
        <div className="w-16 h-16 rounded-full bg-[rgba(15,61,62,0.07)] flex items-center justify-center">
          {hasExistingUser ? <WalletCreatedIcon /> : <SessionExpiredIcon />}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 max-w-88">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em]">{title}</h1>
        <p className="text-base text-muted-foreground/80 leading-relaxed m-0">
          {description}
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        icon={ButtonIcon}
        iconPosition={iconPosition}
        onClick={handleAction}
      >
        {buttonLabel}
      </Button>

      <span className="text-[10px] text-muted-foreground/80 uppercase tracking-[0.06em] font-semibold">
        Secured by Monolith Protocol
      </span>
    </div>
  );
}
