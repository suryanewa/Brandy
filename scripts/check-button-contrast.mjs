import {
  DEFAULT_BRAND_SEEDS,
  generateBrandDerivationRemix,
  generateBrandThemeTokens,
  generatePaletteRemix,
  getHeroBackgroundCopyColors,
  sanitizeBrandSeeds,
} from "../src/lib/brandTheme.mjs";

function getRelativeLuminance(hex) {
  const normalized = hex.replace("#", "");
  const [red, green, blue] = [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ].map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground, background) {
  const fgLum = getRelativeLuminance(foreground);
  const bgLum = getRelativeLuminance(background);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

const failures = [];
let totalChecks = 0;

function checkTokens(tokens, label) {
  const checks = [
    ["--button-primary-text", "--button-primary-bg"],
    ["--button-primary-text", "--button-primary-hover"],
    ["--button-secondary-text", "--button-secondary-bg"],
    ["--button-secondary-text", "--button-secondary-hover"],
    ["--color-on-accent", "--color-accent"],
    ["--color-on-accent", "--color-accent-hover"],
    ["--color-accent-text", "--color-accent"],
    ["--color-accent-text", "--color-accent-hover"],
  ];

  for (const [textKey, bgKey] of checks) {
    const text = tokens[textKey];
    const bg = tokens[bgKey];
    if (!text || !bg) continue;
    totalChecks += 1;
    const ratio = contrastRatio(text, bg);
    if (ratio < 4.5) {
      failures.push({
        label,
        textKey,
        bgKey,
        text,
        bg,
        ratio: ratio.toFixed(3),
      });
    }
  }
}

// Test 1: Default seeds with all derivation remix steps, light + dark + muted
const modes = [
  { darkMode: false, mutedMode: false, highContrast: false, label: "light" },
  { darkMode: true, mutedMode: false, highContrast: false, label: "dark" },
  { darkMode: false, mutedMode: true, highContrast: false, label: "muted" },
  { darkMode: true, mutedMode: true, highContrast: false, label: "dark+muted" },
  { darkMode: false, mutedMode: false, highContrast: true, label: "highContrast" },
  { darkMode: true, mutedMode: false, highContrast: true, label: "dark+highContrast" },
];

for (const mode of modes) {
  for (let step = 0; step < 200; step += 1) {
    const derivation = generateBrandDerivationRemix({ step });
    const tokens = generateBrandThemeTokens(DEFAULT_BRAND_SEEDS, {
      derivation,
      ...mode,
    });
    checkTokens(tokens, `default-seeds/${mode.label}/step=${step}`);
  }
}

// Test 2: Cumulative remixes (simulating repeated space-bar remixes)
for (const mode of modes) {
  let seeds = sanitizeBrandSeeds(DEFAULT_BRAND_SEEDS);
  for (let step = 0; step < 100; step += 1) {
    const remix = generatePaletteRemix(seeds, { salt: step * 7 + 3, step });
    seeds = sanitizeBrandSeeds(remix.palette);
    const derivation = generateBrandDerivationRemix({ step });
    const tokens = generateBrandThemeTokens(seeds, {
      derivation,
      ...mode,
    });
    checkTokens(tokens, `cumulative/${mode.label}/step=${step}`);
  }
}

// Test 3: Extreme seed colors (very light, very dark, mid-luminance)
const extremeSeeds = [
  { primary: "#fde68a", secondary: "#ffffff", accent: "#000000", highlight: "#888888" },
  { primary: "#000000", secondary: "#ffffff", accent: "#fde68a", highlight: "#333333" },
  { primary: "#808080", secondary: "#808080", accent: "#808080", highlight: "#808080" },
  { primary: "#facc15", secondary: "#22d3ee", accent: "#f43f5e", highlight: "#a78bfa" },
  { primary: "#111416", secondary: "#111416", accent: "#111416", highlight: "#111416" },
  { primary: "#ffffff", secondary: "#ffffff", accent: "#ffffff", highlight: "#ffffff" },
];

for (const seeds of extremeSeeds) {
  for (const mode of modes) {
    for (let step = 0; step < 50; step += 1) {
      const derivation = generateBrandDerivationRemix({ step });
      const tokens = generateBrandThemeTokens(seeds, {
        derivation,
        ...mode,
      });
      checkTokens(tokens, `extreme/${mode.label}/step=${step}`);
    }
  }
}

// Test 4: Hero CTA aliases reuse contrast-safe palette button tokens
for (const mode of modes) {
  for (let step = 0; step < 200; step += 1) {
    const derivation = generateBrandDerivationRemix({ step });
    const tokens = generateBrandThemeTokens(DEFAULT_BRAND_SEEDS, {
      derivation,
      ...mode,
    });
    checkTokens(tokens, `hero-alias/${mode.label}/step=${step}`);
  }
}

// Test 5: Hero copy colors against representative scrim+tint backgrounds
for (let step = 0; step < 200; step += 1) {
  const remix = generatePaletteRemix(DEFAULT_BRAND_SEEDS, { step });
  for (const tone of ["dark", "light"]) {
    const copy = getHeroBackgroundCopyColors(tone, remix.palette);
    totalChecks += 2;
    const textRatio = contrastRatio(copy.text, copy.representativeBg);
    const mutedRatio = contrastRatio(copy.muted, copy.representativeBg);
    if (textRatio < 4.5) {
      failures.push({
        label: `hero-copy/${tone}/step=${step}`,
        textKey: "text",
        bgKey: "representativeBg",
        text: copy.text,
        bg: copy.representativeBg,
        ratio: textRatio.toFixed(3),
      });
    }
    if (mutedRatio < 3) {
      failures.push({
        label: `hero-copy-muted/${tone}/step=${step}`,
        textKey: "muted",
        bgKey: "representativeBg",
        text: copy.muted,
        bg: copy.representativeBg,
        ratio: mutedRatio.toFixed(3),
      });
    }
  }
}

console.log(`Total checks: ${totalChecks}`);
console.log(`Failures: ${failures.length}`);

if (failures.length > 0) {
  console.log("\n=== FAILURES ===");
  for (const f of failures.slice(0, 30)) {
    console.log(
      `  [${f.label}] ${f.textKey}(${f.text}) on ${f.bgKey}(${f.bg}) = ${f.ratio}:1`,
    );
  }
  if (failures.length > 30) {
    console.log(`  ... and ${failures.length - 30} more`);
  }
} else {
  console.log("\nAll button text contrast checks passed (>= 4.5:1)");
}
