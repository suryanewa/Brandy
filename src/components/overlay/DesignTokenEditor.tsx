import { ChevronDown, RotateCcw, Search } from "lucide-react";
import { memo, useMemo, useState, type CSSProperties } from "react";
import {
  clampNumber,
  isHexColor,
  normalizeHexColor,
  snapToStep,
} from "./designOverlayModel";
import {
  DESIGN_TOKEN_CONTROLS,
  DESIGN_TOKEN_EDITOR_GROUPS,
  formatDesignTokenNumberValue,
  getDesignTokenControlValue,
  parseDesignTokenNumber,
  type DesignTokenControl,
  type DesignTokenGroupKey,
  type DesignTokenNumberControl,
  type DesignTokenValueMap,
  type DesignTokenVariableControl,
  type DesignTokenVariableName,
} from "./designTokenCatalog";

interface DesignTokenEditorProps {
  values: DesignTokenValueMap;
  onChange: (variable: DesignTokenVariableName, value: string) => void;
  onResetGroup: (group: DesignTokenGroupKey) => void;
  onResetVariable: (variable: DesignTokenVariableName) => void;
}

const INITIAL_TOKEN_GROUP_STATE: Record<DesignTokenGroupKey, boolean> = {
  alignment: true,
  base: false,
  components: false,
  effects: false,
  layout: true,
  motion: false,
  semantic: true,
  spacing: false,
  typography: true,
  zIndex: false,
};

const DESIGN_TOKEN_EDITOR_GROUP_KEYS = new Set(
  DESIGN_TOKEN_EDITOR_GROUPS.map((group) => group.key),
);
const DESIGN_TOKEN_REFERENCE_GROUPS = [
  { key: "palette", title: "Palette", groups: ["base", "semantic"] },
  ...DESIGN_TOKEN_EDITOR_GROUPS.map((group) => ({
    key: group.key,
    title: group.title,
    groups: [group.key],
  })),
] as const satisfies readonly {
  groups: readonly DesignTokenGroupKey[];
  key: string;
  title: string;
}[];

export const DesignTokenEditor = memo(function DesignTokenEditor({
  values,
  onChange,
  onResetGroup,
  onResetVariable,
}: DesignTokenEditorProps) {
  const [query, setQuery] = useState("");
  const [changedOnly, setChangedOnly] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(INITIAL_TOKEN_GROUP_STATE);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredControls = useMemo(
    () =>
      DESIGN_TOKEN_CONTROLS.filter((control) => {
        if (!DESIGN_TOKEN_EDITOR_GROUP_KEYS.has(control.group)) return false;

        const isChanged = values[control.variable] != null;
        if (changedOnly && !isChanged) return false;
        if (!normalizedQuery) return true;

        return [
          control.label,
          control.variable,
          control.group,
          control.defaultValue,
        ].some((part) => part.toLowerCase().includes(normalizedQuery));
      }),
    [changedOnly, normalizedQuery, values],
  );

  return (
    <section className="design-overlay__token-editor" aria-label="All design tokens">
      <div className="design-overlay__token-tools">
        <div className="design-overlay__token-tool-row">
          <label className="design-overlay__search">
            <Search aria-hidden="true" />
            <span className="sr-only">Search design tokens</span>
            <input
              type="search"
              placeholder="Search tokens"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
          <label className="design-overlay__changed-filter">
            <input
              type="checkbox"
              checked={changedOnly}
              onChange={(event) => setChangedOnly(event.currentTarget.checked)}
            />
            Changed
          </label>
        </div>
      </div>

      {DESIGN_TOKEN_EDITOR_GROUPS.map((group) => {
        const groupControls = filteredControls.filter(
          (control) => control.group === group.key,
        );
        const groupChanged = groupControls.some(
          (control) => values[control.variable] != null,
        );
        const isExpanded = expandedGroups[group.key];

        if (groupControls.length === 0) return null;

        return (
          <section key={group.key} className="design-overlay__group">
            <div className="design-overlay__group-header">
              <button
                type="button"
                className="design-overlay__group-toggle"
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedGroups((current) => ({
                    ...current,
                    [group.key]: !current[group.key],
                  }))
                }
              >
                <span className="design-overlay__group-icon">
                  {groupControls.length}
                </span>
                <span>{group.title}</span>
                <ChevronDown aria-hidden="true" />
              </button>
              <button
                type="button"
                className="design-overlay__group-reset"
                aria-label={`Reset ${group.title}`}
                disabled={!groupChanged}
                onClick={() => onResetGroup(group.key)}
              >
                <RotateCcw aria-hidden="true" />
              </button>
            </div>
            <div className="design-overlay__group-content" hidden={!isExpanded}>
              {isExpanded
                ? groupControls.map((control) => (
                    <DesignTokenControlRow
                      key={control.variable}
                      control={control}
                      value={getDesignTokenControlValue(control, values)}
                      changed={values[control.variable] != null}
                      onChange={onChange}
                      onReset={onResetVariable}
                    />
                  ))
                : null}
            </div>
          </section>
        );
      })}
    </section>
  );
});

DesignTokenEditor.displayName = "DesignTokenEditor";

export interface DesignTokenControlRowProps {
  changed: boolean;
  control: DesignTokenControl;
  onChange: (variable: DesignTokenVariableName, value: string) => void;
  onReset: (variable: DesignTokenVariableName) => void;
  value: string;
}

export const DesignTokenControlRow = memo(function DesignTokenControlRow({
  changed,
  control,
  onChange,
  onReset,
  value,
}: DesignTokenControlRowProps) {
  return (
    <div className="design-overlay__token-row" data-changed={changed}>
      <div className="design-overlay__token-label">
        <span>{control.label}</span>
        <code>{control.variable}</code>
      </div>
      <div className="design-overlay__token-control">
        {control.type === "color" ? (
          <TokenColorControl control={control} value={value} onChange={onChange} />
        ) : null}
        {control.type === "number" ? (
          <TokenNumberControl control={control} value={value} onChange={onChange} />
        ) : null}
        {control.type === "select" ? (
          <select
            value={value}
            aria-label={control.label}
            onChange={(event) => onChange(control.variable, event.currentTarget.value)}
          >
            {control.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
        {control.type === "text" ? (
          <input
            type="text"
            aria-label={control.label}
            value={value}
            onChange={(event) => onChange(control.variable, event.currentTarget.value)}
          />
        ) : null}
        {control.type === "variable" ? (
          <TokenVariableControl control={control} value={value} onChange={onChange} />
        ) : null}
        <button
          type="button"
          className="design-overlay__token-reset"
          aria-label={`Reset ${control.label}`}
          disabled={!changed}
          onClick={() => onReset(control.variable)}
        >
          <RotateCcw aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});

DesignTokenControlRow.displayName = "DesignTokenControlRow";

interface TokenValueControlProps {
  control: DesignTokenControl;
  onChange: (variable: DesignTokenVariableName, value: string) => void;
  value: string;
}

function TokenColorControl({ control, onChange, value }: TokenValueControlProps) {
  const safeColor = normalizeHexColor(value);

  return (
    <div className="design-overlay__token-color">
      <input
        type="color"
        aria-label={`${control.label} picker`}
        value={safeColor}
        onChange={(event) => onChange(control.variable, event.currentTarget.value)}
      />
      <input
        type="text"
        aria-label={control.label}
        value={value}
        onChange={(event) => onChange(control.variable, event.currentTarget.value)}
        onBlur={(event) => {
          const nextValue = event.currentTarget.value;
          onChange(
            control.variable,
            isHexColor(nextValue) ? normalizeHexColor(nextValue) : control.defaultValue,
          );
        }}
      />
    </div>
  );
}

function TokenVariableControl({
  control,
  onChange,
  value,
}: TokenValueControlProps & { control: DesignTokenVariableControl }) {
  const hasKnownValue = control.options.some((option) => option.value === value);
  const customValue = value.trim() && !hasKnownValue ? value : null;

  return (
    <select
      value={value}
      aria-label={control.label}
      onChange={(event) => onChange(control.variable, event.currentTarget.value)}
    >
      {customValue ? <option value={customValue}>{customValue}</option> : null}
      {DESIGN_TOKEN_REFERENCE_GROUPS.map((group) => {
        const groupOptions = control.options.filter(
          (option) =>
            group.groups.some((groupKey) => groupKey === option.group),
        );

        if (groupOptions.length === 0) return null;

        return (
          <optgroup key={group.key} label={group.title}>
            {groupOptions.map((option) => (
              <option key={option.variable} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </select>
  );
}

function TokenNumberControl({
  control,
  onChange,
  value,
}: TokenValueControlProps & { control: DesignTokenNumberControl }) {
  const numericValue = parseDesignTokenNumber(value);
  const fill =
    ((clampNumber(numericValue, control.min, control.max) - control.min) /
      (control.max - control.min)) *
    100;

  return (
    <div className="design-overlay__token-number">
      <input
        className="design-overlay__range"
        type="range"
        aria-label={control.label}
        min={control.min}
        max={control.max}
        step={control.step}
        value={clampNumber(numericValue, control.min, control.max)}
        style={
          {
            "--design-overlay-range": `${clampNumber(fill, 0, 100)}%`,
          } as CSSProperties & Record<"--design-overlay-range", string>
        }
        onChange={(event) =>
          onChange(
            control.variable,
            formatDesignTokenNumberValue(control, event.currentTarget.valueAsNumber),
          )
        }
      />
      <input
        type="text"
        aria-label={`${control.label} value`}
        value={value}
        onChange={(event) => onChange(control.variable, event.currentTarget.value)}
        onBlur={(event) =>
          onChange(
            control.variable,
            formatDesignTokenNumberValue(
              control,
              snapToStep(
                parseDesignTokenNumber(event.currentTarget.value),
                control.step,
                control.min,
                control.max,
              ),
            ),
          )
        }
      />
    </div>
  );
}
