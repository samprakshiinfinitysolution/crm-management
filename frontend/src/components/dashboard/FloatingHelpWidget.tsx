"use client";

import React, { useState } from "react";
import { SellerHelpModal } from "./SellerHelpModal";

export function FloatingHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-[#212121] hover:bg-black text-white px-4 py-2 rounded-full font-medium text-xs sm:text-sm shadow-xl flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/10"
        title="Get Seller Help and Documentation"
      >
        <span>Help</span>
        <span className="w-4 h-4 rounded-full bg-white/20 text-white flex items-center justify-center text-[10px] font-bold">
          ?
        </span>
      </button>

      <SellerHelpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
