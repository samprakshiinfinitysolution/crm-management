"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { useAppDispatch, useAppSelector, setAuthMode } from "@/store";
import { UserRole } from "@/types/api.types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Image from "next/image";
import { CLOUDINARY_IMAGES } from "@/lib/cloudinaryImages";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      if (user.role === UserRole.ADMIN) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
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
    <main className="min-h-screen bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden transition-colors">
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle
          variant="button"
          className="shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800"
        />
      </div>

      {/* Atmospheric softening overlay so background image contrasts cleanly */}
      <div className="absolute inset-0 bg-slate-500/15 dark:bg-slate-950/60 backdrop-blur-[2px] z-10 transition-all pointer-events-none" />

      <Image
        src={CLOUDINARY_IMAGES.signIn}
        alt="LeadFlow CRM Enterprise Workspace"
        fill
        priority
        className="object-cover object-center scale-105 transition-transform duration-1000"
        sizes="100vw"
      />

      {/* ------------------------------------------------------------- */}
      {/* Main Floating Auth Container */}
      {/* ------------------------------------------------------------- */}
      <div className="w-full max-w-sm sm:max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-lg shadow-2xl border border-white/60 dark:border-slate-800/80 overflow-hidden relative z-20 transition-all">
        {/* Clean Minimalist Auth Form */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
