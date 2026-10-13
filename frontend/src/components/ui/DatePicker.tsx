"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (val: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showTime?: boolean;
  timeLabel?: string;
  minDate?: Date;
}

// Common business hour slots for 1-click follow-up selection
const QUICK_TIME_SLOTS = [
  { label: "09:30 AM", hour: 9, min: 30, period: "AM" as const },
  { label: "11:00 AM", hour: 11, min: 0, period: "AM" as const },
  { label: "02:00 PM", hour: 2, min: 0, period: "PM" as const },
  { label: "03:30 PM", hour: 3, min: 30, period: "PM" as const },
  { label: "05:00 PM", hour: 5, min: 0, period: "PM" as const },
  { label: "06:30 PM", hour: 6, min: 30, period: "PM" as const },
];

export function DatePicker({
  value,
  onChange,
  className,
  placeholder = "Select date & time",
  disabled = false,
  showTime = true,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial date & time from value prop
  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;
    const d = typeof value === "string" ? new Date(value) : value;
    return isValid(d) ? d : undefined;
  }, [value]);

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    parsedDate ?? new Date(),
  );

  // Decompose time into 12-hour format: hour (1-12), minute (0-59), period ("AM" | "PM")
  const initialTimeState = React.useMemo(() => {
    const d = parsedDate ?? new Date();
    const h24 = d.getHours();
    const m = d.getMinutes();
    const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      hour: h12,
      minute: (Math.round(m / 5) * 5) % 60, // round to nearest 5 mins
      period,
    };
  }, [parsedDate]);

  const [hour, setHour] = React.useState<number>(initialTimeState.hour);
  const [minute, setMinute] = React.useState<number>(initialTimeState.minute);
  const [period, setPeriod] = React.useState<"AM" | "PM">(
    initialTimeState.period,
  );

  // Sync state if external value changes
  React.useEffect(() => {
    if (parsedDate) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDate(parsedDate);
      const h24 = parsedDate.getHours();
      const m = parsedDate.getMinutes();
      setPeriod(h24 >= 12 ? "PM" : "AM");
      setHour(h24 % 12 === 0 ? 12 : h24 % 12);
      setMinute(m);
    }
  }, [parsedDate]);

  // Compute 24h ISO string from current date + time state
  const emitChange = React.useCallback(
    (d?: Date, h = hour, m = minute, p = period) => {
      const targetDate = d ?? selectedDate;
      if (!targetDate) return;

      if (!showTime) {
        onChange?.(format(targetDate, "yyyy-MM-dd"));
        return;
      }

      // Convert 12h to 24h
      let h24 = h % 12;
      if (p === "PM") h24 += 12;

      const combined = new Date(targetDate);
      combined.setHours(h24, m, 0, 0);

      const year = combined.getFullYear();
      const month = String(combined.getMonth() + 1).padStart(2, "0");
      const day = String(combined.getDate()).padStart(2, "0");
      const formattedHours = String(h24).padStart(2, "0");
      const formattedMins = String(m).padStart(2, "0");

      onChange?.(`${year}-${month}-${day}T${formattedHours}:${formattedMins}`);
    },
    [hour, minute, period, selectedDate, showTime, onChange],
  );

  // Quick Preset Actions
  const applyQuickPreset = (
    daysToAdd: number,
    targetH12: number,
    targetMin: number,
    targetPeriod: "AM" | "PM",
  ) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setSelectedDate(d);
    setHour(targetH12);
    setMinute(targetMin);
    setPeriod(targetPeriod);
    emitChange(d, targetH12, targetMin, targetPeriod);
  };

  const applyNextMonday = () => {
    const d = new Date();
    const dayOfWeek = d.getDay();
    const distanceToMonday = (8 - dayOfWeek) % 7 || 7;
    d.setDate(d.getDate() + distanceToMonday);
    setSelectedDate(d);
    setHour(10);
    setMinute(0);
    setPeriod("AM");
    emitChange(d, 10, 0, "AM");
  };

  const handleDateSelect = (d: Date | undefined) => {
    if (!d) return;
    setSelectedDate(d);
    emitChange(d);
    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeSlotClick = (slot: (typeof QUICK_TIME_SLOTS)[0]) => {
    setHour(slot.hour);
    setMinute(slot.min);
    setPeriod(slot.period);
    emitChange(selectedDate, slot.hour, slot.min, slot.period);
  };

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
    emitChange(selectedDate, newHour, minute, period);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    emitChange(selectedDate, hour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    emitChange(selectedDate, hour, minute, newPeriod);
  };

  // Formatted trigger display string
  const formattedTrigger = React.useMemo(() => {
    if (!value || !parsedDate) return null;
    const datePart = format(parsedDate, "EEE, MMM d, yyyy");
    if (!showTime) return datePart;

    const h24 = parsedDate.getHours();
    const m = String(parsedDate.getMinutes()).padStart(2, "0");
    const p = h24 >= 12 ? "PM" : "AM";
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return {
      date: datePart,
      time: `${h12}:${m} ${p}`,
    };
  }, [value, parsedDate, showTime]);

  return (
    <div className={cn("w-full relative", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-between text-left font-normal h-11 px-3.5 rounded-lg bg-card border border-slate-200  dark:border-slate-700 hover:border-blue-300 hover:bg-slate-50/80 transition-all cursor-pointer text-xs group",
                !value && "text-slate-400",
                open && "border-blue-500 ring-2 ring-blue-500/10",
              )}
            >
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>

                {formattedTrigger ? (
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                      {typeof formattedTrigger === "string"
                        ? formattedTrigger
                        : formattedTrigger.date}
                    </span>
                    {typeof formattedTrigger !== "string" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium text-[11px] border border-blue-200/60">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {formattedTrigger.time}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">{placeholder}</span>
                )}
              </div>

              <ChevronDown
                className={cn(
                  "w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200",
                  open && "rotate-180 text-blue-500",
                )}
              />
            </Button>
          }
        />

        <PopoverContent
          className="w-auto p-0 bg-card border border-slate-200/90 dark:border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col"
          align="start"
        >
          {/* Quick Presets Bar */}
          <div className="px-3.5 py-2.5 bg-card border-b border-slate-100 dark:border-slate-700 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0 mr-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Quick:
            </span>
            <button
              type="button"
              onClick={() => applyQuickPreset(0, 3, 0, "PM")}
              className="px-2 py-1 rounded-lg bg-card border border-slate-200  dark:border-slate-700 hover:border-blue-300 hover:bg-brand-primary text-accent-foreground hover:text-card font-medium transition-colors shrink-0 cursor-pointer"
            >
              Today 3 PM
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset(1, 10, 0, "AM")}
              className="px-2 py-1 rounded-lg bg-card border border-slate-200  dark:border-slate-700 hover:border-blue-300 hover:bg-brand-primary text-accent-foreground hover:text-card font-medium transition-colors shrink-0 cursor-pointer"
            >
              Tomorrow 10 AM
            </button>
            <button 
              type="button"
              onClick={() => applyQuickPreset(1, 3, 0, "PM")}
              className="px-2 py-1 rounded-lg bg-card border border-slate-200  dark:border-slate-700 hover:border-blue-300 hover:bg-brand-primary text-accent-foreground hover:text-card font-medium transition-colors shrink-0 cursor-pointer"
            >
              Tomorrow 3 PM
            </button>
            <button 
              type="button"
              onClick={() => applyQuickPreset(2, 10, 0, "AM")}
              className="px-2 py-1 rounded-lg bg-card border border-slate-200  dark:border-slate-700 hover:border-blue-300 hover:bg-brand-primary text-accent-foreground hover:text-card font-medium transition-colors shrink-0 cursor-pointer"
            >
              In 2 Days
            </button>
            <button 
              type="button"
              onClick={applyNextMonday}
              className="px-2 py-1 rounded-lg bg-card border border-slate-200  dark:border-slate-700 hover:border-blue-300 hover:bg-brand-primary text-accent-foreground hover:text-card font-medium transition-colors shrink-0 cursor-pointer"
            >
              Next Mon
            </button>
          </div>

          {/* Main Body: Calendar + Custom Time Selector */}
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-500">
            {/* Calendar */}
            <div className="p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={minDate ? { before: minDate } : undefined}
                className="rounded-lg"
              />
            </div>

            {/* Custom Time Selector (Zero Native Windows Pickers) */}
            {showTime && (
              <div className="p-4 flex flex-col justify-between w-full md:w-64 bg-card">
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-500">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      Select Time
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {hour}:{String(minute).padStart(2, "0")} {period}
                    </span>
                  </div>

                  {/* Quick Time Slot Chips */}
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
                      Popular Slots
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {QUICK_TIME_SLOTS.map((slot) => {
                        const isSelected =
                          hour === slot.hour &&
                          minute === slot.min &&
                          period === slot.period;
                        return (
                          <button
                            key={slot.label}
                            type="button"
                            onClick={() => handleTimeSlotClick(slot)}
                            className={cn(
                              "px-2 py-1.5 rounded-lg border text-xs font-medium transition-all text-left flex items-center justify-between cursor-pointer",
                              isSelected
                                ? "bg-blue-600 text-white border-blue-600 shadow-xs font-semibold"
                                : "bg-card border-slate-200  dark:border-slate-700 text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            <span>{slot.label}</span>
                            {isSelected && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Hour, Minute & AM/PM Controls */}
                  <div className="pt-2 border-t border-slate-100 ">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                      Custom Time
                    </label>
                    <div className="flex items-center gap-1.5">
                      {/* Hour Dropdown */}
                      <div className="flex-1">
                        <Select
                          value={String(hour)}
                          onValueChange={(val) => {
                            if (val) handleHourChange(Number(val));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Hour" />
                          </SelectTrigger>
                          <SelectContent >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(
                              (h) => (
                                <SelectItem key={h} value={String(h)}>
                                  {String(h).padStart(2, "0")}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <span className="text-slate-400 font-bold text-sm">
                        :
                      </span>

                      {/* Minute Dropdown */}
                      <div className="flex-1">
                        <Select
                          value={String(minute)}
                          onValueChange={(val) => {
                            if (val !== null && val !== undefined)
                              handleMinuteChange(Number(val));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Min" />
                          </SelectTrigger>
                          <SelectContent >
                            {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
                              (m) => (
                                <SelectItem key={m} value={String(m)}>
                                  {String(m).padStart(2, "0")}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* AM / PM Segmented Toggle */}
                      <div className="flex rounded-lg border border-slate-200  dark:border-slate-700 bg-card p-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePeriodChange("AM")}
                          className={cn(
                            "px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                            period === "AM"
                              ? "bg-card text-blue-700 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800",
                          )}
                        >
                          AM
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePeriodChange("PM")}
                          className={cn(
                            "px-2 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer",
                            period === "PM"
                              ? "bg-card text-blue-700 shadow-2xs"
                              : "text-slate-500 hover:text-slate-800",
                          )}
                        >
                          PM
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confirm Button */}
                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-500">
                  <button
                    type="button"
                    onClick={() => {
                      emitChange(selectedDate, hour, minute, period);
                      setOpen(false);
                    }}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Set Date & Time
                  </button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DatePicker;
