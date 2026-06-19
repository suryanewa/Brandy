import { ChevronDown, Lock, RotateCcw, Shuffle, Unlock } from "lucide-react";
import type { ReactNode } from "react";

interface CollapsibleGroupProps {
  actions?: ReactNode;
  children: ReactNode;
  icon: ReactNode;
  id: string;
  onReset: () => void;
  onToggle: () => void;
  open: boolean;
  title: string;
}

interface ParameterActionsProps {
  label: string;
  locked: boolean;
  onLockToggle: () => void;
  onRemix: () => void;
  onReset: () => void;
}

export function ParameterActions({
  label,
  locked,
  onLockToggle,
  onRemix,
  onReset,
}: ParameterActionsProps) {
  return (
    <div className="design-overlay__parameter-actions" aria-label={`${label} actions`}>
      <button
        type="button"
        className="design-overlay__parameter-action"
        aria-label={`Remix ${label}`}
        disabled={locked}
        onClick={onRemix}
      >
        <Shuffle aria-hidden="true" />
      </button>
      <button
        type="button"
        className="design-overlay__parameter-action"
        aria-label={`Reset ${label}`}
        onClick={onReset}
      >
        <RotateCcw aria-hidden="true" />
      </button>
      <button
        type="button"
        className="design-overlay__parameter-action"
        aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
        aria-pressed={locked}
        data-active={locked}
        onClick={onLockToggle}
      >
        {locked ? <Lock aria-hidden="true" /> : <Unlock aria-hidden="true" />}
      </button>
    </div>
  );
}

export function CollapsibleGroup({
  actions,
  children,
  icon,
  id,
  onReset,
  onToggle,
  open,
  title,
}: CollapsibleGroupProps) {
  const contentId = `${id}-content`;

  return (
    <section className="design-overlay__group">
      <div className="design-overlay__group-header">
        <button
          type="button"
          className="design-overlay__group-toggle"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span className="design-overlay__group-icon">{icon}</span>
          <span>{title}</span>
          <ChevronDown aria-hidden="true" />
        </button>
        <div className="design-overlay__group-actions">
          {actions}
          <button
            type="button"
            className="design-overlay__group-reset"
            aria-label={`Reset ${title}`}
            onClick={onReset}
          >
            <RotateCcw aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id={contentId} className="design-overlay__group-content" hidden={!open}>
        {open ? children : null}
      </div>
    </section>
  );
}
