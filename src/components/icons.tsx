
import * as React from "react";
import { PiggyBank } from "lucide-react";

export const NexusLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="nexusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M50 10 L90 50 L50 90 L10 50 Z"
      stroke="url(#nexusGradient)"
      strokeWidth="10"
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <path
      d="M30 30 L70 70 M70 30 L30 70"
      stroke="url(#nexusGradient)"
      strokeWidth="8"
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const ZLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth="5"
    {...props}
  >
    <circle cx="50" cy="50" r="45" />
    <path d="M30 35 L70 35 L30 65 L70 65" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


export const VerifiedNexusCheck = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
       <linearGradient id="verifiedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke="url(#verifiedGradient)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="url(#verifiedGradient)"
      fillOpacity="0.2"
    />
    <path
        d="M8.5 12.5L11 15L15.5 10.5"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
  </svg>
);

export const NexusCoinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="coinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "#FBBF24" }} />
        <stop offset="100%" style={{ stopColor: "#F59E0B" }} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#coinGradient)" stroke="#ca8a04" />
    <path d="M12 6L16 12L12 18L8 12Z" stroke="white" strokeWidth="1.5" fill="none" />
    <path d="M9 9L15 15M15 9L9 15" stroke="white" strokeWidth="1" fill="none" />
  </svg>
);
