import { useState } from "react";
import { track } from "../../lib/analytics";
import type { LandingPageContent } from "../../types/landing";

type DemoFrameProps = {
  demo: LandingPageContent["demo"];
  hero: LandingPageContent["hero"];
  layers: LandingPageContent["layers"];
};

export function DemoFrame({ demo, layers }: DemoFrameProps) {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedModule, setSelectedModule] = useState(() =>
    Math.min(1, demo.modules.length - 1),
  );

  const activeLayerIndex = Math.min(selectedLayer, layers.length - 1);
  const activeModuleIndex = Math.min(selectedModule, demo.modules.length - 1);

  return (
    <div className="demo-frame">
      <div className="demo-frame__sidebar">
        <div className="demo-frame__label" aria-hidden="true" />
        <div className="demo-layer-list">
          {layers.map((layer, index) => {
            const isActive = index === activeLayerIndex;

            return (
              <button
                aria-label={layer.title}
                aria-pressed={isActive}
                className="demo-layer"
                data-active={isActive}
                key={layer.title}
                onClick={() => {
                  setSelectedLayer(index);
                  track("demo_layer_selected", { layer: layer.title });
                }}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="demo-frame__canvas">
        <div className="demo-preview">
          <div className="demo-preview__nav" />
          <div className="demo-preview__hero">
            <span aria-hidden="true" />
            <i aria-hidden="true" />
            <b aria-hidden="true" />
          </div>
          <div className="demo-preview__stack">
            {demo.modules.map((module, index) => (
              <button
                aria-label={module}
                aria-pressed={index === activeModuleIndex}
                className="demo-module"
                data-selected={index === activeModuleIndex}
                key={module}
                onClick={() => {
                  setSelectedModule(index);
                  track("demo_module_selected", { module });
                }}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div className="demo-inspector">
          <div className="demo-inspector__top" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="demo-inspector__summary" aria-hidden="true" />
          <div className="demo-code" aria-label="Selected section contract">
            <code aria-hidden="true" />
            <code aria-hidden="true" />
            <code aria-hidden="true" />
            <code aria-hidden="true" />
          </div>
          <div className="demo-token-stack" aria-hidden="true">
            {demo.tokenSets.map((token) => (
              <div className="token-row" key={token.label}>
                <span className="token-row__swatch" data-swatch={token.swatch} />
                <span />
                <strong />
              </div>
            ))}
          </div>
          <button
            aria-label="Inspect contract"
            className="demo-frame__button"
            onClick={() => track("demo_played")}
            type="button"
          />
        </div>
      </div>
    </div>
  );
}
