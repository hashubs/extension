import { SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  size?: number;
}

export const SelvoLogo = ({ size = 163.84, ...props }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={size}
    height={size}
    fillRule="evenodd"
    clipRule="evenodd"
    imageRendering="optimizeQuality"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    viewBox="0 0 1706.66 1706.66"
    style={
      {
        '--logo-background': '#00A755',
        '--logo-fill': '#fff',
      } as React.CSSProperties
    }
    {...props}
  >
    <g id="Layer_x0020_1">
      <path
        fill="var(--logo-background)"
        d="M324.14 0h1058.39c178.7 0 324.14 145.44 324.14 324.14v1058.39c0 178.7-145.44 324.14-324.14 324.14H324.14C145.44 1706.67 0 1561.23 0 1382.53V324.14C0 145.44 145.44 0 324.14 0"
      />
      <path
        fill="var(--logo-fill)"
        d="M573.73 458.76c-6.86-4.28-13.74-8.56-20.61-12.85-135.59 81.79-193.28 252.73-99.59 355.33 36.93 40.43 171.52 114.13 227.32 148.8 185.11 115.05 244.14 150.72 480.01 297.72 6.85 4.28 13.74 8.56 20.61 12.85 120.2-72.51 179.18-215.09 125.74-318-14.15-27.24-36.18-51.71-67.04-71.37-221.64-141.14-444.2-273.99-666.44-412.49zm737.97 184.32-417.83.94 56.11-192.59s359.29-58.51 361.71 191.65zm-905.87 412.85 417.83-.94-58.32 200.14s-357.08 50.96-359.51-199.2"
      />
    </g>
  </svg>
);
