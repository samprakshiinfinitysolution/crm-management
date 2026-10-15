"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { getAuthErrorMessage } from "@/lib/authService";
import { useRegisterMutation, useLoginMutation } from "@/store/api/authApi";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
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

  // Restore remembered email on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedEmail = localStorage.getItem("crm_remember_email");
        if (savedEmail) {
          setEmail(savedEmail);
          setRememberMe(true);
        }
      } catch {
        // Ignore storage access errors
      }
    }, 0);
    return () => clearTimeout(timer);
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

  const handleForgotPassword = () => {
    toast.info("Please contact your CRM administrator to reset your password.");
  };

  return (
    <div
      className={cn(
        "w-full mx-auto flex flex-col justify-center transition-all duration-200",
        authMode === "register" ? "max-w-xl sm:max-w-2xl" : "max-w-105",
      )}
    >
      {/* ------------------------------------------------------------- */}
      {/* Heading */}
      {/* ------------------------------------------------------------- */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-[26px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
          {authMode === "register"
            ? "Welcome to LeadFlow"
            : "Welcome Back to LeadFlow"}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 font-normal">
          {authMode === "register"
            ? "Enter your details to create your workspace account."
            : "Enter your username and password to continue."}
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Form Fields */}
      {/* ------------------------------------------------------------- */}
      <form onSubmit={handleAuthSubmit} noValidate className="flex flex-col">
        <div
          className={cn(
            authMode === "register"
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5"
              : "flex flex-col gap-3.5 mb-5",
          )}
        >
          {/* Register: Full Name */}
          {authMode === "register" && (
            <div>
              <label
                htmlFor="name-input"
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-11 px-4 rounded-xl border border-transparent focus:border-[#0F3A7A]/30 focus:bg-white bg-[#EEF4FC] dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3A7A]/15 dark:focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label
              htmlFor="email-input"
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
            >
              Email
            </label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full h-11 px-4 rounded-xl border border-transparent focus:border-[#0F3A7A]/30 focus:bg-white bg-[#EEF4FC] dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3A7A]/15 dark:focus:ring-blue-500/20 transition-all"
            />
          </div>

          {/* Register: Phone Number */}
          {authMode === "register" && (
            <div className="sm:col-span-2">
              <label
                htmlFor="phone-input"
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Phone Number
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number (optional)"
                className="w-full h-11 px-4 rounded-xl border border-transparent focus:border-[#0F3A7A]/30 focus:bg-white bg-[#EEF4FC] dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3A7A]/15 dark:focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {/* Password Field */}
          <div>
            <label
              htmlFor="password-input"
              className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 pl-4 pr-11 rounded-xl border border-transparent focus:border-[#0F3A7A]/30 focus:bg-white bg-[#EEF4FC] dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3A7A]/15 dark:focus:ring-blue-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 cursor-pointer transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Register: Confirm Password */}
          {authMode === "register" && (
            <div>
              <label
                htmlFor="confirm-password-input"
                className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="confirm-password-input"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full h-11 pl-4 pr-11 rounded-xl border border-transparent focus:border-[#0F3A7A]/30 focus:bg-white bg-[#EEF4FC] dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F3A7A]/15 dark:focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          )}

          {/* Remember me & Forgot password Row (Login Mode) */}
          {authMode === "login" && (
            <div className="flex items-center justify-between mt-0.5 mb-1">
              <label
                htmlFor="remember-me"
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#0F3A7A] focus:ring-[#0F3A7A] dark:border-slate-700 dark:bg-slate-800 cursor-pointer accent-[#0F3A7A]"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-[#0F3A7A] dark:hover:text-blue-400 hover:underline cursor-pointer transition-colors"
              >
                Forgot password
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Navy Blue Action Button (matching reference image) */}
        {/* ------------------------------------------------------------- */}
        <button
          type="submit"
          disabled={isLoading || isRedirecting}
          className="w-full h-11 bg-[#0F3A7A] hover:bg-[#0c2f63] active:bg-[#09244d] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#0F3A7A]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
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
            <>
              <span>{authMode === "register" ? "Register" : "Sign In"}</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>

        {/* ------------------------------------------------------------- */}
        {/* Switch Between Login and Register */}
        {/* ------------------------------------------------------------- */}
        <div className="text-center mt-5 text-xs text-slate-500 dark:text-slate-400">
          {authMode === "register" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => dispatch(setAuthMode("login"))}
                className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => dispatch(setAuthMode("register"))}
                className="font-semibold text-slate-900 dark:text-white hover:underline cursor-pointer transition-colors"
              >
                Register
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
