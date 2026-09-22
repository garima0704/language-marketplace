"use client";

import { useEffect, useMemo, useState } from "react";

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
  initialLanguageCode?: string;
  initialRegionId?: number | null;
  uiTranslations?: Record<string, string>;
};

export default function LanguageRegionSelector({
  languages,
  languageRegions,
  initialLanguageCode = "",
  initialRegionId = null,
  uiTranslations,
}: Props) {
  const [languageCode, setLanguageCode] =
    useState(initialLanguageCode);

  const [country, setCountry] = useState("");

  const [regionId, setRegionId] = useState(
    initialRegionId ? String(initialRegionId) : ""
  );

  useEffect(() => {
    const existingRegion = languageRegions.find(
      (region) => region.id === initialRegionId
    );

    setLanguageCode(initialLanguageCode ?? "");

    if (existingRegion) {
      setCountry(existingRegion.country.trim());
      setRegionId(String(existingRegion.id));
    } else {
      setCountry("");
      setRegionId("");
    }
  }, [
    initialLanguageCode,
    initialRegionId,
    languageRegions,
  ]);

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

  const regions = useMemo(() => {
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

  const languageOfVideoLabel =
    uiTranslations?.["video.language_of_video"] ??
    "Language of Video";

  const selectLanguageLabel =
    uiTranslations?.["video.select_language_placeholder"] ??
    "Select Language";

  const countryLabel =
    uiTranslations?.["video.country"] ??
    "Country";

  const selectCountryLabel =
    uiTranslations?.["video.select_country"] ??
    "Select Country";

  const selectLanguageFirstLabel =
    uiTranslations?.["video.select_language_first"] ??
    "Select Language First";

  const stateRegionLabel =
    uiTranslations?.["video.state_region"] ??
    "Region";

  const selectStateRegionLabel =
    uiTranslations?.["video.select_state_region"] ??
    "Select Region";

  const selectCountryFirstLabel =
    uiTranslations?.["video.select_country_first"] ??
    "Select Country First";

  const helperText =
    uiTranslations?.["video.language_region_helper"] ??
    "Select the language, country, and region that best represent the language variety used in the video.";

  return (
    <div className="space-y-5">
      {/* Language */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {languageOfVideoLabel}
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
            {selectLanguageLabel}
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

        <input
          type="hidden"
          name="language_code"
          value={languageCode}
        />
      </div>

      {/* Country */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {countryLabel}
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
              ? selectCountryLabel
              : selectLanguageFirstLabel}
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

      {/* Region */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          {stateRegionLabel}
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
              ? selectStateRegionLabel
              : selectCountryFirstLabel}
          </option>

          {regions.map((region) => (
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
        {helperText}
      </p>
    </div>
  );
}