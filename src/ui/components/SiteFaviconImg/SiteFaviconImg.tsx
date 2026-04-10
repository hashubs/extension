import { DappIconFetcher } from '@/ui/components/DappIconFetcher';
import { Image } from '@/ui/ui-kit/media-fallback';
import React from 'react';
import { IoGlobe } from 'react-icons/io5';
import { DelayedRender } from '../DelayedRender';

type Props = {
  url: string;
  size: number | string;
  style?: React.CSSProperties;
};

function FallbackIcon({ url, size, style }: Props) {
  const siteNamePreview = new URL(url).hostname.split('.').at(-2)?.slice(0, 2);
  return siteNamePreview ? (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '20%',
        backgroundColor: 'var(--neutral-700)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <span className="text-white">{siteNamePreview}</span>
    </div>
  ) : (
    <IoGlobe style={{ color: 'var(--primary)', ...style }} />
  );
}

export function SiteFaviconImg({
  url,
  size,
  style: styleProp,
  ...imgProps
}: Props & React.ImgHTMLAttributes<HTMLImageElement>) {
  const style = { width: size, height: size, ...styleProp };
  return (
    <DappIconFetcher
      url={url}
      render={(src) =>
        src == null ? (
          <div style={{ width: size, height: size }}>
            <DelayedRender>
              <FallbackIcon size={size} url={url} style={styleProp} />
            </DelayedRender>
          </div>
        ) : (
          <Image
            style={style}
            src={src}
            {...imgProps}
            renderError={() => (
              <Image
                style={style}
                src={`${url}/favicon.ico`}
                renderError={() => (
                  <FallbackIcon size={size} url={url} style={styleProp} />
                )}
              />
            )}
          />
        )
      }
    />
  );
}
