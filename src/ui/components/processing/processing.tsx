import { animated, useSpring } from '@react-spring/web';

interface Props {
  title: string;
  description: string;
}

function ScanLine() {
  const spring = useSpring({
    from: { transform: 'translateY(0px)', opacity: 1 },
    to: { transform: 'translateY(64px)', opacity: 0 },
    config: { duration: 1600 },
    loop: true,
  });

  return (
    <animated.div
      style={{
        ...spring,
        position: 'absolute',
        left: 0,
        right: 0,
        height: '2px',
        background: 'var(--primary-container)',
        boxShadow: '0 0 8px var(--primary-container)',
      }}
    />
  );
}

function GridCell({ delay }: { delay: number }) {
  const spring = useSpring({
    from: { opacity: 0.1 },
    to: { opacity: 0.35 },
    config: { duration: 800 },
    loop: { reverse: true },
    delay,
  });

  return (
    <animated.div
      style={{
        ...spring,
        background: 'var(--primary-container)',
        borderRadius: '1px',
      }}
    />
  );
}

export function Processing({ title, description }: Props) {
  const GRID_CELLS = 12;

  return (
    <div className="flex flex-1 h-full min-h-0 items-center justify-center">
      <div className="flex flex-col items-center gap-5 text-center p-8">
        <div
          style={{
            position: 'relative',
            width: '56px',
            height: '64px',
            overflow: 'hidden',
            borderRadius: '6px',
            border: '1px solid var(--primary-container)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '2px',
              padding: '4px',
            }}
          >
            {Array.from({ length: GRID_CELLS }).map((_, i) => (
              <GridCell key={i} delay={i * 60} />
            ))}
          </div>
          <ScanLine />
        </div>

        <h2 className="text-[1.375rem] font-extrabold m-0 tracking-[-0.02em]">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground/80 m-0 leading-relaxed max-w-88">
          {description}
        </p>
      </div>
    </div>
  );
}
