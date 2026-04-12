import { createIcon } from '@download/blockies';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { isSolanaAddress } from 'src/modules/solana/shared';
import { normalizeAddress } from 'src/shared/normalize-address';
import { generateSolanaBlockie } from './generateSolanaBlockie';

export function BlockieAddress({
  address,
  size,
  borderRadius,
}: {
  address: string;
  size: number;
  borderRadius: number;
}) {
  const blocksCount = 8;
  const icon = useMemo(
    () =>
      isSolanaAddress(address)
        ? generateSolanaBlockie(normalizeAddress(address), size)
        : createIcon({
            seed: normalizeAddress(address),
            size: blocksCount,
            scale: (size / blocksCount) * window.devicePixelRatio,
          }),
    [address, size]
  );
  const ref = useRef<HTMLSpanElement | null>(null);
  useLayoutEffect(() => {
    if (ref.current && icon) {
      icon.style.borderRadius = `${borderRadius}px`;
      icon.style.width = `${size}px`;
      icon.style.height = `${size}px`;
      icon.style.display = 'block';
      ref.current.appendChild(icon);
    }
    return () => {
      icon.parentElement?.removeChild(icon);
    };
  }, [icon, size, borderRadius]);
  return <span ref={ref} />;
}
