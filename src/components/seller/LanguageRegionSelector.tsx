"use client";

import { useMemo, useState } from "react";

type Language = {
  code: string;
  name: string;
};

type LanguageRegion = {
  id: number;
  language_code: string;
  country: string;
  state: string | null;
  sort_order: number | null;
};

type Props = {
  languages: Language[];
  languageRegions: LanguageRegion[];
};

export default function LanguageRegionSelector({
  languages,
  languageRegions,
}: Props) {
  const [languageCode, setLanguageCode] = useState("");
  const [country, setCountry] = useState("");
  const [regionId, setRegionId] = useState("");

  // Countries belonging to selected language
  const countries = useMemo(() => {
    if (!languageCode) return [];

    const uniqueCountries = new Set(
      languageRegions
        .filter(
          (region) => region.language_code === languageCode
        )
        .map((region) => region.country.trim())
    );

    return Array.from(uniqueCountries).sort();
  }, [languageCode, languageRegions]);

  // States/regions belonging to selected language + country
  const states = useMemo(() => {
    if (!languageCode || !country) return [];

    return languageRegions
      .filter(
        (region) =>
          region.language_code === languageCode &&
          region.country.trim() === country
      )
      .sort((a, b) =>
        (a.state ?? "").localeCompare(b.state ?? "")
      );
  }, [languageCode, country, languageRegions]);

  function handleLanguageChange(value: string) {
    setLanguageCode(value);
    setCountry("");
    setRegionId("");
  }

  function handleCountryChange(value: string) {
    setCountry(value);
    setRegionId("");
  }

  const selectClassName = `
    w-full
    rounded-lg
    border
    border-border
    bg-background
    p-2
    text-foreground
    outline-none
    transition
    focus:border-primary
    focus:ring-1
    focus:ring-primary
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  return (
    <div className="space-y-5">
      {/* Language */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Language of Video
        </label>

        <select
          value={languageCode}
          onChange={(e) =>
            handleLanguageChange(e.target.value)
          }
          className={selectClassName}
          required
        >
          <option value="">
            Select Language
          </option>

          {languages.map((language) => (
            <option
              key={language.code}
              value={language.code}
            >
              {language.name}
            </option>
          ))}
        </select>

        {/* Submitted with the form */}
        <input
          type="hidden"
          name="language_code"
          value={languageCode}
        />
      </div>

      {/* Country */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Country
        </label>

        <select
          name="country"
          value={country}
          onChange={(e) =>
            handleCountryChange(e.target.value)
          }
          disabled={!languageCode}
          className={selectClassName}
          required
        >
          <option value="">
            {languageCode
              ? "Select Country"
              : "Select Language First"}
          </option>

          {countries.map((countryName) => (
            <option
              key={countryName}
              value={countryName}
            >
              {countryName}
            </option>
          ))}
        </select>
      </div>

      {/* State / Region */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          State / Region
        </label>

        <select
          name="language_region_id"
          value={regionId}
          onChange={(e) =>
            setRegionId(e.target.value)
          }
          disabled={!country}
          className={selectClassName}
          required
        >
          <option value="">
            {country
              ? "Select State / Region"
              : "Select Country First"}
          </option>

          {states.map((region) => (
            <option
              key={region.id}
              value={region.id}
            >
              {region.state?.trim() || region.country}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-muted">
        Select the language, country, and regional variety
        spoken in the video.
      </p>
    </div>
  );
}