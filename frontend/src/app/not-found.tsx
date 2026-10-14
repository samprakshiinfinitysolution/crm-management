import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Branded 404 for dead or mistyped routes, with recovery paths back to the
 * public surface so crawlers and users never land on a bare Next.js default.
 */
export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold shadow-xs">
        LF
      </div>

      <p className="mt-6 text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
        404
      </p>

      <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        We couldn&apos;t find that page
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
        The page you&apos;re looking for may have been moved, renamed, or never
        existed. Try one of the links below instead.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs transition-colors"
        >
          Back to home
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold transition-colors"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
