import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

export function formatRelativeTime(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date;
  const diffMs = value.getTime() - Date.now();
  const absSeconds = Math.abs(Math.round(diffMs / 1000));

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 60 * 60 * 24 * 365 },
    { unit: "month", seconds: 60 * 60 * 24 * 30 },
    { unit: "week", seconds: 60 * 60 * 24 * 7 },
    { unit: "day", seconds: 60 * 60 * 24 },
    { unit: "hour", seconds: 60 * 60 },
    { unit: "minute", seconds: 60 },
  ];

  const formatter = new Intl.RelativeTimeFormat("en-IN", { numeric: "auto" });
  for (const { unit, seconds } of units) {
    if (absSeconds >= seconds) {
      return formatter.format(Math.round(diffMs / 1000 / seconds), unit);
    }
  }

  return "just now";
}

export function roundAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}
