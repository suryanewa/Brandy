export type DesignOverlayTab = "design" | "sections";

interface DesignOverlayTabsProps {
  activeTab: DesignOverlayTab;
  onChange: (tab: DesignOverlayTab) => void;
}

export function DesignOverlayTabs({ activeTab, onChange }: DesignOverlayTabsProps) {
  return (
    <div className="design-overlay__tabs" role="tablist" aria-label="Settings panels">
      {(["design", "sections"] as const).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={activeTab === tab}
          onClick={() => onChange(tab)}
        >
          {tab === "design" ? "Design" : "Sections"}
        </button>
      ))}
    </div>
  );
}
