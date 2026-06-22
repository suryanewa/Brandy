import { useEffect, useMemo, useState } from "react";
import { initWebFonts } from "../../lib/initWebFonts.mjs";
import { TYPOGRAPHY_FONT_OPTIONS } from "../../lib/typographyTheme.mjs";
import { Container, Heading, Section, Stack, Text } from "../primitives";
import { Navbar } from "./Navbar";

export function FontLab() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    initWebFonts();
  }, []);

  const filteredFonts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return TYPOGRAPHY_FONT_OPTIONS;

    return TYPOGRAPHY_FONT_OPTIONS.filter(
      (font) =>
        font.label.toLowerCase().includes(normalizedQuery) ||
        font.id.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  return (
    <>
      <Navbar />
      <main className="font-lab">
        <Section size="sm" variant="inverted">
          <Container>
            <Stack gap="sm">
              <Heading as="h1" size="h2">
                Font preview route
              </Heading>
              <Text size="body-lg">
                Browse every font available in the design overlay typography
                controls. Web fonts load from Google Fonts, Fontsource, Bunny
                Fonts, and Adobe Typekit when available; system and specialty
                faces fall back to local stacks.
              </Text>
              <label className="font-lab__search">
                <span className="font-lab__search-label">Filter fonts</span>
                <input
                  autoComplete="off"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name or id…"
                  spellCheck={false}
                  type="search"
                  value={query}
                />
              </label>
              <Text size="caption">
                Showing {filteredFonts.length} of {TYPOGRAPHY_FONT_OPTIONS.length}{" "}
                fonts
              </Text>
            </Stack>
          </Container>
        </Section>
        <Section size="sm">
          <Container>
            <div className="font-lab__grid">
              {filteredFonts.map((font) => (
                <article className="font-lab__card" key={font.id}>
                  <div className="font-lab__meta">
                    <Heading as="h2" size="h4">
                      {font.label}
                    </Heading>
                    <Text size="caption">{font.id}</Text>
                  </div>
                  <p
                    className="font-lab__sample font-lab__sample--display"
                    style={{ fontFamily: font.stack }}
                  >
                    Brand surfaces, generated from seeds.
                  </p>
                  <p
                    className="font-lab__sample font-lab__sample--body"
                    style={{ fontFamily: font.stack }}
                  >
                    Modular landing pages from tokens, primitives, patterns, and
                    sections.
                  </p>
                  <p
                    className="font-lab__sample font-lab__sample--alphabet"
                    style={{ fontFamily: font.stack }}
                  >
                    ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    <br />
                    abcdefghijklmnopqrstuvwxyz
                    <br />
                    0123456789
                  </p>
                </article>
              ))}
            </div>
          </Container>
        </Section>
      </main>
    </>
  );
}
