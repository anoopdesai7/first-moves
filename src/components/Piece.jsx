import React from "react";

// Small, self-contained vector pieces: no fonts, image requests, or remote assets.
export default function Piece({ type, color, className = "" }) {
  const light = color === "w";
  const fill = light ? "#fffdf5" : "#203c3b";
  const stroke = light ? "#344b48" : "#102c2b";
  const detail = light ? "#536761" : "#8da29a";
  return (
    <svg
      viewBox="0 0 60 60"
      className={`piece ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <g
        fill={fill}
        stroke={stroke}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {type === "p" && (
          <>
            <circle cx="30" cy="17" r="7" />
            <path d="M24 24h12c0 9 1 12 6 17v4H18v-4c5-5 6-8 6-17Z" />
            <path d="M19 45h22l4 6H15Z" />
            <path d="M22 40h16" stroke={detail} />
          </>
        )}
        {type === "r" && (
          <>
            <path d="M16 10h7v8h5v-8h5v8h5v-8h7v17l-7 6 2 12H20l2-12-6-6Z" />
            <path d="M19 44h22l4 7H15Z" />
            <path d="M20 28h20M24 34h12" stroke={detail} />
          </>
        )}
        {type === "n" && (
          <>
            <path d="m20 45 1-8 10-11-9 5-7-5 6-13 10-6 6 1 1 7c9 7 11 16 8 30Z" />
            <path d="m23 15 1-8 6 3M22 45h22l3 6H15l3-6Z" />
            <path
              d="M36 19c6 8 7 14 5 21M20 24l5-2"
              fill="none"
              stroke={detail}
            />
            <circle cx="30" cy="17" r="1.7" fill={stroke} stroke="none" />
          </>
        )}
        {type === "b" && (
          <>
            <circle cx="30" cy="8" r="2.7" />
            <path d="M30 11c-5 4-12 12-10 18 1 4 5 5 6 7l-7 8h22l-7-8c1-2 5-3 6-7 2-6-5-14-10-18Z" />
            <path d="m32 17-6 10M24 34h12" stroke={detail} />
            <path d="M19 44h22l5 7H14Z" />
            <path d="M22 47h16" stroke={detail} />
          </>
        )}
        {type === "q" && (
          <>
            <path d="m16 19 8 8 6-13 6 13 8-8-5 20H21Z" />
            <circle cx="15" cy="16" r="3.2" />
            <circle cx="30" cy="11" r="3.2" />
            <circle cx="45" cy="16" r="3.2" />
            <path d="M22 39h16l3 6H19Z" />
            <path d="M19 45h22l5 6H14Z" />
            <path d="M23 35h14M23 42h14" stroke={detail} />
          </>
        )}
        {type === "k" && (
          <>
            <path d="M27 6h6v5h5v5h-5v6h-6v-6h-5v-5h5Z" />
            <path d="M30 24c-10-12-19-4-14 5l8 11h12l8-11c5-9-4-17-14-5Z" />
            <path d="M22 39h16l3 6H19Z" />
            <path d="M19 45h22l5 6H14Z" />
            <path d="M30 26v10M23 42h14" stroke={detail} />
          </>
        )}
      </g>
    </svg>
  );
}
