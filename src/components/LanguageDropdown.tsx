"use client";

import { Globe, ChevronDown, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Locale = {
  code: string;
  name: string;
};

export default function LanguageDropdown({
  locales,
}: {
  locales: Locale[];
}) {
  const [selected, setSelected] = useState(locales[0]);
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen(!open)}
        className="
          flex
          h-10
          w-36
          items-center
          justify-between
          rounded-full
          bg-[#F5F7F8]
          px-4
          text-sm
          font-medium
          text-[#444444]
          transition
          hover:bg-secondary
          hover:text-white
          hover:shadow-md
        "
      >
        <div className="flex items-center gap-2">
          <Globe size={18} />
          <span className="truncate">{selected.name}</span>
        </div>

        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            top-full
            z-50
            mt-2
            w-52
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
            shadow-xl
          "
        >
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => {
                setSelected(locale);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition ${
                selected.code === locale.code
                  ? "bg-primary text-[#082645]"
                  : "text-[#444444] hover:bg-secondary hover:text-white"
              }`}
            >
              <span>{locale.name}</span>

              {selected.code === locale.code && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}