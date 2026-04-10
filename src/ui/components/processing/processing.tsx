import { animated, useSpring } from '@react-spring/web';

interface Props {
  title: string;
  description: string;
}

function BounceDot({ delay }: { delay: number }) {
  const spring = useSpring({
    from: { transform: 'scale(0.8)', opacity: 0.5 },
    to: { transform: 'scale(1.2)', opacity: 1 },
    config: { duration: 480 },
    loop: { reverse: true },
    delay,
  });

  return (
    <animated.div
      style={spring}
      className="w-1.5 h-1.5 rounded-full bg-primary-container"
    />
  );
}

function RadarPulse({ delay }: { delay: number }) {
  const spring = useSpring({
    from: { transform: 'scale(0.8)', opacity: 0.7 },
    to: { transform: 'scale(2.4)', opacity: 0 },
    config: { duration: 2000, easing: (t) => 1 - Math.pow(1 - t, 3) },
    loop: true,
    delay,
  });

  return (
    <animated.div
      style={spring}
      className="absolute inset-0 rounded-full border-2 border-primary-container"
    />
  );
}

export function Processing({ title, description }: Props) {
  const dotBreath = useSpring({
    from: { transform: 'scale(1)', boxShadow: '0 0 16px rgba(15,61,62,0.35)' },
    to: { transform: 'scale(1.15)', boxShadow: '0 0 28px rgba(15,61,62,0.5)' },
    config: { duration: 1000 },
    loop: { reverse: true },
  });

  return (
    <div className="flex flex-1 min-h-0 items-center justify-center">
      <div className="flex flex-col items-center gap-5 text-center p-8">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <RadarPulse delay={0} />
          <RadarPulse delay={700} />
          <animated.div
            style={{
              ...dotBreath,
              background:
                'linear-gradient(135deg, var(--primary-container), var(--primary-container))',
            }}
            className="w-2 h-2 rounded-full"
          />
        </div>

        <h2 className="text-[1.375rem] font-extrabold m-0 tracking-[-0.02em]">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground/80 m-0 leading-relaxed max-w-88">
          {description}
        </p>

        <div className="flex gap-[0.4rem] items-center">
          <BounceDot delay={0} />
          <BounceDot delay={200} />
          <BounceDot delay={400} />
        </div>
      </div>
    </div>
  );
}
