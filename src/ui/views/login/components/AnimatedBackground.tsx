import { animated, config, useSprings } from '@react-spring/web';

interface AnimatedBackgroundProps {
  show: boolean;
}

const SHAPES = [
  // 1. tl circle
  {
    className: 'w-[130px] h-[130px] rounded-full bg-[#1B3A6B]',
    style: { top: -40, left: -40 },
    from: { x: 240, y: 180, scale: 0, opacity: 0 },
  },
  // 2. tr triangle
  {
    className: '',
    style: {
      width: 0,
      height: 0,
      borderLeft: '58px solid transparent',
      borderRight: '58px solid transparent',
      borderBottom: '100px solid #D4577A',
      top: -20,
      right: 18,
    },
    from: { x: -150, y: 160, scale: 0, opacity: 0 },
  },
  // 3. r square
  {
    className: 'w-20 h-20 bg-[#3AAECC] rounded-[10px]',
    style: { top: 90, right: -20 },
    from: { x: -250, y: 50, scale: 0, opacity: 0 },
  },
  // 4. bl triangle
  {
    className: '',
    style: {
      width: 0,
      height: 0,
      borderLeft: '50px solid transparent',
      borderRight: '50px solid transparent',
      borderBottom: '86px solid #2BBFA4',
      bottom: 18,
      left: 12,
    },
    from: { x: 180, y: -100, scale: 0, opacity: 0 },
  },
  // 5. br circle
  {
    className: 'w-[70px] h-[70px] rounded-full bg-[#4A4A5A]',
    style: { bottom: -18, right: 50 },
    from: { x: -100, y: -100, scale: 0, opacity: 0 },
  },
  // 6. p1 small circle
  {
    className: 'w-8 h-8 rounded-full bg-[#3AAECC]',
    style: { top: 115, left: 55 },
    from: { x: 140, y: 25, scale: 0, opacity: 0 },
  },
  // 7. p2 small square
  {
    className: 'w-[22px] h-[22px] bg-[#D4577A] rounded-[4px] rotate-[20deg]',
    style: { bottom: 50, right: 110 },
    from: { x: -90, y: -90, scale: 0, opacity: 0 },
  },
];

export function AnimatedBackground({ show }: AnimatedBackgroundProps) {
  const springs = useSprings(
    SHAPES.length,
    SHAPES.map((shape) => ({
      to: {
        opacity: show ? 1 : 0,
        scale: show ? 1 : 0,
        x: show ? 0 : shape.from.x,
        y: show ? 0 : shape.from.y,
      },
      from: {
        opacity: 0,
        scale: 0,
        x: shape.from.x,
        y: shape.from.y,
      },
      config: config.wobbly,
    }))
  );

  return (
    <>
      {springs.map((props, i) => (
        <animated.div
          key={i}
          className={`absolute ${SHAPES[i].className}`}
          style={{
            ...SHAPES[i].style,
            ...props,
          }}
        />
      ))}
    </>
  );
}
