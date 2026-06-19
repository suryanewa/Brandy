import { type HTMLAttributes } from "react";
import { type shapeTypes } from "coolshapes-react";
import { parseCoolshapeId } from "../../lib/lockupTheme.mjs";

export const CUSTOM_BRAND_MARK_IDS = [
  "square",
  "rounded-square",
  "triangle",
  "rounded-triangle",
  "rounded-diamond",
  "diamond",
  "circle",
  "four-square-grid",
  "four-triangle-grid",
  "four-circle-grid",
] as const;

export type CustomBrandMarkId = (typeof CUSTOM_BRAND_MARK_IDS)[number];
export type CoolshapeBrandMarkId = `coolshape:${shapeTypes}:${number}`;
export type BrandMarkId = CustomBrandMarkId | CoolshapeBrandMarkId;

export interface BrandLockupProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  label?: string;
  live?: boolean;
  mark?: BrandMarkId | string;
  name?: string;
}

export type ResolvedBrandMark =
  | {
      id: CustomBrandMarkId;
      kind: "custom";
    }
  | {
      id: CoolshapeBrandMarkId;
      index: number;
      kind: "coolshape";
      type: shapeTypes;
    };

const customBrandMarkIdSet = new Set<string>(CUSTOM_BRAND_MARK_IDS);
const customBrandMarkAliases = new Map<string, CustomBrandMarkId>([
  ["rounded_square", "rounded-square"],
  ["rounded_triangle", "rounded-triangle"],
  ["rounded_diamond", "rounded-diamond"],
  ["grid_squares", "four-square-grid"],
  ["grid_triangles", "four-triangle-grid"],
  ["grid_circles", "four-circle-grid"],
]);
const defaultBrandMarkId: CoolshapeBrandMarkId = "coolshape:star:0";

export function resolveBrandMark(mark: BrandLockupProps["mark"]): ResolvedBrandMark {
  if (typeof mark === "string") {
    const coolshapeMark = parseCoolshapeId(normalizeLegacyCoolshapeId(mark));
    if (coolshapeMark) {
      return {
        id: `coolshape:${coolshapeMark.type}:${coolshapeMark.index}`,
        index: coolshapeMark.index,
        kind: "coolshape",
        type: coolshapeMark.type as shapeTypes,
      };
    }

    const customMark = customBrandMarkAliases.get(mark) ?? mark;
    if (customBrandMarkIdSet.has(customMark)) {
      return {
        id: customMark as CustomBrandMarkId,
        kind: "custom",
      };
    }
  }

  return resolveBrandMark(defaultBrandMarkId);
}

function normalizeLegacyCoolshapeId(mark: string): string {
  const legacyMatch = /^([a-z]+)-(\d+)$/.exec(mark);
  if (!legacyMatch) return mark;

  return `coolshape:${legacyMatch[1]}:${legacyMatch[2]}`;
}
