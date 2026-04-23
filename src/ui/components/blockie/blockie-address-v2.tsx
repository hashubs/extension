import { createIcon } from '@download/blockies';
import { useLayoutEffect, useMemo, useRef } from 'react';
import type { IconBaseProps } from 'react-icons';
import { isSolanaAddress } from 'src/modules/solana/shared';
import { normalizeAddress } from 'src/shared/normalize-address';

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function pseudoRandom(seed: string): () => number {
  let value = hashCode(seed);
  return function () {
    value = (value * 16807) % 2147483647;
    return (value & 0xffffff) / 0x1000000;
  };
}

// ---------------------------------------------------------------------------
// Canvas generators (original, unchanged)
// ---------------------------------------------------------------------------

export function generateSolanaBlockie(
  address: string,
  size: number
): HTMLCanvasElement {
  const blocksCount = 8;
  const scale = (size / blocksCount) * window.devicePixelRatio;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size * window.devicePixelRatio;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  const rand = pseudoRandom(address);
  const colors = [
    `hsl(${Math.floor(rand() * 360)}, 80%, 60%)`,
    `hsl(${Math.floor(rand() * 360)}, 70%, 50%)`,
    `hsl(${Math.floor(rand() * 360)}, 60%, 40%)`,
    `hsl(${Math.floor(rand() * 360)}, 90%, 70%)`,
  ];
  const bgColor = colors[Math.floor(rand() * colors.length)];
  const fgColor = colors[Math.floor(rand() * colors.length)];

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, blocksCount, blocksCount);

  for (let x = 0; x < blocksCount; x++) {
    for (let y = 0; y < blocksCount; y++) {
      if (rand() > 0.5) {
        ctx.fillStyle = fgColor;
        ctx.beginPath();
        ctx.arc(x + 0.5, y + 0.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${rand() * 0.3 + 0.2})`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Shared SVG props type
// Re-uses SVGAttributes but replaces `title` with the string version
// that IconBaseProps expects, avoiding the ReactNode vs string conflict.
// ---------------------------------------------------------------------------

type SVGBlockieProps = {
  address: string;
  size: number;
  title?: string; // explicitly string, not ReactNode
  className?: string;
  style?: React.CSSProperties;
} & Omit<
  React.SVGAttributes<SVGSVGElement>,
  'viewBox' | 'width' | 'height' | 'title' // omit conflicting keys
>;

// ---------------------------------------------------------------------------
// Pure SVG sub-components (no hooks — never called conditionally)
// ---------------------------------------------------------------------------

function SolanaBlockieSVG({
  address,
  size,
  title,
  className,
  style,
  ...svgProps
}: SVGBlockieProps) {
  const blocksCount = 8;
  const blockSize = size / blocksCount;

  const rand = pseudoRandom(address);
  const colors = [
    `hsl(${Math.floor(rand() * 360)}, 80%, 60%)`,
    `hsl(${Math.floor(rand() * 360)}, 70%, 50%)`,
    `hsl(${Math.floor(rand() * 360)}, 60%, 40%)`,
    `hsl(${Math.floor(rand() * 360)}, 90%, 70%)`,
  ];
  const bgColor = colors[Math.floor(rand() * colors.length)];
  const fgColor = colors[Math.floor(rand() * colors.length)];

  const elements: React.ReactNode[] = [];
  for (let x = 0; x < blocksCount; x++) {
    for (let y = 0; y < blocksCount; y++) {
      const px = x * blockSize;
      const py = y * blockSize;
      const cx = px + blockSize / 2;
      const cy = py + blockSize / 2;
      const r = blockSize * 0.4;
      const key = `${x}-${y}`;

      if (rand() > 0.5) {
        elements.push(
          <circle key={key} cx={cx} cy={cy} r={r} fill={fgColor} />
        );
      } else {
        const alpha = (rand() * 0.3 + 0.2).toFixed(3);
        elements.push(
          <rect
            key={key}
            x={px}
            y={py}
            width={blockSize}
            height={blockSize}
            fill={`rgba(255,255,255,${alpha})`}
          />
        );
      }
    }
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
      role="img"
      aria-label={title}
      {...svgProps}
    >
      {title && <title>{title}</title>}
      <rect width={size} height={size} fill={bgColor} />
      {elements}
    </svg>
  );
}

function EthBlockieSVG({
  address,
  size,
  title,
  className,
  style,
  ...svgProps
}: SVGBlockieProps) {
  const blocksCount = 8;
  const scale = Math.max(
    1,
    Math.round((size / blocksCount) * window.devicePixelRatio)
  );
  const canvas = createIcon({
    seed: address,
    size: blocksCount,
    scale,
  }) as HTMLCanvasElement;
  const dataURL = canvas.toDataURL('image/png');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={style}
      role="img"
      aria-label={title}
      {...svgProps}
    >
      {title && <title>{title}</title>}
      <image href={dataURL} width={size} height={size} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Canvas sub-component (hooks isolated here)
// ---------------------------------------------------------------------------

function CanvasBlockie({
  address,
  size,
  borderRadius,
  className,
  style,
}: {
  address: string;
  size: number;
  borderRadius: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const isSolana = isSolanaAddress(address);
  const blocksCount = 8;

  const canvasIcon = useMemo(
    () =>
      isSolana
        ? generateSolanaBlockie(address, size)
        : (createIcon({
            seed: address,
            size: blocksCount,
            scale: (size / blocksCount) * window.devicePixelRatio,
          }) as HTMLCanvasElement),
    [address, isSolana, size]
  );

  const ref = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const el = canvasIcon;
    el.style.borderRadius = `${borderRadius}px`;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.display = 'block';
    ref.current?.appendChild(el);
    return () => {
      el.parentElement?.removeChild(el);
    };
  }, [canvasIcon, size, borderRadius]);

  return <span ref={ref} className={className} style={style} />;
}

// ---------------------------------------------------------------------------
// Public props type
// ---------------------------------------------------------------------------

export type BlockieAddressProps = IconBaseProps & {
  address: string;
  /**
   * 'canvas' — original DOM-append behaviour (default)
   * 'svg'    — pure SVG element, compatible with IconType from react-icons
   */
  outputType?: 'canvas' | 'svg';
  /** Only used by canvas outputType. @default 0 */
  borderRadius?: number;
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * Renders a blockie avatar for an Ethereum or Solana address.
 *
 * When outputType="svg" the component satisfies react-icons' `IconType`:
 *
 * @example
 * // As a regular component
 * <BlockieAddress address={addr} size={40} borderRadius={8} />
 *
 * // As an icon compatible with IconType
 * const Icon: IconType = createBlockieIcon(addr);
 * const item: ItemType = { icon: Icon, label: 'My Wallet' };
 */
export function BlockieAddressV2({
  address,
  size = 24,
  color: _color,
  title,
  className,
  style,
  borderRadius = 0,
  outputType = 'canvas',
  ...svgProps
}: BlockieAddressProps) {
  const normalized = normalizeAddress(address);
  const isSolana = isSolanaAddress(address);
  const numericSize = typeof size === 'string' ? parseFloat(size) : size;

  if (outputType === 'svg') {
    const sharedProps: SVGBlockieProps = {
      address: normalized,
      size: numericSize,
      title: typeof title === 'string' ? title : undefined,
      className,
      style,
      ...svgProps,
    };

    return isSolana ? (
      <SolanaBlockieSVG {...sharedProps} />
    ) : (
      <EthBlockieSVG {...sharedProps} />
    );
  }

  return (
    <CanvasBlockie
      address={normalized}
      size={numericSize}
      borderRadius={borderRadius}
      className={className}
      style={style}
    />
  );
}

// ---------------------------------------------------------------------------
// Factory — bind an address to produce a valid IconType
// ---------------------------------------------------------------------------

/**
 * Creates a component that fully satisfies `IconType` from react-icons,
 * bound to a specific wallet address.
 *
 * @example
 * const WalletIcon: IconType = createBlockieIcon(address);
 * const item: ItemType = { icon: WalletIcon, label: 'My Wallet' };
 * <CardItem item={item} />
 */
export function createBlockieIcon(address: string) {
  const BlockieIcon = (props: IconBaseProps) => (
    <BlockieAddressV2 address={address} outputType="svg" {...props} />
  );
  BlockieIcon.displayName = `BlockieIcon(${address.slice(0, 6)}…)`;
  return BlockieIcon;
}
