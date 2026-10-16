"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/authService";
import { useRegisterMutation, useLoginMutation } from "@/store/api/authApi";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  LogIn,
  UserPlus,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { registerSchema, loginSchema, cn } from "@/lib/utils";
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
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // RTK Query Mutations
  const [registerUser, { isLoading: isRegisterLoading }] =
    useRegisterMutation();
  const [loginUser, { isLoading: isLoginLoading }] = useLoginMutation();

  const isLoading = isRegisterLoading || isLoginLoading;

  // Restore remembered email on mount without blocking initial paint
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("crm_remember_email");
      if (savedEmail) {
        queueMicrotask(() => {
          setEmail((prev) => prev || savedEmail);
          setRememberMe(true);
        });
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const handleAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
        // Persist or remove remembered email
        if (typeof window !== "undefined") {
          try {
            if (rememberMe) {
              localStorage.setItem("crm_remember_email", email.trim());
            } else {
              localStorage.removeItem("crm_remember_email");
            }
          } catch {
            // Ignore storage access issues
          }
        }

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
      resetSessionGuard();
      dispatch(crmApi.util.resetApiState());
      const token = res.data.token || res.data.user.token || res.data.accessToken;
      if (token && typeof window !== "undefined") {
        document.cookie = `CRM_Management=${token}; path=/; SameSite=Lax`;
        document.cookie = `refreshToken=${token}; path=/; SameSite=Lax`;
      }
      dispatch(
        setCredentials({
          user: res.data.user,
          token: res.data.token || res.data.user.token,
          accessToken: res.data.accessToken,
        }),
      );

      const role = res.data.user.role;
      setIsRedirecting(true);
      toast.success(
        res.message || `Welcome back, ${res.data.user.name || "User"}!`,
      );
      const targetUrl = role === UserRole.ADMIN ? "/admin" : "/dashboard";
      if (typeof window !== "undefined") {
        window.location.assign(targetUrl);
      } else {
        router.replace(targetUrl);
      }
    } else {
      toast.error(
        "Authentication completed without a session. Please try again.",
      );
    }
  };

  const handleForgotPassword = () => {
    toast.info("Please contact your CRM administrator to reset your password.");
  };

  return (
    <div className="w-full select-none">
      {/* ------------------------------------------------------------- */}
      {/* 1. Flipkart Segmented Tabs Header */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-2 border-b border-[#e0e0e0] dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
        <button
          type="button"
          onClick={() => dispatch(setAuthMode("login"))}
          className={cn(
            "h-11 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
            authMode === "login"
              ? "bg-white dark:bg-slate-900 text-[#2874f0] border-b-2 border-[#2874f0]"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-b border-transparent",
          )}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          onClick={() => dispatch(setAuthMode("register"))}
          className={cn(
            "h-11 px-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
            authMode === "register"
              ? "bg-white dark:bg-slate-900 text-[#2874f0] border-b-2 border-[#2874f0]"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border-b border-transparent",
          )}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Form Body */}
      {/* ------------------------------------------------------------- */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header Text */}
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>
              {authMode === "register"
                ? "Create Workspace Account"
                : "Sign In to CRM Workspace"}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {authMode === "register"
              ? "Join the LeadFlow CRM sales distribution network"
              : "Enter your registered credentials to access your pipeline"}
          </p>
        </div>

        <form onSubmit={handleAuthSubmit} noValidate className="space-y-3.5">
          {/* Register: Full Name */}
          {authMode === "register" && (
            <div>
              <label
                htmlFor="name-input"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                <User className="w-3 h-3 text-[#2874f0]" />
                <span>Full Name</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="name-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors"
              />
            </div>
          )}

          {/* Email Address */}
          <div>
            <label
              htmlFor="email-input"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
            >
              <Mail className="w-3 h-3 text-[#2874f0]" />
              <span>Email Address</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@leadflow.io"
              className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors"
            />
          </div>

          {/* Register: Phone Number */}
          {authMode === "register" && (
            <div>
              <label
                htmlFor="phone-input"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                <Phone className="w-3 h-3 text-[#2874f0]" />
                <span>Phone Number</span>
                <span className="text-slate-400 font-normal lowercase">
                  (optional)
                </span>
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors"
              />
            </div>
          )}

          {/* Password */}
          <div>
            <label
              htmlFor="password-input"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
            >
              <Lock className="w-3 h-3 text-[#2874f0]" />
              <span>Password</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full h-8.5 pl-3 pr-9 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Register: Confirm Password */}
          {authMode === "register" && (
            <div>
              <label
                htmlFor="confirm-password-input"
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                <ShieldCheck className="w-3 h-3 text-[#2874f0]" />
                <span>Confirm Password</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                id="confirm-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-8.5 px-3 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2874f0] focus:border-[#2874f0] transition-colors"
              />
            </div>
          )}

          {/* Remember Me & Forgot Password (Login Mode) */}
          {authMode === "login" && (
            <div className="flex items-center justify-between pt-0.5 text-xs">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-1.5 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-slate-800"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-xs border-slate-300 text-[#2874f0] focus:ring-[#2874f0] accent-[#2874f0] cursor-pointer"
                />
                <span className="text-[11px] font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-semibold text-[#2874f0] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || isRedirecting}
              className="w-full h-9 bg-[#2874f0] hover:bg-[#1a5bb8] active:bg-[#154b98] text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isRedirecting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {isRedirecting
                      ? "Redirecting..."
                      : authMode === "register"
                        ? "Creating Account..."
                        : "Signing In..."}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {authMode === "register" ? "Create Account" : "Sign In"}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Bottom Switch Link */}
          <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
            {authMode === "register" ? (
              <p>
                Already have a workspace account?{" "}
                <button
                  type="button"
                  onClick={() => dispatch(setAuthMode("login"))}
                  className="font-bold text-[#2874f0] hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : (
              <p>
                New to LeadFlow CRM?{" "}
                <button
                  type="button"
                  onClick={() => dispatch(setAuthMode("register"))}
                  className="font-bold text-[#2874f0] hover:underline cursor-pointer"
                >
                  Register Account
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
