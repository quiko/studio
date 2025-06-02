import type { SVGProps } from 'react';

export function ObsessionFullTextLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
      {/* The "O" icon elements have been removed */}
      {/* <g transform="scale(0.95) translate(2.5, 2.5)">
        <path fillRule="evenodd" clipRule="evenodd" d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10ZM50 82C32.3269 82 18 67.6731 18 50C18 32.3269 32.3269 18 50 18C67.6731 18 82 32.3269 82 50C82 67.6731 67.6731 82 50 82Z"/>
        <rect x="24" y="28" width="10" height="3.5" rx="1.5"/>
        <rect x="22" y="34" width="10" height="3.5" rx="1.5"/>
        <rect x="24" y="40" width="10" height="3.5" rx="1.5"/>
        <rect x="24" y="56.5" width="10" height="3.5" rx="1.5"/>
        <rect x="22" y="62.5" width="10" height="3.5" rx="1.5"/>
        <rect x="24" y="68.5" width="10" height="3.5" rx="1.5"/>
        <rect x="66" y="28" width="10" height="3.5" rx="1.5"/>
        <rect x="68" y="34" width="10" height="3.5" rx="1.5"/>
        <rect x="66" y="40" width="10" height="3.5" rx="1.5"/>
        <rect x="66" y="56.5" width="10" height="3.5" rx="1.5"/>
        <rect x="68" y="62.5" width="10" height="3.5" rx="1.5"/>
        <rect x="66" y="68.5" width="10" height="3.5" rx="1.5"/>
      </g> */}
      <text 
        x="0"  // Adjusted x-coordinate from 110 to 0
        y="78" 
        fontFamily="Arial, 'Helvetica Neue', Helvetica, sans-serif" 
        fontSize="70" 
        fontWeight="bold"
      >
        BSESSION
      </text>
    </svg>
  );
}
