"use client";

import React from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme, type Theme } from "@/components/providers/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "button" | "dropdown" | "segmented";
  size?: "sm" | "default" | "lg";
  className?: string;
  align?: "start" | "center" | "end";
}

export function ThemeToggle({
  variant = "dropdown",
  size = "default",
  className,
  align = "end",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();

  // Simple direct toggle button (quick 1-click toggle)
  if (variant === "button") {
    const buttonLabel = mounted
      ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
      : "Toggle theme";

    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
        title={buttonLabel}
        suppressHydrationWarning
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          size === "sm" && "w-8 h-8 text-xs",
          size === "default" && "w-9 h-9 text-sm",
          size === "lg" && "w-10 h-10 text-base",
          "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
          "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white",
          className,
        )}
      >
        {!mounted ? (
          <span className="w-4 h-4 opacity-0" />
        ) : resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 transition-transform duration-200 text-blue-400 rotate-0 scale-100" />
        ) : (
          <Sun className="w-4 h-4 transition-transform duration-200 text-amber-500 rotate-0 scale-100" />
        )}
      </button>
    );
  }

  // Segmented control (ideal for settings / profile page)
  if (variant === "segmented") {
    const options: Array<{
      value: Theme;
      label: string;
      icon: React.ElementType;
    }> = [
      { value: "light", label: "Light", icon: Sun },
      { value: "dark", label: "Dark", icon: Moon },
      { value: "system", label: "System", icon: Laptop },
    ];

    return (
      <div
        className={cn(
          "inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 dark:bg-slate-900/90 dark:border-slate-800",
          className,
        )}
        role="radiogroup"
        aria-label="Theme mode"
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = mounted && theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(opt.value)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                isSelected
                  ? "bg-white text-blue-600 shadow-xs dark:bg-slate-800 dark:text-blue-400 font-semibold"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: Dropdown menu with Light, Dark, System
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        aria-label="Select theme"
        title="Theme settings"
        suppressHydrationWarning
        className={cn(
          "relative inline-flex items-center justify-center rounded-lg border transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 select-none",
          size === "sm" && "w-8 h-8 text-xs",
          size === "default" && "w-9 h-9 text-sm",
          size === "lg" && "w-10 h-10 text-base",
          "border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
          "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white",
          className,
        )}
      >
        {!mounted ? (
          <span className="w-4 h-4 opacity-0" />
        ) : resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-blue-400 transition-transform duration-200 hover:rotate-12" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={6}
        className="w-36 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 text-slate-800 dark:text-slate-200"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            mounted &&
              theme === "light" &&
              "text-blue-600 dark:text-blue-400 font-semibold",
          )}
        >
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </div>
          {mounted && theme === "light" && <Check className="w-3.5 h-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            mounted &&
              theme === "dark" &&
              "text-blue-600 dark:text-blue-400 font-semibold",
          )}
        >
          <div className="flex items-center gap-2">
            <Moon className="w-3.5 h-3.5 text-blue-400" />
            <span>Dark</span>
          </div>
          {mounted && theme === "dark" && <Check className="w-3.5 h-3.5" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors",
            "hover:bg-slate-100 dark:hover:bg-slate-800",
            mounted &&
              theme === "system" &&
              "text-blue-600 dark:text-blue-400 font-semibold",
          )}
        >
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            <span>System</span>
          </div>
          {mounted && theme === "system" && <Check className="w-3.5 h-3.5" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeToggle;
