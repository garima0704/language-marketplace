import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";

type TranslationRequest = {
  translation_key: string;
  section: string;
  name: string;
  englishText: string;
  translations: Record<string, string>;
};

export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();

    const body = (await request.json()) as TranslationRequest;

    const translationKey = body.translation_key?.trim();
    const section = body.section?.trim();
    const englishText = body.englishText?.trim();
    const translations = body.translations ?? {};

    // --------------------------------------------------
    // Validate required fields
    // --------------------------------------------------

    if (!translationKey) {
      return NextResponse.json(
        { error: "Translation key is required." },
        { status: 400 }
      );
    }

    if (!section) {
      return NextResponse.json(
        { error: "Section is required." },
        { status: 400 }
      );
    }

    if (!englishText) {
      return NextResponse.json(
        { error: "English text is required." },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Check whether the translation key already exists
    // --------------------------------------------------

    const { data: existingTranslation, error: existingError } =
      await supabase
        .from("translations")
        .select("id")
        .eq("translation_key", translationKey)
        .limit(1)
        .maybeSingle();

    if (existingError) {
      console.error(
        "TRANSLATION EXISTING KEY CHECK ERROR:",
        existingError
      );

      return NextResponse.json(
        { error: "Unable to check the translation key." },
        { status: 500 }
      );
    }

    if (existingTranslation) {
      return NextResponse.json(
        {
          error:
            "A translation with this key already exists. Please use a different translation name.",
        },
        { status: 409 }
      );
    }

    // --------------------------------------------------
    // Build rows
    // --------------------------------------------------

    const rows = [
      {
        translation_key: translationKey,
        section,
        locale_code: "en",
        value: englishText,
      },
    ];

    for (const [localeCode, value] of Object.entries(translations)) {
      const translatedValue = value?.trim();

      // Don't create empty translation rows.
      if (!translatedValue) {
        continue;
      }

      // English is already inserted above.
      if (localeCode === "en") {
        continue;
      }

      rows.push({
        translation_key: translationKey,
        section,
        locale_code: localeCode,
        value: translatedValue,
      });
    }

    // --------------------------------------------------
    // Insert translations
    // --------------------------------------------------

    const { error: insertError } = await supabase
      .from("translations")
      .insert(rows);

    if (insertError) {
      console.error(
        "TRANSLATION INSERT ERROR:",
        insertError
      );

      return NextResponse.json(
        { error: "Failed to save the translation." },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      translation_key: translationKey,
    });
  } catch (error) {
    console.error("TRANSLATION CREATE ERROR:", error);

    return NextResponse.json(
      { error: "Something went wrong while saving the translation." },
      { status: 500 }
    );
  }
}

type TranslationUpdateRequest = {
  translation_key: string;
  section: string;
  name: string;
  englishText: string;
  translations: Record<string, string>;
};

export async function PUT(request: Request) {
  try {
    const { supabase } = await requireAdmin();

    const body =
      (await request.json()) as TranslationUpdateRequest;

    const translationKey =
      body.translation_key?.trim();

    const section =
      body.section?.trim();

    const name =
      body.name?.trim();

    const englishText =
      body.englishText?.trim();

    const translations =
      body.translations ?? {};

    // --------------------------------------------------
    // Validate required fields
    // --------------------------------------------------

    if (!translationKey) {
      return NextResponse.json(
        {
          error:
            "Translation key is required.",
        },
        { status: 400 }
      );
    }

    if (!section) {
      return NextResponse.json(
        {
          error:
            "Section is required.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Translation name is required.",
        },
        { status: 400 }
      );
    }

    if (!englishText) {
      return NextResponse.json(
        {
          error:
            "English text is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // Check existing translation rows
    // --------------------------------------------------

    const {
      data: existingRows,
      error: existingError,
    } = await supabase
      .from("translations")
      .select(
        "id, locale_code"
      )
      .eq(
        "translation_key",
        translationKey
      );

    if (existingError) {
      console.error(
        "TRANSLATION UPDATE FETCH ERROR:",
        existingError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load the existing translation.",
        },
        { status: 500 }
      );
    }

    if (
      !existingRows ||
      existingRows.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Translation not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // Update English row
    // --------------------------------------------------

    const englishRow =
      existingRows.find(
        (row) =>
          row.locale_code === "en"
      );

    if (!englishRow) {
      return NextResponse.json(
        {
          error:
            "English translation row was not found.",
        },
        { status: 400 }
      );
    }

    const {
      error: englishUpdateError,
    } = await supabase
      .from("translations")
      .update({
        name,
        section,
        value: englishText,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", englishRow.id);

    if (englishUpdateError) {
      console.error(
        "TRANSLATION ENGLISH UPDATE ERROR:",
        englishUpdateError
      );

      return NextResponse.json(
        {
          error:
            "Failed to update the English translation.",
        },
        { status: 500 }
      );
    }

    // --------------------------------------------------
    // Update existing non-English rows
    // --------------------------------------------------

    for (const row of existingRows) {
      if (row.locale_code === "en") {
        continue;
      }

      const translatedValue =
        typeof translations[
          row.locale_code
        ] === "string"
          ? translations[
              row.locale_code
            ].trim()
          : "";

      const {
        error: translationUpdateError,
      } = await supabase
        .from("translations")
        .update({
          name,
          section,
          value: translatedValue,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", row.id);

      if (translationUpdateError) {
        console.error(
          `TRANSLATION ${row.locale_code} UPDATE ERROR:`,
          translationUpdateError
        );

        return NextResponse.json(
          {
            error:
              `Failed to update the ${row.locale_code} translation.`,
          },
          { status: 500 }
        );
      }
    }

    // --------------------------------------------------
    // Add translations that don't have a row yet
    // --------------------------------------------------

    const existingLocaleCodes =
      new Set(
        existingRows.map(
          (row) => row.locale_code
        )
      );

    const newRows = [];

    for (const [
      localeCode,
      value,
    ] of Object.entries(translations)) {
      if (
        localeCode === "en" ||
        existingLocaleCodes.has(
          localeCode
        )
      ) {
        continue;
      }

      const translatedValue =
        value?.trim();

      if (!translatedValue) {
        continue;
      }

      newRows.push({
        translation_key:
          translationKey,
        section,
        name,
        locale_code:
          localeCode,
        value:
          translatedValue,
      });
    }

    if (newRows.length > 0) {
      const {
        error: insertError,
      } = await supabase
        .from("translations")
        .insert(newRows);

      if (insertError) {
        console.error(
          "TRANSLATION NEW ROWS INSERT ERROR:",
          insertError
        );

        return NextResponse.json(
          {
            error:
              "Failed to add new language translations.",
          },
          { status: 500 }
        );
      }
    }

    // --------------------------------------------------
    // Success
    // --------------------------------------------------

    return NextResponse.json({
      success: true,
      translation_key:
        translationKey,
    });
  } catch (error) {
    console.error(
      "TRANSLATION UPDATE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the translation.",
      },
      { status: 500 }
    );
  }
}

type TranslationVisibilityRequest = {
  translation_key: string;
  is_active: boolean;
};

export async function PATCH(request: Request) {
  try {
    const { supabase } = await requireAdmin();

    const body =
      (await request.json()) as TranslationVisibilityRequest;

    const translationKey =
      body.translation_key?.trim();

    const isActive =
      body.is_active;

    if (!translationKey) {
      return NextResponse.json(
        {
          error:
            "Translation key is required.",
        },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          error:
            "Active status is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: existingRows,
      error: fetchError,
    } = await supabase
      .from("translations")
      .select("id")
      .eq(
        "translation_key",
        translationKey
      );

    if (fetchError) {
      console.error(
        "TRANSLATION VISIBILITY FETCH ERROR:",
        fetchError
      );

      return NextResponse.json(
        {
          error:
            "Unable to load the translation.",
        },
        { status: 500 }
      );
    }

    if (
      !existingRows ||
      existingRows.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Translation not found.",
        },
        { status: 404 }
      );
    }

    const {
      error: updateError,
    } = await supabase
      .from("translations")
      .update({
        is_active: isActive,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "translation_key",
        translationKey
      );

    if (updateError) {
      console.error(
        "TRANSLATION VISIBILITY UPDATE ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "Failed to update translation status.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      translation_key:
        translationKey,
      is_active: isActive,
    });
  } catch (error) {
    console.error(
      "TRANSLATION VISIBILITY ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while updating the translation status.",
      },
      { status: 500 }
    );
  }
}