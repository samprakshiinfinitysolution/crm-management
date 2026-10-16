"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { useAppDispatch, useAppSelector, setAuthMode } from "@/store";
import { UserRole } from "@/types/api.types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { CLOUDINARY_IMAGES } from "@/lib/cloudinaryImages";

/**
 * CRM Management Hub Authentication Page.
 * High-density layout matching the project's marketplace UI theme and structure.
 */
export default function LoginClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      const targetUrl = user.role === UserRole.ADMIN ? "/admin" : "/dashboard";
      if (typeof window !== "undefined") {
        window.location.replace(targetUrl);
      } else {
        router.replace(targetUrl);
      }
      return;
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get("mode");
      if (modeParam === "register" || modeParam === "login") {
        dispatch(setAuthMode(modeParam));
      }
    }
  }, [router, dispatch, user]);

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col bg-[#f1f3f6] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Background Wallpaper with Theme-Adaptive Overlay (Fixed & Stable) */}
      <div className="fixed inset-0 w-screen h-screen z-0 pointer-events-none select-none">
        <Image
          src={CLOUDINARY_IMAGES.signIn}
          alt="Seller Hub Background"
          fill
          className="object-cover opacity-85 dark:opacity-35"
          priority={false}
          decoding="async"
        />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. Top Header: CRM Management Hub Brand Bar (Fixed at top) */}
      {/* ------------------------------------------------------------- */}
      <header className="relative z-20 shrink-0 h-14 w-full px-4 sm:px-6 text-white flex items-center justify-between shadow-xs bg-slate-900/20 backdrop-blur-xs border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xs bg-white text-[#2874f0] flex items-center justify-center font-black text-xs shadow-2xs group-hover:bg-blue-50 transition-colors">
              LF
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-bold text-base tracking-tight text-white">
                LeadFlow
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-sm bg-blue-700/60 hover:bg-blue-800 text-white text-xs font-semibold border border-blue-400/30 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Link>

          <ThemeToggle
            variant="button"
            className="h-8 w-8 rounded-sm bg-blue-700/60 hover:bg-blue-800 text-white border border-blue-400/30 shadow-2xs"
          />
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Center Body: Only Form & Its Content Scrolls */}
      {/* ------------------------------------------------------------- */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto flex flex-col items-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-115 my-auto space-y-4">
          {/* Main Card */}
          <section className="bg-white dark:bg-slate-900 rounded-sm border border-[#e0e0e0] dark:border-slate-800 shadow-md overflow-hidden">
            {/* Auth Form Component */}
            <AuthForm />
          </section>

          {/* Trust Safeguards Strip */}
          <div className="flex items-center justify-center flex-wrap gap-4 text-[11px] text-card/80 dark:text-slate-400 select-none pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>256-Bit SSL Protected</span>
            </span>
            <span className="text-card/80">•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>RBAC Security</span>
            </span>
            <span className="text-card/80">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Audit Logging</span>
            </span>
          </div>

          {/* Footer Copyright */}
          <footer className="text-center text-[11px] text-card/80 dark:text-slate-400 pb-2">
            © 2026 LeadFlow CRM Platform. Enterprise Lead Distribution Engine.
          </footer>
        </div>
      </main>
    </div>
  );
}
