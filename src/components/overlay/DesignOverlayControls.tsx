import { useState, type CSSProperties } from "react";
import {
  clampNumber,
  formatSettingNumber,
  isHexColor,
  normalizeHexColor,
  snapToStep,
} from "./designOverlayModel";

interface SliderControlProps {
  id: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  suffix?: string;
  value: number;
}

export function SliderControl({
  id,
  label,
  max,
  min,
  onChange,
  step,
  suffix = "",
  value,
}: SliderControlProps) {
  const formattedValue = formatSettingNumber(value, step);
  const [draft, setDraft] = useState<string | null>(null);
  const visibleDraft = draft ?? formattedValue;
  const fill = ((value - min) / (max - min)) * 100;
  const rangeStyle = {
    "--design-overlay-range": `${clampNumber(fill, 0, 100)}%`,
  } as CSSProperties & Record<"--design-overlay-range", string>;

  const commitDraft = (rawValue = visibleDraft) => {
    const parsed = Number.parseFloat(rawValue);
    if (!Number.isFinite(parsed)) {
      setDraft(null);
      return;
    }

    onChange(snapToStep(parsed, step, min, max));
    setDraft(null);
  };

  const adjustByWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (event.deltaY === 0) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    onChange(snapToStep(value + direction * step, step, min, max));
  };

  return (
    <div className="design-overlay__slider-row" onWheel={adjustByWheel}>
      <div className="design-overlay__row-top">
        <label htmlFor={`${id}-range`}>{label}</label>
        <span className="design-overlay__number-shell">
          <input
            id={`${id}-value`}
            type="text"
            inputMode="decimal"
            aria-label={`${label} value`}
            value={visibleDraft}
            onBlur={(event) => commitDraft(event.currentTarget.value)}
            onChange={(event) => setDraft(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitDraft(event.currentTarget.value);
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setDraft(null);
                event.currentTarget.blur();
              }
            }}
          />
          {suffix ? <span>{suffix}</span> : null}
        </span>
      </div>
      <input
        id={`${id}-range`}
        className="design-overlay__range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={rangeStyle}
        onChange={(event) =>
          onChange(snapToStep(event.currentTarget.valueAsNumber, step, min, max))
        }
      />
    </div>
  );
}

interface ColorControlProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

export function ColorControl({ id, label, onChange, value }: ColorControlProps) {
  const normalizedValue = normalizeHexColor(value);
  const [draft, setDraft] = useState<string | null>(null);
  const visibleDraft = draft ?? normalizedValue;

  const commitDraft = (rawValue = visibleDraft) => {
    if (isHexColor(rawValue)) {
      onChange(normalizeHexColor(rawValue));
      setDraft(null);
      return;
    }

    setDraft(null);
  };

  return (
    <div className="design-overlay__color-row">
      <label htmlFor={`${id}-color`}>{label}</label>
      <div className="design-overlay__color-control">
        <input
          id={`${id}-color`}
          className="design-overlay__color-input"
          type="color"
          value={normalizedValue}
          onChange={(event) => {
            setDraft(null);
            onChange(event.currentTarget.value);
          }}
        />
        <input
          className="design-overlay__hex-input"
          type="text"
          inputMode="text"
          aria-label={`${label} hex color`}
          value={visibleDraft}
          onBlur={(event) => commitDraft(event.currentTarget.value)}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitDraft(event.currentTarget.value);
            }
            if (event.key === "Escape") {
              event.preventDefault();
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
        />
      </div>
    </div>
  );
}

interface SwatchStripProps {
  colors: readonly string[];
  label: string;
  onSelect: (value: string) => void;
  selectedColor: string;
}

export function SwatchStrip({
  colors,
  label,
  onSelect,
  selectedColor,
}: SwatchStripProps) {
  const selected = normalizeHexColor(selectedColor);

  return (
    <div className="design-overlay__swatch-strip" aria-label={label}>
      {colors.map((color) => {
        const normalizedColor = normalizeHexColor(color);
        return (
          <button
            key={normalizedColor}
            type="button"
            className="design-overlay__swatch"
            data-selected={normalizedColor === selected}
            aria-label={`Use ${normalizedColor}`}
            onClick={() => onSelect(normalizedColor)}
          >
            <span style={{ backgroundColor: normalizedColor }} />
          </button>
        );
      })}
    </div>
  );
}

interface DerivedColorPreviewProps {
  colors: readonly {
    label: string;
    value: string;
  }[];
}

export function DerivedColorPreview({ colors }: DerivedColorPreviewProps) {
  return (
    <div className="design-overlay__derived-colors" aria-label="Derived colors">
      {colors.map((color) => (
        <div key={color.label} className="design-overlay__derived-color">
          <span style={{ backgroundColor: color.value }} />
          <small>{color.label}</small>
          <code>{color.value}</code>
        </div>
      ))}
    </div>
  );
}

interface ToggleControlProps {
  checked: boolean;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
}

export function ToggleControl({ checked, id, label, onChange }: ToggleControlProps) {
  return (
    <label className="design-overlay__toggle-row" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    </label>
  );
}
