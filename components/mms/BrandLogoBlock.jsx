"use client";

import React from "react";

export default function BrandLogoBlock({ compact = false }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <img
        src="/valict-logo.png"
        alt="MMS Logo"
        className={`${compact ? "h-12" : "h-14"} w-auto max-w-[190px] object-contain`}
      />
      <div>
        <div className="text-base font-black tracking-widest text-white leading-tight">MMS</div>
        <div className="text-[11px] text-slate-400 font-medium leading-tight">Mall Management System</div>
      </div>
    </div>
  );
}
