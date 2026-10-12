"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/authService";
import { useRegisterMutation, useLoginMutation } from "@/store/api/authApi";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { registerSchema, loginSchema } from "@/lib/utils";
import { resetSessionGuard } from "@/lib/sessionGuard";
import { UserRole, AuthResponse } from "@/types/api.types";
import {
  useAppDispatch,
  useAppSelector,
  setCredentials,
  setAuthMode,
} from "@/store";
import { crmApi } from "@/store/api/baseApi";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { authMode, selectedRole } = useAppSelector((state) => state.auth);

  // Form Fields State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // RTK Query Mutations
  const [registerUser, { isLoading: isRegisterLoading }] =
    useRegisterMutation();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginMutation();

  const isLoading = isRegisterLoading || isLoginLoading;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleEnum =
      selectedRole === "tl" ? UserRole.TEAM_LEADER : UserRole.SALES_EXECUTIVE;

    if (authMode === "register") {
      const input = {
        name: fullName.trim(),
        email: email.trim(),
        confirmPassword,
        password,
        role: roleEnum,
      };

      const result = registerSchema.safeParse(input);
      if (!result.success) {
        const errorMsg =
          result.error.issues[0]?.message ||
          "Please check your registration details";
        toast.error(errorMsg);
        return;
      }

      try {
        const res = await registerUser({
          name: result.data.name,
          email: result.data.email,
          password: result.data.password,
          role: result.data.role,
        }).unwrap();

        redirectTo(res);
      } catch (err) {
        toast.error(getAuthErrorMessage(err));
      }
    } else {
      const loginInput = {
        email: email.trim(),
        password,
      };

      const result = loginSchema.safeParse(loginInput);
      if (!result.success) {
        const errorMsg =
          result.error.issues[0]?.message ||
          "Please enter a valid email and password";
        toast.error(errorMsg);
        return;
      }

      try {
        const res = await loginUser({
          email: result.data.email,
          password: result.data.password,
        }).unwrap();

        redirectTo(res);
      } catch (err) {
        setIsRedirecting(false);
        toast.error(getAuthErrorMessage(err));
      }
    }
  };

  const redirectTo = (res: AuthResponse) => {
    if (res.data?.user) {
      // Re-arm the 401 guard so a future genuine session expiry is handled
      // instead of being suppressed by the persisted guard from a prior logout.
      resetSessionGuard();
      // Clear any cached data from a previous user BEFORE loading the new
      // session, preventing cross-user data leakage on a shared browser.
      dispatch(crmApi.util.resetApiState());
      dispatch(
        setCredentials({
          user: res.data.user,
          token: res.data.token || res.data.user.token,
        }),
      );

      const role = res.data.user.role;
      setIsRedirecting(true);
      toast.success(
        res.message || `Welcome back, ${res.data.user.name || "User"}!`,
      );
      if (role === UserRole.ADMIN) {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
      router.refresh();
    } else {
      toast.error(
        "Authentication completed without a session. Please try again.",
      );
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col">
      {/* ------------------------------------------------------------- */}
      {/* Clean Heading */}
      {/* ------------------------------------------------------------- */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {authMode === "register" ? "Create Account" : "Sign In"}
        </h2>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Form Fields */}
      {/* ------------------------------------------------------------- */}
      <form
        onSubmit={handleAuthSubmit}
        noValidate
        className="flex flex-col gap-3.5"
      >
        {/* Name Field (Register Mode) */}
        {authMode === "register" && (
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="name-input"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Name"
              className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-card border border-slate-300 dark:border-slate-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        )}

        {/* Email Field */}
        <div className="relative flex items-center">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            id="email-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-card border border-slate-300 dark:border-slate-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
        </div>

        {/* Inline Two Columns: Phone Number + Role Dropdown (Register Mode) */}
        {authMode === "register" && (
          <div className="relative flex items-center">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="w-full h-11 pl-10 pr-3.5 rounded-lg bg-card border border-slate-300 dark:border-slate-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        )}

        {/* Password Field */}
        <div className="relative flex items-center">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            id="password-input"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-11 pl-10 pr-10 rounded-lg bg-card border border-slate-300 dark:border-slate-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Confirm Password Field (Register Mode) */}
        {authMode === "register" && (
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              id="confirm-password-input"
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full h-11 pl-10 pr-10 rounded-lg bg-card border border-slate-300 dark:border-slate-500 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 text-sm focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>
        )}

        {/* Forgot Password (Login Mode) */}
        {authMode === "login" && (
          <div className="flex justify-end -mt-1">
            <button
              type="button"
              onClick={() =>
                toast.info(
                  "Please contact your CRM administrator to reset your password.",
                )
              }
              className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Solid Blue Action Button (No Gradients, Minimalist) */}
        {/* ------------------------------------------------------------- */}
        <button
          type="button"
          onClick={handleAuthSubmit}
          disabled={isLoading || isRedirecting}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-75"
        >
          {isLoading || isRedirecting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {isRedirecting
                  ? "Redirecting..."
                  : authMode === "register"
                    ? "Creating Account..."
                    : "Signing in..."}
              </span>
            </div>
          ) : (
            <span>{authMode === "register" ? "Next" : "Next"}</span>
          )}
        </button>

        {/* ------------------------------------------------------------- */}
        {/* Bottom Minimalist Link */}
        {/* ------------------------------------------------------------- */}
        <div className="text-center pt-2">
          {authMode === "register" ? (
            <button
              type="button"
              onClick={() => dispatch(setAuthMode("login"))}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline cursor-pointer"
            >
              Already have an account?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dispatch(setAuthMode("register"))}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline cursor-pointer"
            >
              Don&apos;t have an account? Create one
            </button>
          )}
        </div>

        <Link
          href={"/"}
          className="w-fit mx-auto text-sm flex items-center justify-center gap-2 hover:text-brand-primary/70 hover:active-95 transition-colors text-slate-500 dark:text-slate-400 "
        >
          <ArrowLeft className="size-5" />
          Back to Home
        </Link>
      </form>
    </div>
  );
}
