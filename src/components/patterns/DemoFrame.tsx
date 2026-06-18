import { Code2, Layers, MousePointer2, Palette, Repeat2 } from "lucide-react";
import { useMemo, useState } from "react";
import { track } from "../../lib/analytics";
import type { LandingPageContent } from "../../types/landing";
import { Badge, Button, Cluster, Stack } from "../primitives";

const layerIcons = [Palette, Code2, Layers, Repeat2, MousePointer2];

type DemoFrameProps = {
  demo: LandingPageContent["demo"];
  hero: LandingPageContent["hero"];
  layers: LandingPageContent["layers"];
};

export function DemoFrame({ demo, hero, layers }: DemoFrameProps) {
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedModule, setSelectedModule] = useState(() =>
    Math.min(1, demo.modules.length - 1),
  );

  const activeLayerIndex = Math.min(selectedLayer, layers.length - 1);
  const activeModuleIndex = Math.min(selectedModule, demo.modules.length - 1);
  const activeLayer = layers[activeLayerIndex];
  const activeModule = demo.modules[activeModuleIndex];

  const contractLines = useMemo(
    () => [
      `section: "${activeModule}"`,
      `uses: "${activeLayer.title}"`,
      "container: lg",
      "variant: default",
    ],
    [activeLayer.title, activeModule],
  );

  return (
    <div className="demo-frame">
      <div className="demo-frame__sidebar">
        <p className="demo-frame__label">System layers</p>
        <div className="demo-layer-list">
          {layers.map((layer, index) => {
            const Icon = layerIcons[index] ?? Layers;
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
                <Icon aria-hidden="true" size={16} />
                <span>{layer.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="demo-frame__canvas">
        <div className="demo-preview">
          <div className="demo-preview__nav" />
          <div className="demo-preview__hero">
            <span />
            <strong>{hero.title}</strong>
            <p>{hero.description}</p>
          </div>
          <div className="demo-preview__stack">
            {demo.modules.map((module, index) => (
              <button
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
                <span>{module}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="demo-inspector">
          <Cluster className="demo-inspector__top" gap="sm">
            <Badge tone="accent">{activeLayer.title}</Badge>
            <span>{activeModule}</span>
          </Cluster>
          <p>{activeLayer.description}</p>
          <div className="demo-code" aria-label="Selected section contract">
            {contractLines.map((line) => (
              <code key={line}>{line}</code>
            ))}
          </div>
          <Stack gap="sm">
            {demo.tokenSets.map((token) => (
              <div className="token-row" key={token.label}>
                <span className="token-row__swatch" data-swatch={token.swatch} />
                <span>{token.label}</span>
                <strong>{token.value}</strong>
              </div>
            ))}
          </Stack>
          <Button
            analyticsEvent="demo_played"
            className="demo-frame__button"
            size="sm"
            type="button"
            variant="secondary"
          >
            Inspect contract
          </Button>
        </div>
      </div>
    </div>
  );
}
