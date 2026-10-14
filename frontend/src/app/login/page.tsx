import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to LeadFlow CRM to manage leads, distributions, follow-ups and sales performance.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  alternates: {
    canonical: "/login",
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
