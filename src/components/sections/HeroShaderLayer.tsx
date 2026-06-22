import {
  FlutedGlass,
  HalftoneCmyk,
  HalftoneDots,
  ImageDithering,
  PaperTexture,
  Water,
} from "@paper-design/shaders-react";
import { useLayoutEffect, useReducer, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import {
  HERO_VISUAL_CHANGE_EVENT,
  getHeroVisualState,
  registerHeroVisualSyncRender,
  subscribeHeroVisual,
  type HeroVisualState,
} from "../overlay/heroBackgroundRuntime";
import {
  getHeroShaderRenderProps,
  measureHeroShaderDisplayScale,
} from "../overlay/heroShaderSelection";

const HERO_SHADER_RENDER_WIDTH = 1280;
const HERO_SHADER_RENDER_HEIGHT = 720;

function subscribeHeroShaderLayout(onStoreChange: () => void) {
  window.addEventListener("resize", onStoreChange);
  window.addEventListener(HERO_VISUAL_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("resize", onStoreChange);
    window.removeEventListener(HERO_VISUAL_CHANGE_EVENT, onStoreChange);
  };
}

export function HeroShaderLayer() {
  const [, forceRender] = useReducer((tick: number) => tick + 1, 0);
  const visual = useSyncExternalStore(
    subscribeHeroVisual,
    getHeroVisualState,
    getHeroVisualState,
  );
  const [readyImageUrl, setReadyImageUrl] = useState<string | null>(() =>
    visual.gradientDataUrl,
  );
  const displayScale = useSyncExternalStore(
    subscribeHeroShaderLayout,
    () =>
      visual.shaderEnabled && visual.shader
        ? measureHeroShaderDisplayScale(
            visual.shader.type,
            HERO_SHADER_RENDER_WIDTH,
            HERO_SHADER_RENDER_HEIGHT,
          )
        : 0,
    () => 0,
  );

  useLayoutEffect(() => {
    registerHeroVisualSyncRender(() => {
      flushSync(() => {
        forceRender();
      });
    });

    return () => {
      registerHeroVisualSyncRender(null);
    };
  }, []);

  useLayoutEffect(() => {
    const nextUrl = visual.gradientDataUrl;
    if (!nextUrl) return;

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      flushSync(() => {
        setReadyImageUrl(nextUrl);
      });
    };
    image.onerror = () => {
      if (cancelled) return;
      flushSync(() => {
        setReadyImageUrl(nextUrl);
      });
    };
    image.src = nextUrl;

    return () => {
      cancelled = true;
    };
  }, [visual.generation, visual.gradientDataUrl]);

  if (!visual.shaderEnabled || !visual.shader) {
    return null;
  }

  if (!readyImageUrl || readyImageUrl !== visual.gradientDataUrl) {
    return null;
  }

  if (displayScale <= 0) {
    return null;
  }

  return (
    <div className="hero-section__shader" aria-hidden="true">
      <div
        className="hero-section__shader-canvas"
        style={{
          width: HERO_SHADER_RENDER_WIDTH * displayScale,
          height: HERO_SHADER_RENDER_HEIGHT * displayScale,
        }}
      >
        <HeroShader imageUrl={readyImageUrl} shader={visual.shader} />
      </div>
    </div>
  );
}

function HeroShader({
  imageUrl,
  shader,
}: {
  imageUrl: string;
  shader: NonNullable<HeroVisualState["shader"]>;
}) {
  const shaderProps = getHeroShaderRenderProps(shader);
  const style =
    shader.type === "paper-texture"
      ? {
          width: "100%",
          height: "100%",
          display: "block",
          filter: "contrast(1.25) saturate(1.25) brightness(1.05)",
        }
      : {
          width: "100%",
          height: "100%",
          display: "block",
        };

  switch (shader.type) {
    case "paper-texture":
      return (
        <PaperTexture
          image={imageUrl}
          width={HERO_SHADER_RENDER_WIDTH}
          height={HERO_SHADER_RENDER_HEIGHT}
          {...shaderProps}
          style={style}
        />
      );
    case "fluted-glass":
      return (
        <FlutedGlass
          image={imageUrl}
          width={HERO_SHADER_RENDER_WIDTH}
          height={HERO_SHADER_RENDER_HEIGHT}
          {...shaderProps}
          style={style}
        />
      );
    case "water":
      return (
        <Water
          image={imageUrl}
          width={HERO_SHADER_RENDER_WIDTH}
          height={HERO_SHADER_RENDER_HEIGHT}
          {...shaderProps}
          style={style}
        />
      );
    case "image-dithering":
      return (
        <ImageDithering
          image={imageUrl}
          width={HERO_SHADER_RENDER_WIDTH}
          height={HERO_SHADER_RENDER_HEIGHT}
          {...shaderProps}
          style={style}
        />
      );
    case "halftone-dots":
      return (
        <HalftoneDots
          image={imageUrl}
          width={HERO_SHADER_RENDER_WIDTH}
          height={HERO_SHADER_RENDER_HEIGHT}
          {...shaderProps}
          style={style}
        />
      );
    case "halftone-cmyk":
      return (
        <HalftoneCmyk
          image={imageUrl}
          width={HERO_SHADER_RENDER_WIDTH}
          height={HERO_SHADER_RENDER_HEIGHT}
          {...shaderProps}
          style={style}
        />
      );
    default: {
      const unexpectedShader: never = shader.type;
      throw new Error(`Unsupported hero shader type: ${unexpectedShader}`);
    }
  }
}
