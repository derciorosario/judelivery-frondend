import React from "react";
import { Sparkles } from 'lucide-react';

/**
 * Full screen loader with brand gradient spinner.
 * Props:
 * - message?: string (default: "Loading…")
 * - tip?: string (small helper text)
 * - notFull?: boolean (if true, doesn't take full screen height)
 */
export default function FullPageLoader({ message = "Loading…", tip, notFull, transparent,top }) {
  return (
    <div
      className={`${
        !notFull ? "min-h-screen" : "py-2"
      } grid place-items-center ${transparent ? 'bg-white/65':' bg-gray-50'} ${top ? 'fixed left-0 top-0 w-full h-[100vh] bg-white z-50':''}`}
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinner */}
        <div
          className="relative w-20 h-20"
          role="status"
          aria-live="polite"
          aria-label={message}
        >
          <div className="w-20 h-20 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <Sparkles className="w-8 h-8 text-primary-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>

        {/* Message */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-800">{message}</p>
          {tip && <p className="mt-1 text-xs text-gray-500">{tip}</p>}
        </div>

      </div>

      {/* Reduced motion support */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin { animation: none !important; }
          [style*="shimmer_1.2s_infinite"] { display:none; }
        }
      `}</style>
    </div>
  );
}
