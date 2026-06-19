import type { ReactNode } from "react";
import type {
  DesignCssVariables,
  DesignOverlayValues,
} from "./designOverlayModel";
import {
  DERIVED_COLOR_CONTROLS,
  MODE_TOGGLES,
  type DerivedColorControlId,
  type ResetKey,
} from "./designOverlayControlConfig";
import {
  ColorControl,
  DerivedColorPreview,
  ToggleControl,
} from "./DesignOverlayControls";

type UpdateDesignValue = <Key extends keyof DesignOverlayValues>(
  key: Key,
  value: DesignOverlayValues[Key],
) => void;

interface DesignOverlayPaletteControlsProps {
  activeDerivedColor: DerivedColorControlId | null;
  baseId: string;
  derivedPaletteValues: DesignCssVariables;
  onActiveDerivedColorChange: (
    updater: (current: DerivedColorControlId | null) => DerivedColorControlId | null,
  ) => void;
  onBrandColorChange: (
    key: "primaryColor" | "secondaryColor" | "accentColor" | "highlightColor",
    value: string,
  ) => void;
  onPreviewValueChange: UpdateDesignValue;
  onValueChange: UpdateDesignValue;
  renderParameterActions: (key: ResetKey, label: string) => ReactNode;
  values: DesignOverlayValues;
}

export function DesignOverlayPaletteControls({
  activeDerivedColor,
  baseId,
  derivedPaletteValues,
  onActiveDerivedColorChange,
  onBrandColorChange,
  onPreviewValueChange,
  onValueChange,
  renderParameterActions,
  values,
}: DesignOverlayPaletteControlsProps) {
  return (
    <>
      <ColorControl
        id={`${baseId}-primary-color`}
        label="Primary"
        value={values.primaryColor}
        onChange={(value) => onBrandColorChange("primaryColor", value)}
        actions={renderParameterActions("primaryColor", "Primary")}
      />
      <ColorControl
        id={`${baseId}-secondary-color`}
        label="Secondary"
        value={values.secondaryColor}
        onChange={(value) => onBrandColorChange("secondaryColor", value)}
        actions={renderParameterActions("secondaryColor", "Secondary")}
      />
      <ColorControl
        id={`${baseId}-accent-color`}
        label="Accent"
        value={values.accentColor}
        onChange={(value) => onBrandColorChange("accentColor", value)}
        actions={renderParameterActions("accentColor", "Accent")}
      />
      <ColorControl
        id={`${baseId}-highlight-color`}
        label="Highlight"
        value={values.highlightColor}
        onChange={(value) => onBrandColorChange("highlightColor", value)}
        actions={renderParameterActions("highlightColor", "Highlight")}
      />
      <ToggleControl
        id={`${baseId}-dark-mode`}
        label="Dark mode"
        checked={values.darkMode}
        onChange={(checked) => onPreviewValueChange("darkMode", checked)}
        actions={renderParameterActions("darkMode", "Dark mode")}
      />
      {MODE_TOGGLES.map(({ key, label }) => (
        <ToggleControl
          key={key}
          id={`${baseId}-${key}`}
          label={label}
          checked={values[key]}
          onChange={(checked) => onValueChange(key, checked)}
          actions={renderParameterActions(key, label)}
        />
      ))}
      <DerivedColorPreview
        activeColorId={activeDerivedColor}
        colors={DERIVED_COLOR_CONTROLS.map((control) => ({
          id: control.id,
          label: control.label,
          value: derivedPaletteValues[control.token],
          adjustment: {
            id: `${baseId}-${control.id}-distance`,
            label: `${control.label} distance`,
            sourceLabel: control.sourceLabel,
            value: values[control.key],
            onChange: (value) => onValueChange(control.key, value),
            actions: renderParameterActions(control.key, `${control.label} distance`),
          },
        }))}
        onColorSelect={(id) =>
          onActiveDerivedColorChange((current) =>
            current === id ? null : (id as DerivedColorControlId),
          )
        }
      />
    </>
  );
}
