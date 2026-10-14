"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import { useAppDispatch, useAppSelector, setAuthMode } from "@/store";
import { UserRole } from "@/types/api.types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { CLOUDINARY_IMAGES } from "@/lib/cloudinaryImages";

/**
 * Split-screen modern login & authentication page.
 *
 * Left: Clean Cusana Auth Form with Google/Apple SSO and email authentication.
 * Right: High-fidelity dark analytics bento showcase dashboard.
 */
export default function LoginClient() {
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
    <main className="min-h-screen w-full relative flex flex-col lg:flex-row bg-white dark:bg-slate-900 transition-colors">
      <Image
        src={CLOUDINARY_IMAGES.signIn}
        alt="Background Image"
        width={1920}
        height={1080}
        className="object-cover absolute inset-0 w-screen h-screen"
        priority
      />
      <div className="absolute inset-0 w-screen h-screen bg-card/10 backdrop-blur-[2px]" />
      {/* ------------------------------------------------------------- */}
      {/* Left Column: Auth Form Panel */}
      {/* ------------------------------------------------------------- */}
      <section className="w-fit mx-auto flex flex-col justify-between my-auto py-6 px-12 relative z-10 bg-white dark:bg-slate-900 rounded-lg border border-secondary shadow-lg transition-colors">
        {/* Top utility row: Back to Home + Theme Toggle */}
        <div className="flex items-center justify-between w-full mb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <ThemeToggle
            variant="button"
            className="shadow-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>

        {/* Center: Interactive Form */}
        <div className="w-full">
          <AuthForm />
        </div>

        {/* Bottom Footer (matching Cusana footer in screenshot) */}
        <footer className="w-full mt-4 flex flex-col sm:flex-row pt-2 items-center justify-center gap-3 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80">
          <span>© 2025 LeadFlow Inc. All rights reserved.</span>
        </footer>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* Right Column: Dark Analytics Showcase Dashboard (50% desktop) */}
      {/* ------------------------------------------------------------- */}
      {/*<section className="hidden lg:flex lg:w-1/2 min-h-screen relative border-l border-slate-800/60 overflow-hidden">
        <LoginShowcase />
      </section>*/}
    </main>
  );
}
