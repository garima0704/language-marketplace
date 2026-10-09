
export type PageSectionType =
  | "hero"
  | "feature_cards"
  | "text"
  | "contact_details"
  | "contact_form"
  | "legal_sections"
  | "cta";

export type PageSection = {
  id: string;
  type: PageSectionType;
  enabled: boolean;
  data: Record<string, unknown>;
};

export type PageBuilderConfig = {
  slug: string;
  label: string;
  description: string;
  allowedSections: PageSectionType[];
  defaultSections: PageSection[];
};

export type SitePageRecord = {
  id: string;
  title: string;
  slug: string;
  content: string;
  page_data: Record<string, unknown>;
  locale_code: string;
  is_published: boolean;
};