import React, { useState } from 'react';

interface BaseProps {
  src?: string | null;
  symbol?: string;
  size?: number;
  style?: React.CSSProperties;
  title?: string;
}
type Props = BaseProps & ({ src: string } | { symbol: string });

export function TokenIcon({ src, symbol, size = 32, style, title }: Props) {
  const [hasError, setHasError] = useState(false);

  const fallback = (
    <div
      data-image-src={String(src)}
      style={{
        userSelect: 'none',
        backgroundColor: '#282a2d',
        borderRadius: '50%',
        textAlign: 'center',
        lineHeight: `${size}px`,
        fontSize: size <= 24 ? 8 : size <= 36 ? 10 : 14,
        width: size,
        height: size,
        color: 'white',
        ...style,
      }}
    >
      {symbol?.slice(0, 3) || '???'}
    </div>
  );

  return src && !hasError ? (
    <img
      src={src}
      alt={title || symbol || ''}
      title={title}
      style={{
        width: size,
        height: size,
        display: 'block',
        borderRadius: '50%',
        ...style,
      }}
      onError={() => setHasError(true)}
    />
  ) : (
    fallback
  );
}
