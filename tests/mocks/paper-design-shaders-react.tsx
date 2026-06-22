/* eslint-disable react-refresh/only-export-components */
import type { CSSProperties, ReactNode } from "react";

type ShaderStubProps = {
  height?: number;
  image?: string;
  style?: CSSProperties;
  width?: number;
};

function ShaderStub(props: ShaderStubProps) {
  return (
    <div
      aria-hidden="true"
      data-testid="hero-shader-stub"
      data-image={props.image ?? ""}
      style={props.style}
    />
  );
}

export const PaperTexture = ShaderStub;
export const FlutedGlass = ShaderStub;
export const Water = ShaderStub;
export const ImageDithering = ShaderStub;
export const HalftoneDots = ShaderStub;
export const HalftoneCmyk = ShaderStub;

export const paperTexturePresets = [{ name: "Default", params: {} }];
export const flutedGlassPresets = [{ name: "Default", params: {} }];
export const waterPresets = [{ name: "Default", params: {} }];
export const imageDitheringPresets = [{ name: "Default", params: {} }];
export const halftoneDotsPresets = [{ name: "Default", params: {} }];
export const halftoneCmykPresets = [{ name: "Default", params: {} }];

export function ShaderMount({ children }: { children?: ReactNode }) {
  return children ?? null;
}
