import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  clampNumber,
  formatSettingNumber,
  isHexColor,
  normalizeHexColor,
  snapToStep,
} from "./designOverlayModel";

interface ControlLabelProps {
  actions?: ReactNode;
  children: ReactNode;
}

function ControlLabel({ actions, children }: ControlLabelProps) {
  return (
    <div className="design-overlay__label-tools">
      {children}
      {actions}
    </div>
  );
}

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
    <div className="design-overlay__slider-row design-overlay__control-row">
      <div className="design-overlay__row-top">
        <ControlLabel actions={actions}>
          <label htmlFor={`${id}-range`}>{label}</label>
        </ControlLabel>
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
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const visibleDraft = draft ?? normalizedValue;
  const hsv = useMemo(() => hexToHsv(normalizedValue), [normalizedValue]);
  const hueColor = hsvToHex({ h: hsv.h, s: 100, v: 100 });
  const areaStyle = {
    "--design-overlay-picker-hue": hueColor,
  } as CSSProperties & Record<"--design-overlay-picker-hue", string>;
  const thumbStyle = {
    left: `${hsv.s}%`,
    top: `${100 - hsv.v}%`,
  } as CSSProperties;

  const commitDraft = (rawValue = visibleDraft) => {
    if (isHexColor(rawValue)) {
      onChange(normalizeHexColor(rawValue));
      setDraft(null);
      return;
    }

    setDraft(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointer);
  }, [isOpen]);

  const setHsvColor = (nextHsv: HsvColor) => {
    onChange(hsvToHex(nextHsv));
    setDraft(null);
  };

  const updateAreaColor = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const saturation = clampPercent(
      ((event.clientX - rect.left) / rect.width) * 100,
    );
    const brightness = clampPercent(
      100 - ((event.clientY - rect.top) / rect.height) * 100,
    );
    setHsvColor({ ...hsv, s: saturation, v: brightness });
  };

  return (
    <div className="design-overlay__color-row design-overlay__control-row">
      <ControlLabel actions={actions}>
        <label htmlFor={`${id}-color`}>{label}</label>
      </ControlLabel>
      <div className="design-overlay__row-tools">
        <div className="design-overlay__hex-picker" ref={pickerRef}>
          <button
            id={`${id}-color`}
            className="design-overlay__color-button"
            type="button"
            aria-expanded={isOpen}
            aria-label={`${label} color picker`}
            onClick={() => setIsOpen((current) => !current)}
          >
            <span
              className="design-overlay__color-swatch"
              style={{ background: normalizedValue }}
            />
            <span className="design-overlay__color-hex">{normalizedValue}</span>
          </button>
          <input
            className="sr-only"
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
          {isOpen ? (
            <div
              className="design-overlay__color-popover"
              role="dialog"
              aria-label={`${label} color controls`}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setIsOpen(false);
                }
              }}
            >
              <div>
                <div
                  className="design-overlay__color-area"
                  style={areaStyle}
                  onPointerDown={(event) => {
                    updateAreaColor(event);
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      updateAreaColor(event);
                    }
                  }}
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                  }}
                >
                  <span
                    className="design-overlay__color-thumb"
                    style={thumbStyle}
                  />
                </div>
                <label className="design-overlay__hue-slider">
                  <span className="sr-only">{label} hue</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    value={Math.round(hsv.h)}
                    onChange={(event) =>
                      setHsvColor({
                        ...hsv,
                        h: Number.parseInt(event.currentTarget.value, 10),
                      })
                    }
                  />
                </label>
              </div>
              <label className="design-overlay__color-field">
                <span>Hex</span>
                <input
                  type="text"
                  inputMode="text"
                  value={visibleDraft}
                  onBlur={(event) => commitDraft(event.currentTarget.value)}
                  onChange={(event) => setDraft(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitDraft(event.currentTarget.value);
                    }
                  }}
                />
              </label>
              <div className="design-overlay__swatch-picker">
                {PRESET_COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Use ${color}`}
                    onClick={() => onChange(normalizeHexColor(color))}
                  >
                    <span style={{ background: color }} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface HsvColor {
  h: number;
  s: number;
  v: number;
}

const PRESET_COLOR_SWATCHES = ["#f00", "#f90", "#0f0", "#08f", "#00f"];

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, value));
}

function hexToHsv(hex: string): HsvColor {
  const normalized = normalizeHexColor(hex).slice(1);
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    if (max === g) h = (b - r) / delta + 2;
    if (max === b) h = (r - g) / delta + 4;
    h *= 60;
  }

  return {
    h: h < 0 ? h + 360 : h,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  };
}

function hsvToHex({ h, s, v }: HsvColor) {
  const chroma = (v / 100) * (s / 100);
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const match = v / 100 - chroma;
  const [r, g, b] =
    h < 60
      ? [chroma, x, 0]
      : h < 120
        ? [x, chroma, 0]
        : h < 180
          ? [0, chroma, x]
          : h < 240
            ? [0, x, chroma]
            : h < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];

  return `#${[r, g, b]
    .map((channel) =>
      Math.round((channel + match) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

interface DerivedColorPreviewProps {
  activeColorId: string | null;
  colors: readonly {
    adjustment: {
      id: string;
      label: string;
      max?: number;
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
                  max={color.adjustment.max ?? 160}
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
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const segmentedStyle = {
    "--design-overlay-segment-count": String(options.length),
    "--design-overlay-segment-active-index": String(hoverIndex ?? selectedIndex),
    "--design-overlay-segment-selected-index": String(selectedIndex),
  } as CSSProperties & {
    "--design-overlay-segment-active-index": string;
    "--design-overlay-segment-count": string;
    "--design-overlay-segment-selected-index": string;
  };

  return (
    <div className="design-overlay__segmented-row design-overlay__control-row">
      <div className="design-overlay__row-top">
        <ControlLabel actions={actions}>
          <span id={`${id}-label`} className="design-overlay__row-label">
            {label}
          </span>
        </ControlLabel>
      </div>
      <div
        className="design-overlay__segmented-control"
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        data-hovering={hoverIndex === null ? "false" : "true"}
        style={segmentedStyle}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            data-selected={option.value === value}
            onMouseEnter={() => setHoverIndex(index)}
            onFocus={() => setHoverIndex(index)}
            onBlur={() => setHoverIndex(null)}
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
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);
  const widestOption = options.reduce(
    (widest, option) =>
      option.label.length > widest.length ? option.label : widest,
    "",
  );

  return (
    <div className="design-overlay__select-row design-overlay__control-row">
      <div className="design-overlay__row-top">
        <ControlLabel actions={actions}>
          <label htmlFor={id}>
            {label}
          </label>
        </ControlLabel>
        <div className="design-overlay__row-tools">
          <button
            id={`${id}-trigger`}
            className="design-overlay__select-trigger"
            type="button"
            aria-expanded={isOpen}
            aria-controls={`${id}-options`}
            onClick={() => setIsOpen((current) => !current)}
          >
            {!isOpen ? (
              <span className="design-overlay__select-value">
                {selectedOption?.label ?? value}
              </span>
            ) : null}
            <span className="design-overlay__select-width" aria-hidden="true">
              {widestOption}
            </span>
            <ChevronDown aria-hidden="true" />
          </button>
          <select
            id={id}
            className="sr-only"
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
      </div>
      {isOpen ? (
        <div
          id={`${id}-options`}
          className="design-overlay__select-options"
          data-open="true"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              data-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span>{option.label}</span>
              {option.value === value ? <Check aria-hidden="true" /> : null}
            </button>
          ))}
        </div>
      ) : null}
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
    <div className="design-overlay__toggle-row design-overlay__control-row">
      <ControlLabel actions={actions}>
        <label htmlFor={id}>{label}</label>
      </ControlLabel>
      <div className="design-overlay__row-tools">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.currentTarget.checked)}
        />
      </div>
    </div>
  );
}
