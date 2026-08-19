import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* =========================================================
   DATE / TIME
========================================================= */

export function formatTimeAgo(
  dateString?: string | null
) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();

  const diffSeconds = Math.floor(
    (now.getTime() - date.getTime()) / 1000
  );

  if (diffSeconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(diffSeconds / 60);

  if (minutes < 60) {
    return `${minutes} ${
      minutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} ${
      hours === 1 ? "hour" : "hours"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `${days} ${
      days === 1 ? "day" : "days"
    } ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months} ${
      months === 1 ? "month" : "months"
    } ago`;
  }

  const years = Math.floor(months / 12);

  return `${years} ${
    years === 1 ? "year" : "years"
  } ago`;
}

/* =========================================================
   TEXT
========================================================= */

export function formatText(
  value?: string | null
) {
  if (!value) return "";

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
}

/* =========================================================
   PROFILE
========================================================= */

export function getInitials(
  name?: string | null
) {
  if (!name) return "NC";

  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getProfileName(
  profile?: {
    display_name?: string | null;
    username?: string | null;
  } | null
) {
  return (
    profile?.display_name ||
    profile?.username ||
    "User"
  );
}

/* =========================================================
   CURRENCY
========================================================= */

export function formatPrice(
  price?: number | string | null,
  currency?: string | null
) {
  if (
    price === null ||
    price === undefined
  ) {
    return null;
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return null;
  }

  const currencyCode =
    (currency || "USD").toUpperCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(numericPrice);
  } catch {
    return `${numericPrice.toFixed(
      2
    )} ${currencyCode}`;
  }
}

/* =========================================================
   VIDEO
========================================================= */

export function formatDuration(
  seconds: number
) {
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return "";
  }

  const totalSeconds =
    Math.floor(seconds);

  const hours = Math.floor(
    totalSeconds / 3600
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  );

  const secs =
    totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${secs
    .toString()
    .padStart(2, "0")}`;
}