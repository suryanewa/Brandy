import { useState, type CSSProperties } from "react";
import {
  clampNumber,
  formatSettingNumber,
  isHexColor,
  normalizeHexColor,
  snapToStep,
} from "./designOverlayModel";

interface SliderControlProps {
  endLabel?: string;
  id: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  startLabel?: string;
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
  endLabel,
  startLabel,
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

  const adjustByWheel = (event: React.WheelEvent<HTMLSpanElement>) => {
    if (event.deltaY === 0) return;

    event.preventDefault();
    event.stopPropagation();
    const direction = event.deltaY < 0 ? 1 : -1;
    onChange(snapToStep(value + direction * step, step, min, max));
  };

  return (
    <div className="design-overlay__slider-row">
      <div className="design-overlay__row-top">
        <label htmlFor={`${id}-range`}>{label}</label>
        <span
          className="design-overlay__number-shell"
          onWheelCapture={adjustByWheel}
        >
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
      {startLabel || endLabel ? (
        <div className="design-overlay__range-labels">
          <span>{startLabel}</span>
          <span>{endLabel}</span>
        </div>
      ) : null}
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

interface SegmentedControlProps<Value extends string> {
  id: string;
  label: string;
  onChange: (value: Value) => void;
  options: readonly {
    label: string;
    value: Value;
  }[];
  value: Value;
}

export function SegmentedControl<Value extends string>({
  id,
  label,
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  return (
    <div className="design-overlay__segmented-row">
      <span id={`${id}-label`}>{label}</span>
      <div
        className="design-overlay__segmented-control"
        role="radiogroup"
        aria-labelledby={`${id}-label`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            data-selected={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SelectControlProps<Value extends string> {
  id: string;
  label: string;
  onChange: (value: Value) => void;
  options: readonly {
    label: string;
    value: Value;
  }[];
  value: Value;
}

export function SelectControl<Value extends string>({
  id,
  label,
  onChange,
  options,
  value,
}: SelectControlProps<Value>) {
  return (
    <label className="design-overlay__select-row" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as Value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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
