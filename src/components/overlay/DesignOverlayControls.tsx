import { useState, type CSSProperties, type ReactNode } from "react";
import {
  clampNumber,
  formatSettingNumber,
  isHexColor,
  normalizeHexColor,
  snapToStep,
} from "./designOverlayModel";

interface SliderControlProps {
  actions?: ReactNode;
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
  actions,
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
        <div className="design-overlay__row-tools">
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
          {actions}
        </div>
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
  actions?: ReactNode;
  id: string;
  label: string;
  onChange: (value: string) => void;
  value: string;
}

export function ColorControl({
  actions,
  id,
  label,
  onChange,
  value,
}: ColorControlProps) {
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
      <div className="design-overlay__row-tools">
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
        {actions}
      </div>
    </div>
  );
}

interface DerivedColorPreviewProps {
  activeColorId: string | null;
  colors: readonly {
    adjustment: {
      id: string;
      label: string;
      onChange: (value: number) => void;
      sourceLabel: string;
      value: number;
      actions?: ReactNode;
    };
    id: string;
    label: string;
    value: string;
  }[];
  onColorSelect: (id: string) => void;
}

export function DerivedColorPreview({
  activeColorId,
  colors,
  onColorSelect,
}: DerivedColorPreviewProps) {
  return (
    <div className="design-overlay__derived-colors" aria-label="Derived colors">
      {colors.map((color) => {
        const isActive = activeColorId === color.id;

        return (
          <div
            key={color.id}
            className="design-overlay__derived-color"
            data-active={isActive}
          >
            <button
              type="button"
              className="design-overlay__derived-color-button"
              aria-expanded={isActive}
              aria-label={`Adjust ${color.label} derivation`}
              onClick={() => onColorSelect(color.id)}
            >
              <span style={{ backgroundColor: color.value }} />
              <small>{color.label}</small>
              <code>{color.value}</code>
            </button>
            {isActive ? (
              <div className="design-overlay__derived-adjustment">
                <SliderControl
                  id={color.adjustment.id}
                  label={color.adjustment.label}
                  value={color.adjustment.value}
                  min={0}
                  max={160}
                  step={1}
                  suffix="%"
                  startLabel={`Near ${color.adjustment.sourceLabel}`}
                  endLabel="Far"
                  onChange={color.adjustment.onChange}
                  actions={color.adjustment.actions}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

interface SegmentedControlProps<Value extends string> {
  actions?: ReactNode;
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
  actions,
  id,
  label,
  onChange,
  options,
  value,
}: SegmentedControlProps<Value>) {
  return (
    <div className="design-overlay__segmented-row">
      <div className="design-overlay__row-top">
        <span id={`${id}-label`} className="design-overlay__row-label">
          {label}
        </span>
        {actions}
      </div>
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
  actions?: ReactNode;
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
  actions,
  id,
  label,
  onChange,
  options,
  value,
}: SelectControlProps<Value>) {
  return (
    <div className="design-overlay__select-row">
      <div className="design-overlay__row-top">
        <label htmlFor={id}>{label}</label>
        {actions}
      </div>
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
    </div>
  );
}

interface ToggleControlProps {
  actions?: ReactNode;
  checked: boolean;
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
}

export function ToggleControl({
  actions,
  checked,
  id,
  label,
  onChange,
}: ToggleControlProps) {
  return (
    <div className="design-overlay__toggle-row">
      <label htmlFor={id}>{label}</label>
      <div className="design-overlay__row-tools">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
        {actions}
      </div>
    </div>
  );
}
