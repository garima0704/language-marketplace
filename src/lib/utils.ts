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

export function formatDate(
  date?: Date | string | null
) {
  if (!date) return "";

  const value =
    date instanceof Date
      ? date
      : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(value);
}

export function formatShortDate(
  date?: Date | string | null
) {
  if (!date) return "";

  const value =
    date instanceof Date
      ? date
      : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  ).format(value);
}

export function formatMonth(
  date?: Date | string | null
) {
  if (!date) return "";

  const value =
    date instanceof Date
      ? date
      : new Date(date);

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      year: "numeric",
    }
  ).format(value);
}

/**
 * Calendar date key without UTC conversion.
 * Important for analytics grouping.
 */
export function formatDateKey(
  date: Date
) {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDateRange(
  start?: Date | string | null,
  end?: Date | string | null
) {
  if (!start || !end) return "";

  const startDate =
    start instanceof Date
      ? start
      : new Date(start);

  const endDate =
    end instanceof Date
      ? end
      : new Date(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    return "";
  }

  const formatter =
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return `${formatter.format(
    startDate
  )} — ${formatter.format(endDate)}`;
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

export function calculateAge(
  dateOfBirth?: string | null
) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function formatGender(
  gender?: string | null
) {
  if (!gender) return null;

  const labels: Record<string, string> = {
    female: "Female",
    male: "Male",
  };

  return labels[gender] ?? null;
}

/* =========================================================
   NUMBERS / CURRENCY
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

export function formatNumber(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-US"
  ).format(value);
}

export function formatCompactNumber(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "0";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value);
}

export function formatCurrency(
  value?: number | null,
  currency = "USD"
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "$0.00";
  }

  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  } catch {
    return `${value.toFixed(
      2
    )} ${currency}`;
  }
}

export function formatPercent(
  value?: number | null
) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return "0%";
  }

  return `${value.toFixed(1)}%`;
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