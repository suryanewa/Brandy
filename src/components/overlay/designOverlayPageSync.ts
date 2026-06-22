import {
  areDesignValuesEqual,
  DESIGN_CSS_VARIABLE_NAMES,
  getDesignCssVariables,
  type DesignCssVariableName,
  type DesignOverlayValues,
} from "./designOverlayModel";
import {
  DESIGN_TOKEN_CSS_VARIABLE_NAMES,
  getDesignTokenCssVariables,
  type DesignTokenValueMap,
  type DesignTokenVariableName,
} from "./designTokenCatalog";

const TRACKED_CSS_VARIABLE_NAMES = Array.from(
  new Set([...DESIGN_CSS_VARIABLE_NAMES, ...DESIGN_TOKEN_CSS_VARIABLE_NAMES]),
) as Array<`--${string}`>;

export function applyDesignPageCss(
  target: HTMLElement,
  values: DesignOverlayValues,
  resolvedDefaults: DesignOverlayValues,
  tokenValues: DesignTokenValueMap,
) {
  const designIsDirty = !areDesignValuesEqual(values, resolvedDefaults);
  const curatedVariables: Partial<Record<DesignCssVariableName, string>> = designIsDirty
    ? getDesignCssVariables(values)
    : {};
  const directVariables = getDesignTokenCssVariables(tokenValues);

  for (const name of TRACKED_CSS_VARIABLE_NAMES) {
    const nextValue =
      directVariables[name as DesignTokenVariableName] ??
      curatedVariables[name as DesignCssVariableName];

    if (nextValue) {
      target.style.setProperty(name, nextValue);
    } else {
      target.style.removeProperty(name);
    }
  }
}
